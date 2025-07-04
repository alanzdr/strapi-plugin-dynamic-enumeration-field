import { UID, Struct } from '@strapi/strapi'

import CONSTANTS from "../../constants";
import ProviderService from "../../services/Provider";
import { IEnumerationValue } from '~/types';

class LifecycleProvider {
  private service: ProviderService;
  public fieldNames: string[];

  constructor(private model: Struct.Schema) {
    this.service = ProviderService.getInstance();
    this.fieldNames = Object.entries(model.attributes)
      .filter(([key, value]) => {
        return (value as any).customField === CONSTANTS.FIELD_FULL_NAME;
      })
      .map(([key, value]) => key);
  }
  

  public get hasLocale() {
    return (this.model.pluginOptions as any)?.i18n?.localized ?? false;
  }

  public get uid() : UID.ContentType {
    return this.model.uid as UID.ContentType;
  }

  public async createFromContent(name: string, content: string, locale?: string) {
    const values = [
      {
        content,
        length: 1,
      },
    ]

    await this.service.createData({
      uid: this.uid,
      name,
      values,
      locale,
    })
  };

  public async getEnumeration(name: string, locale?: string) {
    const options = (this.model.attributes as any)[name]?.options;

    if (options && options.global) {
      return await this.service.getEnumeration({
        uid: CONSTANTS.GLOBALS_UID as UID.ContentType,
        name: options.global,
        locale,
      });
    }

    return await this.service.getEnumeration({
      uid: this.uid,
      name,
      locale,
    });
  }

  public async updateEnumeration(id: number, values: IEnumerationValue[]) {
    await this.service.updateValues(id, values);
  }

  public async findOne(where: any) {
    return await strapi.db.query(this.uid).findOne({
      select: this.fieldNames,
      where,
    });
  }
  public async findByID(id: number) {
    return await strapi.db.query(this.uid).findOne({
      select: this.fieldNames,
      where: { id },
    });
  }

  public async findMany(where: any) {
    return await strapi.db.query(this.uid).findMany({
      select: this.fieldNames,
      where,
    });
  }

}

export default LifecycleProvider;
