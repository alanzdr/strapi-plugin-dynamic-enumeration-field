const executeLifecycle = require('./execute')

const EVENTS = [
  'beforeCreate',
  'beforeCreateMany',
  'afterCreate',
  'beforeUpdate',
  'beforeUpdateMany',
  'beforeDelete',
  'beforeDeleteMany',
]

function subscribe(strapi) {
  strapi.db.lifecycles.subscribe(async (event) => {
    if (!EVENTS.includes(event.action)) {
      return
    }
    await executeLifecycle(event)
  })
}

module.exports = subscribe