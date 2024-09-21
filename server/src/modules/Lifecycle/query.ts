import CONSTANTS from "../../constants";

function LifecycleQuery({ strapi, uid, fieldNames, attributes }) {
  // Provider Service
  const provider = strapi.service(CONSTANTS.PROVIDER);
  // i18n pluggin support
  const hasLocale = attributes.locale != null;
  const select = hasLocale ? [...fieldNames, "locale"] : fieldNames;

  // Find one in current API data
  const apiFindOne = async (where) => {
    return await strapi.db.query(uid).findOne({
      select,
      where,
    });
  };

  // Find many in current API data
  const apiFindMany = async (where) => {
    return await strapi.db.query(uid).findMany({
      select,
      where,
    });
  };

  // Get Enumeration data
  const getEnumeration = async (name, locale) => {
    const options = attributes[name]?.options;

    if (options && options.global) {
      return await provider.getEnumeration({
        uid: CONSTANTS.GLOBALS_UID,
        name: options.global,
        locale,
      });
    }

    return await provider.getEnumeration({
      uid,
      name,
      locale,
    });
  };

  // Create new enumeration
  const createEnumeration = async (name, fieldData, locale) => {
    await provider.createData({
      uid,
      name,
      values: [
        {
          content: fieldData,
          length: 1,
        },
      ],
      ...(locale ? { locale } : {}),
    });
  };

  // Update enumeration
  const updateEnumeration = async (id, values) => {
    await provider.updateValues(id, values);
  };

  return {
    api: {
      findOne: apiFindOne,
      findMany: apiFindMany,
    },
    enum: {
      get: getEnumeration,
      create: createEnumeration,
      update: updateEnumeration,
    },
  };
}

export default LifecycleQuery;
