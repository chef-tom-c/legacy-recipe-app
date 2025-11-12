import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export interface Badge_Key {
  id: UUIDString;
  __typename?: 'Badge_Key';
}

export interface CreateCustomerProfileData {
  customerProfile_insert: CustomerProfile_Key;
}

export interface CustomerBadge_Key {
  customerId: UUIDString;
  badgeId: UUIDString;
  __typename?: 'CustomerBadge_Key';
}

export interface CustomerProfile_Key {
  id: UUIDString;
  __typename?: 'CustomerProfile_Key';
}

export interface GetCustomerProfileData {
  customerProfile?: {
    id: UUIDString;
    createdAt: TimestampString;
    currentPoints: number;
    subscriptionType: string;
  } & CustomerProfile_Key;
}

export interface ListAvailableBadgesData {
  badges: ({
    id: UUIDString;
    name: string;
    description: string;
    imageUrl?: string | null;
    difficulty: string;
    pointsAwarded: number;
    requirements?: string | null;
  } & Badge_Key)[];
}

export interface RepProfile_Key {
  id: UUIDString;
  __typename?: 'RepProfile_Key';
}

export interface SeedSubscriptionTypesData {
  basic: SubscriptionType_Key;
  pro: SubscriptionType_Key;
  enterprise: SubscriptionType_Key;
}

export interface SubscriptionType_Key {
  id: UUIDString;
  __typename?: 'SubscriptionType_Key';
}

export interface TrialCredit_Key {
  id: UUIDString;
  __typename?: 'TrialCredit_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

/** Generated Node Admin SDK operation action function for the 'SeedSubscriptionTypes' Mutation. Allow users to execute without passing in DataConnect. */
export function seedSubscriptionTypes(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<SeedSubscriptionTypesData>>;
/** Generated Node Admin SDK operation action function for the 'SeedSubscriptionTypes' Mutation. Allow users to pass in custom DataConnect instances. */
export function seedSubscriptionTypes(options?: OperationOptions): Promise<ExecuteOperationResponse<SeedSubscriptionTypesData>>;

/** Generated Node Admin SDK operation action function for the 'GetCustomerProfile' Query. Allow users to execute without passing in DataConnect. */
export function getCustomerProfile(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<GetCustomerProfileData>>;
/** Generated Node Admin SDK operation action function for the 'GetCustomerProfile' Query. Allow users to pass in custom DataConnect instances. */
export function getCustomerProfile(options?: OperationOptions): Promise<ExecuteOperationResponse<GetCustomerProfileData>>;

/** Generated Node Admin SDK operation action function for the 'CreateCustomerProfile' Mutation. Allow users to execute without passing in DataConnect. */
export function createCustomerProfile(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateCustomerProfileData>>;
/** Generated Node Admin SDK operation action function for the 'CreateCustomerProfile' Mutation. Allow users to pass in custom DataConnect instances. */
export function createCustomerProfile(options?: OperationOptions): Promise<ExecuteOperationResponse<CreateCustomerProfileData>>;

/** Generated Node Admin SDK operation action function for the 'ListAvailableBadges' Query. Allow users to execute without passing in DataConnect. */
export function listAvailableBadges(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListAvailableBadgesData>>;
/** Generated Node Admin SDK operation action function for the 'ListAvailableBadges' Query. Allow users to pass in custom DataConnect instances. */
export function listAvailableBadges(options?: OperationOptions): Promise<ExecuteOperationResponse<ListAvailableBadgesData>>;

