const pluginPkg = require('../package.json');

const ID = pluginPkg.strapi.name || pluginPkg.name.replace(/^(@_sh\/strapi-)plugin-/i, '');
const GLOBALS_UID = `plugin::${ID}.globals`
const CONFIGS = `plugin.${ID}`
const ENUMERATION_CONTENT_TYPE = `plugin::${ID}.dynamic-enumeration-data`
const PROVIDER = `plugin::${ID}.dynamic-enumeration-provider`
const QUEUE_SERVICE = `plugin::${ID}.dynamic-enumeration-queue`
const FIELD_NAME = 'dynamic-field'
const FIELD_FULL_NAME = `plugin::${ID}.${FIELD_NAME}`

// Frontend Constants
const REDUCER_ADD_VALUE = ID + '/add-field'
const REDUCER_LOADING_VALUES = ID + '/set-loading-values'
const REDUCER_LOADED_VALUES = ID + '/update-field'
const API_FIELD_OPTIONS = `${ID}/get-field-options`

module.exports = {
  ID,
  GLOBALS_UID,
  CONFIGS,
  ENUMERATION_CONTENT_TYPE,
  PROVIDER,
  QUEUE_SERVICE,
  FIELD_NAME,
  FIELD_FULL_NAME,
  REDUCER: ID,
  REDUCER_ADD_VALUE,
  REDUCER_LOADED_VALUES,
  REDUCER_LOADING_VALUES,
  API_FIELD_OPTIONS
}