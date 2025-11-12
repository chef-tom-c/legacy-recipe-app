"use strict";
// ====================================================================
// functions/src/index.ts
// **FINAL, VERIFIED VERSION** CLOUD FUNCTIONS CODE FOR SALES REP ONBOARDING & STRIPE
// Includes all fixes: v2 syntax, rawBody workaround, process.env, and local discovery bypass.
// ====================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateCustomerTrialAndDeductCredits = exports.stripeWebhookHandler = exports.createStripeCheckoutSession = exports.createInitialSalesRepProfile = void 0;
// --- IMPORTS ---
// Core Firebase Functions v2 imports
const https_1 = require("firebase-functions/v2/https");
const v2_1 = require("firebase-functions/v2");
// No longer importing 'config' from 'firebase-functions' as it's deprecated for v2
// Firebase Admin SDK imports
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("firebase-admin/auth");
// Third-party library imports
const stripe_1 = __importDefault(require("stripe")); // Correct import for Stripe in TypeScript
// --- GLOBAL INITIALIZATION FOR FIREBASE ADMIN SDK ---
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
const auth = (0, auth_1.getAuth)(); // Explicitly type Auth
// ... (imports and global init) ...
// --- STRIPE INITIALIZATION WITH CONFIGURATION CHECK AND LOCAL DISCOVERY BYPASS ---
let stripeSecretKey = '';
let stripeWebhookSecret = '';
let stripeClient = null;
try {
    stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
    stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    // K_SERVICE is only set when deployed to Cloud Run/Functions. If undefined, we're in local dev/discovery.
    const isLocalOrDiscovery = process.env.K_SERVICE === undefined;
    if (isLocalOrDiscovery) {
        // During CLI deployment analysis or local emulator, secrets are not set or are placeholders.
        // Always use dummy values here to prevent any global scope errors and allow CLI to discover functions.
        stripeClient = new stripe_1.default("sk_test_DUMMY_KEY_FOR_LOCAL_DISCOVERY_ONLY", { apiVersion: '2023-10-16' });
        v2_1.logger.warn("Stripe client initialized with dummy keys for local discovery/emulator. Real functions will use configured secrets.");
    }
    else {
        // This path is for deployed Cloud Functions. Secrets *must* be present.
        const isSecretKeyMissing = !stripeSecretKey || stripeSecretKey.includes('YOUR_ACTUAL_STRIPE_SECRET_KEY_HERE');
        const isWebhookSecretMissing = !stripeWebhookSecret || stripeWebhookSecret.includes('YOUR_ACTUAL_STRIPE_WEBHOOK_SECRET_HERE');
        if (isSecretKeyMissing || isWebhookSecretMissing) {
            v2_1.logger.error("CRITICAL ERROR: Stripe environment variables are missing or invalid in deployed environment. Functions depending on Stripe will likely fail.");
            stripeClient = null; // Mark as uninitialized, functions will check for this.
        }
        else {
            // All good, initialize the real Stripe client
            stripeClient = new stripe_1.default(stripeSecretKey, {
                apiVersion: '2023-10-16',
            });
            v2_1.logger.info("Stripe client successfully initialized in deployed environment.");
        }
    }
}
catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    v2_1.logger.error("Unexpected Error during Stripe client global initialization:", errorMessage + ". Stripe client set to null.");
    stripeClient = null;
}
// No 'const stripe' here, use stripeClient directly in functions and ensure checks.
// Assign the stripeClient to a constant. If it's null (due to unexpected error), use a dummy to avoid type errors.
// Note: This 'stripe' constant will only be a non-functional object if stripeClient is null due to an error,
// but for type safety it allows access to expected properties without crashing the TS compiler.
// ====================================================================
// 1. createInitialSalesRepProfile (HTTPS Callable - V2 Syntax)
// Purpose: Creates initial Firestore profile for new sales reps.
// ====================================================================
exports.createInitialSalesRepProfile = (0, https_1.onCall)(async (request) => {
    var _a;
    const { data, auth: callableAuth } = request;
    if (!callableAuth) {
        throw new https_1.HttpsError('unauthenticated', 'You must be logged in to create an initial profile.');
    }
    const repUid = callableAuth.uid;
    const repEmail = (_a = callableAuth.token) === null || _a === void 0 ? void 0 : _a.email;
    const name = data === null || data === void 0 ? void 0 : data.name;
    if (!name || typeof name !== 'string' || name.trim() === '') {
        throw new https_1.HttpsError('invalid-argument', 'Rep name is required.');
    }
    try {
        const repRef = db.collection('salesReps').doc(repUid);
        await repRef.set({
            uid: repUid,
            name: name,
            email: repEmail,
            accountStatus: "unsubscribed",
            creditsRemaining: 0,
            createdAt: firestore_1.FieldValue.serverTimestamp(),
            lastLoginAt: firestore_1.FieldValue.serverTimestamp()
        }, { merge: true });
        v2_1.logger.info(`Initial sales rep profile created for ${repUid} (${repEmail}).`);
        return { message: 'Initial sales rep profile created successfully.' };
    }
    catch (error) { // Catch as unknown
        const errorMessage = error instanceof Error ? error.message : String(error);
        v2_1.logger.error('Error creating initial sales rep profile:', errorMessage);
        throw new https_1.HttpsError('internal', 'Failed to create initial sales rep profile.', errorMessage);
    }
});
// ====================================================================
// 2. createStripeCheckoutSession (HTTPS Callable - V2 Syntax)
// Purpose: Creates a Stripe Checkout Session for buying credits/subscription plans.
// ====================================================================
exports.createStripeCheckoutSession = (0, https_1.onCall)(async (request) => {
    const { data, auth: callableAuth } = request;
    if (!callableAuth) {
        throw new https_1.HttpsError('unauthenticated', 'You must be logged in to create a checkout session.');
    }
    const repUid = callableAuth.uid;
    const planId = data === null || data === void 0 ? void 0 : data.planId;
    if (!planId || typeof planId !== 'string' || planId.trim() === '') {
        throw new https_1.HttpsError('invalid-argument', 'A plan ID is required.');
    }
    if (!stripeClient) {
        v2_1.logger.error('Stripe client not initialized during createStripeCheckoutSession call. Likely missing secret keys.');
        throw new https_1.HttpsError('unavailable', 'Payment service is unavailable. Please try again later.');
    }
    try {
        const planDoc = await db.collection('subscriptionPlans').doc(planId).get();
        if (!planDoc.exists) {
            v2_1.logger.error(`Subscription plan ${planId} not found.`);
            throw new https_1.HttpsError('not-found', 'The selected subscription plan was not found.');
        }
        const planData = planDoc.data();
        if (!planData || typeof planData.stripePriceId !== 'string' || typeof planData.includedCredits !== 'number') {
            v2_1.logger.error(`Subscription plan ${planId} is missing or has invalid stripePriceId or includedCredits. Data:`, planData);
            throw new https_1.HttpsError('internal', 'Invalid plan configuration.');
        }
        const session = await stripeClient.checkout.sessions.create({
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
    }
    catch (error) { // Catch as unknown
        const errorMessage = error instanceof Error ? error.message : String(error);
        v2_1.logger.error("Error creating Stripe Checkout Session:", errorMessage);
        throw new https_1.HttpsError('internal', 'Failed to create Stripe Checkout session.', errorMessage);
    }
});
// ====================================================================
// 3. stripeWebhookHandler (HTTP Function - V2 Syntax)
// Purpose: Securely processes Stripe payment events via webhook.
// ====================================================================
exports.stripeWebhookHandler = (0, https_1.onRequest)(async (request, response) => {
    var _a, _b, _c, _d;
    if (request.method !== 'POST') {
        v2_1.logger.warn('Webhook received non-POST request.');
        response.status(405).end();
        return;
    }
    if (!stripeClient) {
        v2_1.logger.error('Stripe client not initialized during stripeWebhookHandler call. Likely missing secret keys.');
        response.status(503).send('Stripe service unavailable.');
        return;
    }
    // Access rawBody via bracket notation on an 'any' cast to bypass strict typing
    // Firebase Functions V2 rawBody is typed, but if it's missing, it's a server config issue.
    const rawBody = request.rawBody;
    if (!rawBody) {
        v2_1.logger.error('Stripe webhook received request without rawBody. Ensure express.json({verify: addRawBody}) or similar middleware is used if not provided by default.');
        response.status(400).send('Webhook Error: Missing raw body.');
        return;
    }
    const sig = request.headers['stripe-signature'];
    let event; // Explicitly type Stripe.Event
    try {
        const endpointSecret = stripeWebhookSecret;
        if (!endpointSecret || endpointSecret.includes('YOUR_ACTUAL_STRIPE_WEBHOOK_SECRET_HERE')) {
            v2_1.logger.error('Stripe webhook secret is not configured or is placeholder in runtime environment.');
            response.status(500).send('Webhook secret not configured.');
            return;
        }
        event = stripeClient.webhooks.constructEvent(rawBody, sig, endpointSecret); // Use stripeClient here, cast sig to string
    }
    catch (err) { // Catch as unknown
        const errorMessage = err instanceof Error ? err.message : String(err);
        v2_1.logger.error(`Stripe Webhook signature verification failed: ${errorMessage}`);
        response.status(400).send(`Webhook Error: ${errorMessage}`);
        return;
    }
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object; // Cast to specific Stripe object
            v2_1.logger.info('Stripe Event: checkout.session.completed - Session ID:', session.id);
            const repUid = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.repUid;
            const planId = (_b = session.metadata) === null || _b === void 0 ? void 0 : _b.planId;
            const creditsToAward = parseInt(((_c = session.metadata) === null || _c === void 0 ? void 0 : _c.creditsToAward) || '0', 10);
            if (!repUid || typeof repUid !== 'string' || repUid.trim() === '' ||
                !planId || typeof planId !== 'string' || planId.trim() === '' ||
                isNaN(creditsToAward)) {
                v2_1.logger.error(`Missing or invalid metadata for session ${session.id}. repUid: ${repUid}, planId: ${planId}, creditsToAward: ${(_d = session.metadata) === null || _d === void 0 ? void 0 : _d.creditsToAward}`);
                response.status(400).send('Missing or invalid metadata.');
                return;
            }
            try {
                await db.runTransaction(async (transaction) => {
                    const repRef = db.collection('salesReps').doc(repUid);
                    const repDoc = await transaction.get(repRef);
                    if (!repDoc.exists) {
                        v2_1.logger.error(`Webhook Error: Sales rep document not found for UID: ${repUid} (from session metadata).`);
                        throw new Error(`Sales rep ${repUid} not found.`);
                    }
                    const salesRepData = repDoc.data();
                    const currentCredits = (salesRepData === null || salesRepData === void 0 ? void 0 : salesRepData.creditsRemaining) || 0; // Cast to number
                    transaction.update(repRef, {
                        creditsRemaining: currentCredits + creditsToAward,
                        subscriptionPlanId: planId,
                        lastCreditPurchaseAt: firestore_1.FieldValue.serverTimestamp(),
                        accountStatus: 'active'
                    });
                    await auth.setCustomUserClaims(repUid, { isSalesRep: true });
                    v2_1.logger.info(`isSalesRep custom claim set for ${repUid}`);
                });
                v2_1.logger.info(`Successfully awarded ${creditsToAward} credits to rep ${repUid} for plan ${planId}.`);
                response.send({ received: true });
                return;
            }
            catch (firestoreError) { // Catch as unknown
                const errorMessage = firestoreError instanceof Error ? firestoreError.message : String(firestoreError);
                v2_1.logger.error(`Firestore transaction failed for session ${session.id} (repUid: ${repUid}):`, errorMessage);
                response.status(500).send(`Firestore update failed: ${errorMessage}`);
                return;
            }
        case 'customer.subscription.deleted':
            const deletedSubscription = event.data.object;
            v2_1.logger.info('Stripe Event: customer.subscription.deleted - Subscription ID:', deletedSubscription.id);
            response.send({ received: true });
            return;
        default:
            v2_1.logger.info(`Unhandled event type ${event.type}`);
            response.send({ received: true });
            return;
    }
});
// ====================================================================
// 4. activateCustomerTrialAndDeductCredits (HTTPS Callable - V2 Syntax)
// Purpose: Activates a customer's trial, deducting credits from the rep.
// ====================================================================
exports.activateCustomerTrialAndDeductCredits = (0, https_1.onCall)(async (request) => {
    var _a;
    const { data, auth: callableAuth } = request;
    if (!callableAuth) {
        v2_1.logger.error('Function called without authentication context.');
        throw new https_1.HttpsError('unauthenticated', 'You must be logged in to activate a trial.');
    }
    const customerUid = callableAuth.uid;
    const customerEmail = (_a = callableAuth.token) === null || _a === void 0 ? void 0 : _a.email;
    const { name, customerNumber, referredByRepId, trialTypeId } = data;
    // Input Validations
    if (!name || typeof name !== 'string' || name.trim() === '') {
        throw new https_1.HttpsError('invalid-argument', 'Customer name is required.');
    }
    if (!customerNumber || typeof customerNumber !== 'string' || customerNumber.trim() === '') {
        throw new https_1.HttpsError('invalid-argument', 'Customer number is required.');
    }
    if (!referredByRepId || typeof referredByRepId !== 'string' || referredByRepId.trim() === '') {
        throw new https_1.HttpsError('invalid-argument', 'Referring sales rep ID is required.');
    }
    if (!trialTypeId || typeof trialTypeId !== 'string' || trialTypeId.trim() === '') {
        throw new https_1.HttpsError('invalid-argument', 'Trial type ID is required.');
    }
    try {
        const result = await db.runTransaction(async (transaction) => {
            var _a;
            const customerProfileRef = db.collection('userProfiles').doc(customerUid);
            const salesRepRef = db.collection('salesReps').doc(referredByRepId);
            const trialTypeRef = db.collection('trialLinkTypes').doc(trialTypeId);
            const [customerProfileDoc, salesRepDoc, trialTypeDoc] = await Promise.all([
                transaction.get(customerProfileRef),
                transaction.get(salesRepRef),
                transaction.get(trialTypeRef)
            ]);
            if (!salesRepDoc.exists) {
                v2_1.logger.error(`Validation Error: Sales rep ${referredByRepId} not found.`);
                throw new https_1.HttpsError('not-found', 'Referring sales rep not found.');
            }
            const salesRepData = salesRepDoc.data();
            if (!salesRepData || salesRepData.accountStatus !== 'active') {
                v2_1.logger.error(`Validation Error: Sales rep ${referredByRepId} is not active. Status: ${salesRepData === null || salesRepData === void 0 ? void 0 : salesRepData.accountStatus}`);
                throw new https_1.HttpsError('failed-precondition', 'Referring sales rep account is not active.');
            }
            if (!trialTypeDoc.exists) {
                v2_1.logger.error(`Validation Error: Trial type ${trialTypeId} not found.`);
                throw new https_1.HttpsError('not-found', 'Trial type not found.');
            }
            const trialTypeData = trialTypeDoc.data();
            const creditsCost = (trialTypeData === null || trialTypeData === void 0 ? void 0 : trialTypeData.creditsCost) || 1; // Cast to number
            const trialDurationDays = (trialTypeData === null || trialTypeData === void 0 ? void 0 : trialTypeData.trialDurationDays) || 7; // Cast to number
            const planAccessLevel = (trialTypeData === null || trialTypeData === void 0 ? void 0 : trialTypeData.planAccessLevel) || 'free'; // Cast to string
            if (customerProfileDoc.exists) {
                const customerData = customerProfileDoc.data();
                if ((customerData === null || customerData === void 0 ? void 0 : customerData.trialStatus) === 'active') {
                    v2_1.logger.warn(`Customer ${customerUid} already has an active trial.`);
                    throw new https_1.HttpsError('already-exists', 'You already have an active trial.');
                }
                if (customerData === null || customerData === void 0 ? void 0 : customerData.referredByRepId) {
                    v2_1.logger.warn(`Customer ${customerUid} is already linked to rep ${customerData.referredByRepId}.`);
                    throw new https_1.HttpsError('already-exists', 'You have already been referred by a sales rep.');
                }
            }
            const currentCredits = salesRepData.creditsRemaining || 0; // Cast to number
            if (currentCredits < creditsCost) {
                v2_1.logger.error(`Resource Exhausted: Sales rep ${referredByRepId} has ${currentCredits} credits, but ${creditsCost} are needed.`);
                throw new https_1.HttpsError('resource-exhausted', 'Referring sales rep has insufficient credits to activate this trial.');
            }
            const trialEndDate = firestore_1.Timestamp.fromMillis(Date.now() + (trialDurationDays * 24 * 60 * 60 * 1000));
            transaction.update(salesRepRef, {
                creditsRemaining: firestore_1.FieldValue.increment(-creditsCost),
                associatedCustomersCount: firestore_1.FieldValue.increment(1)
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
                createdAt: customerProfileDoc.exists ? (((_a = customerProfileDoc.data()) === null || _a === void 0 ? void 0 : _a.createdAt) || firestore_1.FieldValue.serverTimestamp()) : firestore_1.FieldValue.serverTimestamp(),
                lastUpdated: firestore_1.FieldValue.serverTimestamp()
            }, { merge: true });
            v2_1.logger.info(`Trial activated for customer ${customerUid} (email: ${customerEmail}) by rep ${referredByRepId} for trialType ${trialTypeId}. ${creditsCost} credits deducted.`);
            return {
                message: 'Trial activated successfully!',
                trialEndDate: trialEndDate.toDate().toISOString(),
                planAccess: planAccessLevel
            };
        });
        return result;
    }
    catch (error) { // Catch as unknown
        if (error instanceof https_1.HttpsError) {
            v2_1.logger.error(`Caught HttpsError: ${error.code} - ${error.message} (Details: ${error.details})`);
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : String(error);
        v2_1.logger.error("Unexpected Error in activateCustomerTrialAndDeductCredits:", errorMessage);
        throw new https_1.HttpsError('internal', 'Failed to activate trial due to an unexpected server error.', errorMessage);
    }
});
//# sourceMappingURL=index.js.map