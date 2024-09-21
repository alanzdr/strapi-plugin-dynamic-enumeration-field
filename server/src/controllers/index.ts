import CONSTANTS from "../constants";

const PROVIDER_UID = "plugin::dynamic-enumeration.dynamic-enumeration-provider";
const INTERFACE_UID = "plugin::dynamic-enumeration.dynamic-enumeration-service";

const dynamicEnumController = ({ strapi }) => ({
  async getConfig() {
    const config = await strapi.config.get(CONSTANTS.CONFIGS);
    return config;
  },
  async getAdminFieldValues({ request }) {
    const { uid, name, locale } = request.query;

    const values = await strapi.service(PROVIDER_UID).getEnumerationValues({
      uid,
      name,
      locale,
    });

    const options = values.map((item) => item.content);

    if (uid === CONSTANTS.GLOBALS_UID) {
      const config = await this.getConfig();
      const defaults = config?.globals?.[name]?.defaults || [];

      if (!defaults || !Array.isArray(defaults)) {
        return options;
      }

      return [...defaults.map((item) => String(item)), ...options];
    }

    return options;
  },
  async getFieldValues(ctx) {
    const { uid, name, locale } = ctx.request.query;

    try {
      const data = await strapi.service(INTERFACE_UID).getValues({
        uid,
        name,
        locale,
      });
      return {
        data,
      };
    } catch (error) {
      ctx.badRequest(error.message);
    }
  },
  async getGlobalValues(ctx) {
    const { key, locale } = ctx.request.query;

    try {
      const data = await strapi.service(INTERFACE_UID).getGlobalValues({
        key,
        locale,
      });
      return {
        data,
      };
    } catch (error) {
      ctx.badRequest(error.message);
    }
  },
});

export default { "dynamic-enumeration": dynamicEnumController };
