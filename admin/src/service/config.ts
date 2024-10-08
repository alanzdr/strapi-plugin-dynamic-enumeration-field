import { getFetchClient } from "@strapi/strapi/admin";

import CONSTANTS from "../constants";

export const getPluginConfig = async () => {
  const featchClient = getFetchClient();

  try {
    const config = await featchClient.get(`${CONSTANTS.ID}/get-config`);
    return config.data || {};
  } catch (error) {
    console.error(error);
    return {};
  }
};
