const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'firebase-admin-1',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const seedSubscriptionTypesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SeedSubscriptionTypes');
}
seedSubscriptionTypesRef.operationName = 'SeedSubscriptionTypes';
exports.seedSubscriptionTypesRef = seedSubscriptionTypesRef;

exports.seedSubscriptionTypes = function seedSubscriptionTypes(dc) {
  return executeMutation(seedSubscriptionTypesRef(dc));
};

const getCustomerProfileRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCustomerProfile');
}
getCustomerProfileRef.operationName = 'GetCustomerProfile';
exports.getCustomerProfileRef = getCustomerProfileRef;

exports.getCustomerProfile = function getCustomerProfile(dc) {
  return executeQuery(getCustomerProfileRef(dc));
};

const createCustomerProfileRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateCustomerProfile');
}
createCustomerProfileRef.operationName = 'CreateCustomerProfile';
exports.createCustomerProfileRef = createCustomerProfileRef;

exports.createCustomerProfile = function createCustomerProfile(dc) {
  return executeMutation(createCustomerProfileRef(dc));
};

const listAvailableBadgesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAvailableBadges');
}
listAvailableBadgesRef.operationName = 'ListAvailableBadges';
exports.listAvailableBadgesRef = listAvailableBadgesRef;

exports.listAvailableBadges = function listAvailableBadges(dc) {
  return executeQuery(listAvailableBadgesRef(dc));
};
