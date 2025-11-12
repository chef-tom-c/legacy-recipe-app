const { validateAdminArgs } = require('firebase-admin/data-connect');

const connectorConfig = {
  connector: 'example',
  serviceId: 'firebase-admin-1',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

function seedSubscriptionTypes(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('SeedSubscriptionTypes', inputVars, inputOpts);
};
exports.seedSubscriptionTypes = seedSubscriptionTypes;

function getCustomerProfile(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('GetCustomerProfile', inputVars, inputOpts);
};
exports.getCustomerProfile = getCustomerProfile;

function createCustomerProfile(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateCustomerProfile', inputVars, inputOpts);
};
exports.createCustomerProfile = createCustomerProfile;

function listAvailableBadges(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListAvailableBadges', inputVars, inputOpts);
};
exports.listAvailableBadges = listAvailableBadges;

