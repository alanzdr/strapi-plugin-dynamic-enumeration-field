import { UID } from "@strapi/strapi";
import { IEnumeration, IEnumerationEntity, IEnumerationInfo, IEnumerationValue } from "~/types";

const contentType = "plugin::dynamic-enumeration.dynamic-enumeration-data";

import CONSTANTS from "../../constants";

class ProviderService {
  async getEnumeration({ name, uid, locale }: IEnumerationInfo) {
    const response = await strapi.db.query(contentType).findOne({
      where: {
        uid,
        name,
        ...(locale ? { locale } : {}),
      },
    });
    return response as IEnumerationEntity | null;
  }

  async getEnumerationValues({ uid, name, locale }: IEnumerationInfo, createIfNotExists = true) {
    const response = await this.getEnumeration({ uid, name, locale });

    if (!response && createIfNotExists) {
      await this.createData({ uid, name, locale, values: [] });
      return [];
    }

    return response?.values || [];
  }

  async queryFields(uid: UID.ContentType, namesIn: string[], locale?: string) {
    const response = await strapi.db.query(contentType).findMany({
      where: {
        uid,
        name: { $in: namesIn },
        ...(locale ? { locale } : {}),
      },
    });
    return response;
  }

  async createData({ uid, name, values, locale }: IEnumeration) {
    return (await strapi.db.query(contentType).create({
      data: {
        uid,
        name,
        values,
        ...(locale ? { locale } : {}),
      },
    })) as IEnumerationEntity;
  }

  public async createEnumeration(entity: IEnumerationInfo) {
    return (await strapi.db.query(contentType).create({
      data: {
        uid: entity.uid,
        name: entity.name,
        values: [],
        ...(entity.locale ? { locale: entity.locale } : {}),
      },
    })) as IEnumerationEntity;
  }

  async updateValues(id: number, values: IEnumerationValue[]) {
    await strapi.db.query(contentType).update({
      where: {
        id,
      },
      data: {
        values,
      },
    });
  }

  public static getInstance(): ProviderService {
    return strapi.service(CONSTANTS.PROVIDER) as ProviderService; 
  }

}


export default ProviderService;
