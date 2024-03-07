
const { inspect } = require('node:util')
const CONSTANTS = require("../../constants")

function getContentTypeParams(contentType) {
  const query = {
    select: [],
    populate: {}
  }

  if (!contentType.havePlugin) {
    return false
  }

  for (const field of contentType.values) {
    query.select.push(field)
  }

  for (const globalKey of Object.keys(contentType.globals)) {
    query.select.push(contentType.globals[globalKey])
  }

  for (const childKey of Object.keys(contentType.children)) {
    const type = contentType.children[childKey].type
    const child = contentType.children[childKey]
    const childParams = getContentTypeParams(child)

    if (childParams) {
      if (type === 'dynamiczone') {
        query.populate[childKey] = {
          on: childParams.populate
        }
      } else {
        query.populate[childKey] = childParams
      }
    }
  }

  return query
}

function getPluginFieldsData(
  localized, 
  defaultLocale,
  contentTypeFields, 
  queryData, 
  dynamicData
) {
  if (!queryData || queryData.length === 0) {
    return dynamicData
  } else if (!contentTypeFields.havePlugin) {
    return dynamicData
  }

  const uid = contentTypeFields.uid

  for (const rowData of queryData) {
    if (!rowData || typeof rowData !== 'object') {
      continue
    }

    const locale = localized ? rowData.locale ?? defaultLocale : defaultLocale
    if (dynamicData[locale] === undefined) {
      dynamicData[locale] = {
        [CONSTANTS.GLOBALS_UID]: {}
      }
    }

    if (dynamicData[locale][uid] === undefined) {
      dynamicData[locale][uid] = {}
    }

    const updateFieldValue = (id, key, value) => {
      if (!dynamicData[locale][id][key]) {
        dynamicData[locale][id][key] = {}
      } 
      if (value != null) {
        if (!dynamicData[locale][id][key][value]) {
          dynamicData[locale][id][key][value] = 1
        } else {
          dynamicData[locale][id][key][value] += 1
        }      
      }
    }

    for (const field of contentTypeFields.values) {
      const fieldValue = rowData[field]
      updateFieldValue(uid, field, fieldValue)
    }

    for (const globalKey in contentTypeFields.globals) {
      const fieldKey = contentTypeFields.globals[globalKey]
      const fieldValue = rowData[fieldKey]
      updateFieldValue(CONSTANTS.GLOBALS_UID, globalKey, fieldValue)
    }

    for (const childKey in contentTypeFields.children) {
      const type = contentTypeFields.children[childKey].type
      const childrenField = contentTypeFields.children[childKey]
      
      if (rowData[childKey] === undefined) {
        continue
      }
      const componentData = Array.isArray(rowData[childKey]) ? rowData[childKey] : [rowData[childKey]]
      if (!componentData || componentData.length === 0) {
        continue
      }

      if (type === 'component') {
        dynamicData = getPluginFieldsData(
          localized,
          defaultLocale,
          childrenField,
          componentData,
          dynamicData
        )
      } else if (type === 'dynamiczone') {
        for (const componentKey in childrenField.children) {
          const zoneTypeData = componentData.filter(data => data?.__component === componentKey)
          if (!zoneTypeData || zoneTypeData.length === 0) {
            continue
          }

          const componentField = childrenField.children[componentKey]
          dynamicData = getPluginFieldsData(
            localized,
            defaultLocale,
            componentField,
            zoneTypeData,
            dynamicData
          )
        }
      }
    }

  }

  return dynamicData
}

async function getCollectionsData (strapi, contentTypes) {
  let dynamicData = {}

  const localeService = strapi.service('plugin::i18n.locales')
  const defaultLocale = await localeService.getDefaultLocale()

  for (const contentType of contentTypes) {
    const queryParams = getContentTypeParams(contentType.fields)
    if (!queryParams) {
      continue
    }

    const queryData = await strapi.db.query(contentType.uid).findMany({
      ...queryParams,
      select: [...queryParams.select, ...(contentType.localized ? ['locale'] : [])]
    })

    dynamicData = getPluginFieldsData(
      contentType.localized,
      defaultLocale,
      contentType.fields, 
      queryData, 
      dynamicData
    )
  }
  // console.log(inspect(dynamicData, {showHidden: false, depth: null, colors: true}))

  return dynamicData
}

module.exports = getCollectionsData