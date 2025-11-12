import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'firebase-admin-1',
  location: 'us-east4'
};

export const seedSubscriptionTypesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SeedSubscriptionTypes');
}
seedSubscriptionTypesRef.operationName = 'SeedSubscriptionTypes';

export function seedSubscriptionTypes(dc) {
  return executeMutation(seedSubscriptionTypesRef(dc));
}

export const getCustomerProfileRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCustomerProfile');
}
getCustomerProfileRef.operationName = 'GetCustomerProfile';

export function getCustomerProfile(dc) {
  return executeQuery(getCustomerProfileRef(dc));
}

export const createCustomerProfileRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateCustomerProfile');
}
createCustomerProfileRef.operationName = 'CreateCustomerProfile';

export function createCustomerProfile(dc) {
  return executeMutation(createCustomerProfileRef(dc));
}

export const listAvailableBadgesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAvailableBadges');
}
listAvailableBadgesRef.operationName = 'ListAvailableBadges';

export function listAvailableBadges(dc) {
  return executeQuery(listAvailableBadgesRef(dc));
}

