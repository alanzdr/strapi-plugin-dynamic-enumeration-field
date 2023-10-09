const pluginPkg = require('../../package.json');
const pluginId = pluginPkg.strapi.name || pluginPkg.name.replace(/^(@_sh\/strapi-)plugin-/i, '');

const GLOBALS_UID = `plugin::${pluginId}.globals`
const CONFIGS = `plugin.${pluginId}`
const CONTENT_TYPE = `plugin::${pluginId}.dynamic-enumeration-data`
const PROVIDER = `plugin::${pluginId}.dynamic-enumeration-provider`
const QUEUE_SERVICE = `plugin::${pluginId}.dynamic-enumeration-queue`
const FIELD_NAME = `plugin::${pluginId}.dynamic-field`

module.exports = {
  ID: pluginId,
  GLOBALS_UID,
  CONFIGS,
  CONTENT_TYPE,
  PROVIDER,
  QUEUE_SERVICE,
  FIELD_NAME
}