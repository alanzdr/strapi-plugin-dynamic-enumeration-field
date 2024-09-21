import CONSTANTS from "./constants";

async function setEnumerationVisibility(strapi) {
  const config = await strapi.config.get(CONSTANTS.CONFIGS);
  if (!config.contentTypeVisible) {
    return;
  }

  const contentType = strapi.contentType(CONSTANTS.ENUMERATION_CONTENT_TYPE);
  contentType.pluginOptions = {
    ...contentType.pluginOptions,
    "content-manager": { visible: true },
    "content-type-builder": { visible: true },
  };
}

const register = async ({ strapi }) => {
  // Register custom field
  strapi.customFields.register({
    name: CONSTANTS.FIELD_NAME,
    plugin: CONSTANTS.ID,
    type: "string",
  });

  // Set Enumeration Content Type Visibility if setted
  await setEnumerationVisibility(strapi);
};

export default register;
