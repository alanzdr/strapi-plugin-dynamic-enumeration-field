import { getFetchClient } from '@strapi/helper-plugin'

import pluginId from '../pluginId';

export const getPluginConfig = async () => {
  const featchClient = getFetchClient()

  try {
    const config = await featchClient.get(`${pluginId}/get-config`)
    return config.data || {}
  } catch (error) {
    console.error(error)
    return {}
  }
}