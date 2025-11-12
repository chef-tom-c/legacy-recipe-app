export declare const createInitialSalesRepProfile: import("firebase-functions/v2/https").CallableFunction<{
    name?: string;
}, Promise<{
    message: string;
}>, unknown>;
export declare const createStripeCheckoutSession: import("firebase-functions/v2/https").CallableFunction<{
    planId?: string;
}, Promise<{
    sessionId: string;
}>, unknown>;
export declare const stripeWebhookHandler: import("firebase-functions/v2/https").HttpsFunction;
export declare const activateCustomerTrialAndDeductCredits: import("firebase-functions/v2/https").CallableFunction<{
    name: string;
    customerNumber: string;
    referredByRepId: string;
    trialTypeId: string;
}, Promise<{
    message: string;
    trialEndDate: string;
    planAccess: string;
}>, unknown>;
