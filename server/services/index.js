'use strict';

const dynamicEnumProvider = require('./Provider');
const dynamicEnumQueue = require('./Queue');
const dynamicEnumInterface = require('./Interface');

module.exports = {
  'dynamic-enumeration-provider': dynamicEnumProvider,
  'dynamic-enumeration-queue': dynamicEnumQueue,
  'dynamic-enumeration-service': dynamicEnumInterface
};
