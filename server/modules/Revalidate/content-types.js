const CONSTANTS = require("../../constants")

function getAttributesFields (
  uid, 
  strapi, 
  attributes, 
  type = 'api',
  repeatable = true,
) {
  const fields = {
    uid,
    values: [],
    children: {},
    globals: {},
    type,
    repeatable,
    havePlugin: false
  }

  for (const fieldKey of Object.keys(attributes)) {
    const field = attributes[fieldKey]
    
    if (field.customField === CONSTANTS.FIELD_FULL_NAME) {
      fields.havePlugin = true
      const global = field.options?.global
      if (global) {
        fields.globals[global] = fieldKey
      } else {
        fields.values.push(fieldKey)
      }
    } else if (field.type === 'component') {
      const componentKey = field.component
      const fullContentType = strapi.components[componentKey]

      if (!fullContentType || !fullContentType.attributes) continue

      const componentUid = fullContentType.uid

      const children = getAttributesFields(componentUid, strapi, fullContentType.attributes, 'component')
      fields.children[fieldKey] = children
      
      if (children.havePlugin) fields.havePlugin = true
    
    } else if (field.type === 'dynamiczone') {
      const components = field.components

      if (fields.children[fieldKey] === undefined) {
        fields.children[fieldKey] = {
          uid: `${uid}.${fieldKey}`,
          values: [],
          children: {},
          globals: {},
          type: 'dynamiczone',
          havePlugin: false
        }
      }

      for (const componentKey of components) {
        const fullContentType = strapi.components[componentKey]

        if (!fullContentType || !fullContentType.attributes) continue

        const componentUid = fullContentType.uid
        const children = getAttributesFields(componentUid, strapi, fullContentType.attributes, 'component')
        fields.children[fieldKey].children[componentKey] = children
        
        if (children.havePlugin) fields.children[fieldKey].havePlugin = true
      }
      
      if (fields.children[fieldKey].havePlugin) fields.havePlugin = true
      
    }
  }

  return fields
}


function getContentTypes (strapi) {
  const contentTypes = []

  // APIS
  const apis = strapi.container.get('apis').getAll()
  for (const apiKey of Object.keys(apis)) {
    const fullContentType = apis[apiKey].contentTypes[apiKey]
    if (!fullContentType || !fullContentType.attributes) continue

    const fields = getAttributesFields(fullContentType.uid, strapi, fullContentType.attributes)
    const localized = fullContentType.pluginOptions?.i18n?.localized

    contentTypes.push({
      uid: fullContentType.uid,
      fields,
      localized
    })
  }

  return contentTypes
}

module.exports = getContentTypes