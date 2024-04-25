const LifeCycleHandle = require('./handle')
const LifeCycleQuery = require('./query')
const CONSTANTS = require('../../constants')

async function executeLifecycle (event) {
  // Api or Component UID
  const { uid } = event.model
  // Attributes that are dynamic-enumeration fields
  const attributes = event?.model?.attributes || {}
  // Get field names
  const fieldNames = Object
    .entries(attributes)
    .filter(([key, value]) => {
      return value.customField === CONSTANTS.FIELD_FULL_NAME
    })
    .map(([key, value]) => key)
  if (!fieldNames || fieldNames.length === 0) {
    return
  }
  
  // Get query and handle factories 
  const query = LifeCycleQuery({  
    strapi, 
    uid, 
    fieldNames, 
    attributes: event.model.attributes
  })
  const handle = LifeCycleHandle({ query, fieldNames })

  // Execute event by action type
  switch (event.action) {
    case 'beforeCreate': {
      const data = event.params.data
      await handle.onCreate(data) 
      break;
    }
    case 'afterCreate': {
      const paramsData = event.params.data
      const resultData = event.result

      let isClone = true;

      for (const key in paramsData) {
        const paramsValue = paramsData[key]
        const resultValue = resultData[key]
        if (typeof paramsValue === 'string' && typeof resultValue === 'string' && paramsValue === resultValue) {
          isClone = false
          break;
        }
      }

      if (isClone) {
        await handle.onCreate(resultData)
      }

      break;
    }
    case 'beforeCreateMany': {
      const dataList = event.params.data
      for (const data of dataList) {
        await handle.onCreate(data) 
      }
      break;
    }
    case 'beforeUpdate': {
      const condition = event.params.where

      const before = await query.api.findOne(condition)
      const after = event.params.data

      await handle.onUpdate(before, after) 
      break;
    }
    case 'beforeUpdateMany': {
      const condition = event.params.where
      const after = event.params.data
      const dataList = await query.api.findMany(condition)
      for (const before of dataList) {
        await handle.onUpdate(before, after) 
      }
      break;
    }
    case 'beforeDelete': {
      const condition = event.params.where
      const data = await query.api.findOne(condition)
      await handle.onDelete(data) 
      break;
    }
    case 'beforeDeleteMany': {
      const condition = event.params.where
      const dataList = await query.api.findMany(condition)
      for (const data of dataList) {
        await handle.onDelete(data) 
      }
      break;
    }
    default: {
      break;
    }
  }

}

module.exports = executeLifecycle