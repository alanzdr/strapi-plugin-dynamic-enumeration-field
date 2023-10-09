'use strict';

const PROVIDER_UID = 'plugin::dynamic-enumeration.dynamic-enumeration-provider'
const CONSTANTS = require('../config/constants') 

const dynamicEnumController = ({strapi}) => ({
  async getConfig () {
    const config = await strapi.config.get(CONSTANTS.CONFIGS);
    return config;
  },
  async getAdminFieldValues ({request}) {
    const { uid, name, locale } = request.query
    
    const values = await strapi.service(PROVIDER_UID).getEnumerationValues({
      uid,
      name,
      locale
    })

    const options = values.map(item => item.content)

    if (uid === CONSTANTS.GLOBALS_UID) {
      const config = await this.getConfig()
      const defaults = config?.globals?.[name]?.defaults || []

      if (!defaults || !Array.isArray(defaults)) {
        return options
      }
      
      return [...new Set([
        ...defaults.map(item => String(item)),
        ...options
      ])]
    }

    return options
  },
  async getFieldValues (ctx) {
    const { uid, name, locale } = ctx.request.query

    if (!uid || !name) {
      return ctx.badRequest('uid and name are required')
    }
    
    const values = await strapi.service(PROVIDER_UID).getEnumerationValues({
      uid,
      name,
      locale
    })

    const data = values.map(item => item.content)

    return {
      data
    }
  },
  async getGlobalValues ({request}) {
    const { key, locale } = request.query

    if (!key) {
      return ctx.badRequest('key are required')
    }
    
    const values = await strapi.service(PROVIDER_UID).getEnumerationValues({
      uid: CONSTANTS.GLOBALS_UID,
      name: key,
      locale
    })

    const options = values.map(item => item.content)
    const config = await this.getConfig()
    const defaults = config?.globals?.[key]?.defaults || []

    if (!defaults || !Array.isArray(defaults)) {
      return options
    }
    
    const data = [...new Set([
      ...defaults.map(item => String(item)),
      ...options
    ])]

    return {
      data
    }
  },
  

})

module.exports = {
  'dynamic-enumeration': dynamicEnumController
};
