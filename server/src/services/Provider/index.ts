const contentType = "plugin::dynamic-enumeration.dynamic-enumeration-data";

const dynamicEnumProvider = ({ strapi }) => ({
  async getEnumeration({ uid, name, locale }) {
    const response = await strapi.db.query(contentType).findOne({
      // uid syntax: 'api::api-name.content-type-name'
      where: {
        uid,
        name,
        ...(locale ? { locale } : {}),
      },
    });
    return response;
  },
  async getEnumerationValues({ uid, name, locale }, createIfNotExists = true) {
    const response = await this.getEnumeration({ uid, name, locale });

    if (!response && createIfNotExists) {
      await this.createData({ uid, name, locale, values: [] });
      return [];
    }

    return response?.values || [];
  },
  async queryFields({ uid, namesIn, locale }) {
    const response = await strapi.db.query(contentType).findMany({
      // uid syntax: 'api::api-name.content-type-name'
      where: {
        uid,
        name: { $in: namesIn },
        ...(locale ? { locale } : {}),
      },
    });
    return response;
  },
  async createData({ uid, name, locale, values }) {
    await strapi.db.query(contentType).create({
      data: {
        uid,
        name,
        values,
        ...(locale ? { locale } : {}),
      },
    });
  },
  async updateValues(id, values) {
    await strapi.db.query(contentType).update({
      where: {
        id,
      },
      data: {
        values,
      },
    });
  },
});

export default dynamicEnumProvider;
