const LifeCycleHandle = require('./handle')
const LifeCycleQuery = require('./query')
const CONSTANTS = require('../../config/constants')


const EVENTS = [
  'beforeCreate',
  'beforeCreateMany',
  'beforeUpdate',
  'beforeUpdateMany',
  'beforeDelete',
  'beforeDeleteMany',
]

function getEventFieldNames (event) {
  const attributes = event?.model?.attributes || {}
  return Object
    .entries(attributes)
    .filter(([key, value]) => {
      return value.customField === CONSTANTS.FIELD_NAME
    })
    .map(([key, value]) => key)
}

function subscribe(strapi) {
  strapi.db.lifecycles.subscribe(async (event) => {
    if (!EVENTS.includes(event.action)) {
      return
    }
    // 
    const { uid } = event.model
    // Attributes that are dynamic-enumeration fields
    const fieldNames = getEventFieldNames(event)
    if (!fieldNames.length) {
      return
    }

    console.log(event)

    const query = LifeCycleQuery({  
      strapi, 
      uid, 
      fieldNames, 
      attributes: event.model.attributes
    })
    const handle = LifeCycleHandle({ query, fieldNames })

    switch (event.action) {
      case 'beforeCreate': {
        const data = event.params.data
        await handle.onCreate(data) 
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

  })
}

module.exports = subscribe