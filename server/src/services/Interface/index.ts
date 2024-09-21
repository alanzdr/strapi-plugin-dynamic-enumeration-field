import CONSTANTS from "../../constants";

const PROVIDER_UID = "plugin::dynamic-enumeration.dynamic-enumeration-provider";

const dynamicEnumInterface = ({ strapi }) => ({
  async getValues({ uid, name, locale }) {
    if (!uid || !name) {
      throw new Error("uid and name are required");
    }

    const values = await strapi.service(PROVIDER_UID).getEnumerationValues(
      {
        uid,
        name,
        locale,
      },
      false
    );

    return values.map((item) => item.content);
  },
  async getGlobalValues({ key, locale }) {
    if (!key) {
      throw new Error("key are required");
    }

    const values = await strapi.service(PROVIDER_UID).getEnumerationValues(
      {
        uid: CONSTANTS.GLOBALS_UID,
        name: key,
        locale,
      },
      false
    );

    const options = values.map((item) => item.content);
    const config = await strapi.config.get(CONSTANTS.CONFIGS);
    const defaults = config?.globals?.[key]?.defaults || [];

    if (!defaults || !Array.isArray(defaults)) {
      return options;
    }

    const data = [
      ...new Set([...defaults.map((item) => String(item)), ...options]),
    ];

    return data;
  },
});

export default dynamicEnumInterface;
