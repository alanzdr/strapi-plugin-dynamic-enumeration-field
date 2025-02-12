import CONSTANTS from "~/constants";
import { IPluginConfig } from "~/types";

export async function loadConfigs(): Promise<IPluginConfig> {
  const userConfigs = await strapi.config.get(CONSTANTS.CONFIGS);
  return {
    ...CONSTANTS.DEFAULT_CONFIGS,
    ...((userConfigs as IPluginConfig) || {}),
  };
}

export default {
  default: CONSTANTS.DEFAULT_CONFIGS,
  validator() {},
};
