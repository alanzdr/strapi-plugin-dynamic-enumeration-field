'use strict';

const CONSTANTS = require("./config/constants");

module.exports = async ({ strapi }) => {
  strapi.customFields.register({
    name: "dynamic-field",
    plugin: CONSTANTS.ID,
    type: "string",
  });

  const config = await strapi.config.get(CONSTANTS.CONFIGS);
  const contentType = strapi.contentType(CONSTANTS.CONTENT_TYPE)

  contentType.pluginOptions = {
    ...contentType.pluginOptions,
    'content-manager': { visible: !!config.contentTypeVisible },
    'content-type-builder': { visible: !!config.contentTypeVisible },
  }
};
