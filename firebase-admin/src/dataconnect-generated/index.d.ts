import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

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

interface SeedSubscriptionTypesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<SeedSubscriptionTypesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<SeedSubscriptionTypesData, undefined>;
  operationName: string;
}
export const seedSubscriptionTypesRef: SeedSubscriptionTypesRef;

export function seedSubscriptionTypes(): MutationPromise<SeedSubscriptionTypesData, undefined>;
export function seedSubscriptionTypes(dc: DataConnect): MutationPromise<SeedSubscriptionTypesData, undefined>;

interface GetCustomerProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetCustomerProfileData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetCustomerProfileData, undefined>;
  operationName: string;
}
export const getCustomerProfileRef: GetCustomerProfileRef;

export function getCustomerProfile(): QueryPromise<GetCustomerProfileData, undefined>;
export function getCustomerProfile(dc: DataConnect): QueryPromise<GetCustomerProfileData, undefined>;

interface CreateCustomerProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateCustomerProfileData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateCustomerProfileData, undefined>;
  operationName: string;
}
export const createCustomerProfileRef: CreateCustomerProfileRef;

export function createCustomerProfile(): MutationPromise<CreateCustomerProfileData, undefined>;
export function createCustomerProfile(dc: DataConnect): MutationPromise<CreateCustomerProfileData, undefined>;

interface ListAvailableBadgesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAvailableBadgesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAvailableBadgesData, undefined>;
  operationName: string;
}
export const listAvailableBadgesRef: ListAvailableBadgesRef;

export function listAvailableBadges(): QueryPromise<ListAvailableBadgesData, undefined>;
export function listAvailableBadges(dc: DataConnect): QueryPromise<ListAvailableBadgesData, undefined>;

