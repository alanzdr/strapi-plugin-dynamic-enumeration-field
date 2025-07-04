import { IPluginConfig } from "./types";
import type { UID } from '@strapi/strapi'

const ID = "dynamic-enumeration";
const GLOBALS_UID = `plugin::${ID}.globals`;
const CONFIGS = `plugin::${ID}`;
const ENUMERATION_CONTENT_TYPE = `plugin::${ID}.dynamic-enumeration-data`;
const FIELD_NAME = "dynamic-field";
const FIELD_FULL_NAME = `plugin::${ID}.${FIELD_NAME}`;
// Services
const QUEUE_SERVICE = `plugin::${ID}.dynamic-enumeration-queue` as UID.Service;
const PROVIDER = `plugin::${ID}.dynamic-enumeration-provider` as UID.Service;
// Frontend Constants
const REDUCER_ADD_VALUE = ID + "/add-field";
const REDUCER_LOADING_VALUES = ID + "/set-loading-values";
const REDUCER_RESET = ID + "/reset-data";
const REDUCER_LOADED_VALUES = ID + "/update-field";
const API_FIELD_OPTIONS = `${ID}/get-field-options`;

const DEFAULT_CONFIGS: IPluginConfig = {
  contentTypeVisible: false,
  revalidateOnStart: process.env.NODE_ENV !== "development",
  globals: {},
};

export default {
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
  REDUCER_RESET,
  API_FIELD_OPTIONS,
  DEFAULT_CONFIGS,
};
