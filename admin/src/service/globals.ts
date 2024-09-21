import { getPluginConfig } from "./config";

import CONSTANTS from "../constants";

export const getGlobalOptions = async () => {
  const pluginConfig = await getPluginConfig();

  try {
    const globalOptions = pluginConfig?.globals;

    if (!globalOptions) {
      return [];
    }

    const entries = Object.entries(globalOptions);

    if (!entries || !entries.length) {
      return [];
    }

    return entries.map(([key, value]) => ({
      key,
      value: key,
      metadatas: {
        intlLabel: {
          id: CONSTANTS.ID + ".globals." + key,
          defaultMessage: (value as any)?.name || key,
        },
      },
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};
