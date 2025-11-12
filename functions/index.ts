// ====================================================================
// functions/src/index.ts
// **FINAL, VERIFIED VERSION** CLOUD FUNCTIONS CODE FOR SALES REP ONBOARDING & STRIPE
// Includes all fixes: v2 syntax, rawBody workaround, process.env, and local discovery bypass.
// ====================================================================

// --- IMPORTS ---
// Core Firebase Functions v2 imports
import { onCall, onRequest, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';
// No longer importing 'config' from 'firebase-functions' as it's deprecated for v2

// Firebase Admin SDK imports
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Third-party library imports
import Stripe from 'stripe';
import { Request, Response } from 'express';


// --- GLOBAL INITIALIZATION FOR FIREBASE ADMIN SDK ---
initializeApp();
const db = getFirestore();
const auth = getAuth();


// --- STRIPE INITIALIZATION WITH CONFIGURATION CHECK AND LOCAL DISCOVERY BYPASS ---
let stripeSecretKey: string;
let stripeWebhookSecret: string;
let stripeClient: Stripe | null = null; // Use null initially, and then assign the Stripe client

try {
    stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
    stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    // Check if environment variables are actually set with non-placeholder values
    // Note: 'YOUR_ACTUAL_STRIPE_SECRET_KEY_HERE' is a literal placeholder.
    // It should be replaced by actual keys in .env for local discovery to work,
    // or by Firebase --env-vars for deployment.
    const isSecretKeyInvalid = !stripeSecretKey || stripeSecretKey.includes('YOUR_ACTUAL_STRIPE_SECRET_KEY_HERE');
    const isWebhookSecretInvalid = !stripeWebhookSecret || stripeWebhookSecret.includes('YOUR_ACTUAL_STRIPE_WEBHOOK_SECRET_HERE');

    // Check if running in a local emulator or during CLI discovery.
    // This variable is set by the Firebase CLI when it loads functions locally.
    const isLocalDiscoveryOrEmulator = process.env.FUNCTIONS_EMULATOR === "true";

    if (isLocalDiscoveryOrEmulator && (isSecretKeyInvalid || isWebhookSecretInvalid)) {
        logger.warn("Stripe environment variables are missing/invalid during local discovery/emulator startup. This is expected if not explicitly set for local environment. Stripe client will be a dummy for local analysis. Deployed functions will use configured --env-vars.");
        // Assign dummy values to allow local discovery to proceed without crashing
        stripeSecretKey = "sk_test_DUMMY_KEY_FOR_LOCAL_DISCOVERY_ONLY";
        stripeWebhookSecret = "whsec_DUMMY_KEY_FOR_LOCAL_DISCOVERY_ONLY";
        // Initialize with dummy values so the 'stripe' constant gets a valid (though non-functional) Stripe instance.
        stripeClient = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });
    } else {
        // This path is for deployed environments or if local env vars are correctly set.
        if (isSecretKeyInvalid) {
            logger.error("CRITICAL ERROR: STRIPE_SECRET_KEY environment variable is missing or invalid. This will cause Stripe operations to fail.");
            throw new Error("Stripe secret key is not properly configured. Cannot initialize Stripe.");
        }
        if (isWebhookSecretInvalid) {
            logger.error("CRITICAL ERROR: STRIPE_WEBHOOK_SECRET environment variable is missing or invalid. This will cause Stripe webhook verification to fail.");
            throw new Error("Stripe webhook secret is not properly configured. Cannot initialize Stripe.");
        }

        // Initialize the real Stripe client
        stripeClient = new Stripe(stripeSecretKey, {
            apiVersion: '2023-10-16',
        });
        logger.info("Stripe client successfully initialized.");
    }

} catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    logger.error("Error during Stripe client initialization (global scope):", errorMessage);
    // If an unexpected error occurs during initialization, we must still prevent the global process from crashing
    // so the CLI can discover the function definitions.
    stripeClient = null; // Ensure client is null if there's an unexpected init error.
    // We do NOT re-throw here to allow local discovery to complete.
}

// Assign the stripeClient to a constant. If it's null (due to unexpected error), use a dummy to avoid type errors.
const stripe = stripeClient || ({} as Stripe); // If stripeClient is null, use a dummy object for type safety.

// ====================================================================
// 1. createInitialSalesRepProfile (HTTPS Callable - V2 Syntax)
// Purpose: Creates initial Firestore profile for new sales reps.
// ====================================================================
exports.createInitialSalesRepProfile = onCall<{ name?: string }, Promise<{ message: string }>>(async (request: CallableRequest<{ name?: string }>) => {
    const { data, auth: callableAuth } = request;

    if (!callableAuth) {
        throw new HttpsError('unauthenticated', 'You must be logged in to create an initial profile.');
    }

    const repUid = callableAuth.uid;
    const repEmail = callableAuth.token?.email as string;
    const name = data?.name;

    if (!name || typeof name !== 'string' || name.trim() === '') {
        throw new HttpsError('invalid-argument', 'Rep name is required.');
    }

    try {
        const repRef = db.collection('salesReps').doc(repUid);
        await repRef.set({
            uid: repUid,
            name: name,
            email: repEmail,
            accountStatus: "unsubscribed",
            creditsRemaining: 0,
            createdAt: FieldValue.serverTimestamp(),
            lastLoginAt: FieldValue.serverTimestamp()
        }, { merge: true });

        logger.info(`Initial sales rep profile created for ${repUid} (${repEmail}).`);
        return { message: 'Initial sales rep profile created successfully.' };

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('Error creating initial sales rep profile:', errorMessage);
        throw new HttpsError('internal', 'Failed to create initial sales rep profile.', errorMessage);
    }
});


// ====================================================================
// 2. createStripeCheckoutSession (HTTPS Callable - V2 Syntax)
// Purpose: Creates a Stripe Checkout Session for buying credits/subscription plans.
// ====================================================================
exports.createStripeCheckoutSession = onCall<{ planId?: string }, Promise<{ sessionId: string }>>(async (request: CallableRequest<{ planId?: string }>) => {
    const { data, auth: callableAuth } = request;

    if (!callableAuth) {
        throw new HttpsError('unauthenticated', 'You must be logged in to create a checkout session.');
    }
    const repUid = callableAuth.uid;
    const planId = data?.planId;

    if (!planId || typeof planId !== 'string' || planId.trim() === '') {
        throw new HttpsError('invalid-argument', 'A plan ID is required.');
    }

    // Check if Stripe was successfully initialized (for deployed function context)
    if (!stripeClient) {
        logger.error('Stripe client not initialized during createStripeCheckoutSession call. Likely missing secret keys.');
        throw new HttpsError('unavailable', 'Payment service is unavailable. Please try again later.');
    }

    try {
        const planDoc = await db.collection('subscriptionPlans').doc(planId).get();
        if (!planDoc.exists) {
            logger.error(`Subscription plan ${planId} not found.`);
            throw new HttpsError('not-found', 'The selected subscription plan was not found.');
        }
        const planData = planDoc.data();

        if (!planData || typeof planData.stripePriceId !== 'string' || typeof planData.includedCredits !== 'number') {
            logger.error(`Subscription plan ${planId} is missing or has invalid stripePriceId or includedCredits. Data:`, planData);
            throw new HttpsError('internal', 'Invalid plan configuration.');
        }

        const session = await stripe.checkout.sessions.create({ // Use stripeClient here
            payment_method_types: ['card'],
            line_items: [{
                price: planData.stripePriceId,
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `https://your-app-domain.com/confirm-payment?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `https://your-app-domain.com/buy-credits?canceled=true`,
            metadata: {
                repUid: repUid,
                planId: planId,
                creditsToAward: planData.includedCredits.toString()
            }
        });

        return { sessionId: session.id };

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error("Error creating Stripe Checkout Session:", errorMessage);
        throw new HttpsError('internal', 'Failed to create Stripe Checkout session.', errorMessage);
    }
});


// ====================================================================
// 3. stripeWebhookHandler (HTTP Function - V2 Syntax)
// Purpose: Securely processes Stripe payment events via webhook.
// ====================================================================
exports.stripeWebhookHandler = onRequest(async (request: Request, response: Response): Promise<void> => {
    if (request.method !== 'POST') {
        logger.warn('Webhook received non-POST request.');
        response.status(405).end();
        return;
    }

    // Check if Stripe was successfully initialized (for deployed function context)
    if (!stripeClient) {
        logger.error('Stripe client not initialized during stripeWebhookHandler call. Likely missing secret keys.');
        response.status(503).send('Stripe service unavailable.');
        return;
    }

    // Access rawBody via bracket notation on an 'any' cast to bypass strict typing
    const rawBody = (request as any).rawBody as Buffer | undefined;

    if (!rawBody) {
         logger.error('Stripe webhook received request without rawBody. Ensure express.json({verify: addRawBody}) or similar middleware is used if not provided by default.');
         response.status(400).send('Webhook Error: Missing raw body.');
         return;
    }

    const sig = request.headers['stripe-signature'];
    let event: Stripe.Event;

    try {
        const endpointSecret = stripeWebhookSecret; // Use the globally obtained secret
        if (!endpointSecret || endpointSecret.includes('YOUR_ACTUAL_STRIPE_WEBHOOK_SECRET_HERE')) {
            logger.error('Stripe webhook secret is not configured or is placeholder in runtime environment.');
            response.status(500).send('Webhook secret not configured.');
            return;
        }

        event = stripe.webhooks.constructEvent(rawBody, sig as string, endpointSecret); // Use stripeClient here

    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        logger.error(`Stripe Webhook signature verification failed: ${errorMessage}`);
        response.status(400).send(`Webhook Error: ${errorMessage}`);
        return;
    }

    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object as Stripe.Checkout.Session;
            logger.info('Stripe Event: checkout.session.completed - Session ID:', session.id);

            const repUid = session.metadata?.repUid;
            const planId = session.metadata?.planId;
            const creditsToAward = parseInt(session.metadata?.creditsToAward || '0', 10);

            if (!repUid || typeof repUid !== 'string' || repUid.trim() === '' ||
                !planId || typeof planId !== 'string' || planId.trim() === '' ||
                isNaN(creditsToAward)) {
                logger.error(`Missing or invalid metadata for session ${session.id}. repUid: ${repUid}, planId: ${planId}, creditsToAward: ${session.metadata?.creditsToAward}`);
                response.status(400).send('Missing or invalid metadata.');
                return;
            }

            try {
                await db.runTransaction(async (transaction) => {
                    const repRef = db.collection('salesReps').doc(repUid);
                    const repDoc = await transaction.get(repRef);

                    if (!repDoc.exists) {
                        logger.error(`Webhook Error: Sales rep document not found for UID: ${repUid} (from session metadata).`);
                        throw new Error(`Sales rep ${repUid} not found.`);
                    }

                    const salesRepData = repDoc.data();
                    const currentCredits = salesRepData?.creditsRemaining || 0;

                    transaction.update(repRef, {
                        creditsRemaining: currentCredits + creditsToAward,
                        subscriptionPlanId: planId,
                        lastCreditPurchaseAt: FieldValue.serverTimestamp(),
                        accountStatus: 'active'
                    });

                    await auth.setCustomUserClaims(repUid, { isSalesRep: true });
                    logger.info(`isSalesRep custom claim set for ${repUid}`);
                });

                logger.info(`Successfully awarded ${creditsToAward} credits to rep ${repUid} for plan ${planId}.`);
                response.send({ received: true });
                return;

            } catch (firestoreError: unknown) {
                const errorMessage = firestoreError instanceof Error ? firestoreError.message : String(firestoreError);
                logger.error(`Firestore transaction failed for session ${session.id} (repUid: ${repUid}):`, errorMessage);
                response.status(500).send(`Firestore update failed: ${errorMessage}`);
                return;
            }

        case 'customer.subscription.deleted':
            const deletedSubscription = event.data.object as Stripe.Subscription;
            logger.info('Stripe Event: customer.subscription.deleted - Subscription ID:', deletedSubscription.id);
            response.send({ received: true });
            return;

        default:
            logger.info(`Unhandled event type ${event.type}`);
            response.send({ received: true });
            return;
    }
});


// ====================================================================
// 4. activateCustomerTrialAndDeductCredits (HTTPS Callable - V2 Syntax)
// Purpose: Activates a customer's trial, deducting credits from the rep.
// ====================================================================
exports.activateCustomerTrialAndDeductCredits = onCall<{
    name?: string;
    customerNumber?: string;
    referredByRepId?: string;
    trialTypeId?: string;
}, Promise<{ message: string; trialEndDate: string; planAccess: any }>>(async (request: CallableRequest<{
    name?: string;
    customerNumber?: string;
    referredByRepId?: string;
    trialTypeId?: string;
}>) => {
    const { data, auth: callableAuth } = request;

    if (!callableAuth) {
        logger.error('Function called without authentication context.');
        throw new HttpsError('unauthenticated', 'You must be logged in to activate a trial.');
    }

    const customerUid = callableAuth.uid;
    const customerEmail = callableAuth.token?.email as string;
    const { name, customerNumber, referredByRepId, trialTypeId } = data;

    // Input Validations
    if (!name || typeof name !== 'string' || name.trim() === '') {
        throw new HttpsError('invalid-argument', 'Customer name is required.');
    }
    if (!customerNumber || typeof customerNumber !== 'string' || customerNumber.trim() === '') {
        throw new HttpsError('invalid-argument', 'Customer number is required.');
    }
    if (!referredByRepId || typeof referredByRepId !== 'string' || referredByRepId.trim() === '') {
        throw new HttpsError('invalid-argument', 'Referring sales rep ID is required.');
    }
    if (!trialTypeId || typeof trialTypeId !== 'string' || trialTypeId.trim() === '') {
        throw new HttpsError('invalid-argument', 'Trial type ID is required.');
    }

    try {
        const result = await db.runTransaction(async (transaction) => {
            const customerProfileRef = db.collection('userProfiles').doc(customerUid);
            const salesRepRef = db.collection('salesReps').doc(referredByRepId);
            const trialTypeRef = db.collection('trialLinkTypes').doc(trialTypeId);

            const [customerProfileDoc, salesRepDoc, trialTypeDoc] = await Promise.all([
                transaction.get(customerProfileRef),
                transaction.get(salesRepRef),
                transaction.get(trialTypeRef)
            ]);

            if (!salesRepDoc.exists) {
                logger.error(`Validation Error: Sales rep ${referredByRepId} not found.`);
                throw new HttpsError('not-found', 'Referring sales rep not found.');
            }
            const salesRepData = salesRepDoc.data();
            if (!salesRepData || salesRepData.accountStatus !== 'active') {
                logger.error(`Validation Error: Sales rep ${referredByRepId} is not active. Status: ${salesRepData?.accountStatus}`);
                throw new HttpsError('failed-precondition', 'Referring sales rep account is not active.');
            }

            if (!trialTypeDoc.exists) {
                logger.error(`Validation Error: Trial type ${trialTypeId} not found.`);
                throw new HttpsError('not-found', 'Trial type not found.');
            }
            const trialTypeData = trialTypeDoc.data();
            const creditsCost = trialTypeData?.creditsCost || 1;
            const trialDurationDays = trialTypeData?.trialDurationDays || 7;
            const planAccessLevel = trialTypeData?.planAccessLevel || 'free';

            if (customerProfileDoc.exists) {
                const customerData = customerProfileDoc.data();
                if (customerData?.trialStatus === 'active') {
                    logger.warn(`Customer ${customerUid} already has an active trial.`);
                    throw new HttpsError('already-exists', 'You already have an active trial.');
                }
                if (customerData?.referredByRepId) {
                    logger.warn(`Customer ${customerUid} is already linked to rep ${customerData.referredByRepId}.`);
                    throw new HttpsError('already-exists', 'You have already been referred by a sales rep.');
                }
            }

            const currentCredits = salesRepData.creditsRemaining || 0;
            if (currentCredits < creditsCost) {
                logger.error(`Resource Exhausted: Sales rep ${referredByRepId} has ${currentCredits} credits, but ${creditsCost} are needed.`);
                throw new HttpsError('resource-exhausted', 'Referring sales rep has insufficient credits to activate this trial.');
            }

            const trialEndDate = Timestamp.fromMillis(
                Date.now() + (trialDurationDays * 24 * 60 * 60 * 1000)
            );

            transaction.update(salesRepRef, {
                creditsRemaining: FieldValue.increment(-creditsCost),
                associatedCustomersCount: FieldValue.increment(1)
            });

            transaction.set(customerProfileRef, {
                name: name,
                email: customerEmail,
                customerNumber: customerNumber,
                referredByRepId: referredByRepId,
                trialTypeActivated: trialTypeId,
                trialStatus: 'active',
                trialEndDate: trialEndDate,
                currentPlanAccess: planAccessLevel,
                createdAt: customerProfileDoc.exists ? (customerProfileDoc.data()?.createdAt || FieldValue.serverTimestamp()) : FieldValue.serverTimestamp(),
                lastUpdated: FieldValue.serverTimestamp()
            }, { merge: true });

            logger.info(`Trial activated for customer ${customerUid} (email: ${customerEmail}) by rep ${referredByRepId} for trialType ${trialTypeId}. ${creditsCost} credits deducted.`);
            return {
                message: 'Trial activated successfully!',
                trialEndDate: trialEndDate.toDate().toISOString(),
                planAccess: planAccessLevel
            };
        });

        return result;

    } catch (error: unknown) {
        if (error instanceof HttpsError) {
            logger.error(`Caught HttpsError: ${error.code} - ${error.message} (Details: ${error.details})`);
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error("Unexpected Error in activateCustomerTrialAndDeductCredits:", errorMessage);
        throw new HttpsError('internal', 'Failed to activate trial due to an unexpected server error.', errorMessage);
    }
});
