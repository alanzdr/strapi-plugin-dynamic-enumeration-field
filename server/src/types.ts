import { UID } from '@strapi/strapi';

export interface IPluginConfig {
  contentTypeVisible: boolean;
  revalidateOnStart: boolean;
  globals: Record<string, any>;
}

export interface IEnumerationValue {
  content: string;
  length: number;
}

export interface IEnumerationInfo {
  uid: UID.Schema;
  name: string;
  locale?: string;
}

export interface IEnumeration extends IEnumerationInfo {
  values: IEnumerationValue[];
}

export interface IEnumerationEntity extends IEnumeration {
  id: number;
}
