const dynamicEnumQueue = () => {
  const events = []
  let running = false

  const next = async () => {
    const event = events.shift()

    if (!event) {
      running = false
      return
    }

    try {
      await event.function()
      await event.resolve()
    } catch (error) {
      console.error(error)
      await event.reject(error)
    }

    next()
  }

  const execute = async (event) => {
    return new Promise((resolve, reject) => {
      events.push({
        function: event,
        resolve,
        reject
      })

      if (!running) {
        running = true
        next()
      }
    })
  }

  return {
    execute
  }
}

module.exports = dynamicEnumQueue