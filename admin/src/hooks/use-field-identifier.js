import React from "react"

import pluginId from '../pluginId';

function useFieldIdentifier ({contentType, currentData, apiUid, name, options}) {
  const nameParts = name.split('.')

  if (options && options.global) {
    return {
      uid: `plugin::${pluginId}.globals`,
      name: options.global
    }
  }

  if (nameParts.length < 2) {
    return {
      uid: apiUid,
      name
    }
  }

  return React.useMemo(() => {
    const attributeName = nameParts[0]
    const fieldName = nameParts[nameParts.length - 1]
    
    const attributes = contentType.attributes[attributeName]
    const isDynamicZoze = attributes.type === 'dynamiczone'
    
    if (!isDynamicZoze) {
      const componentName = attributes.component
      return {
        uid: componentName,
        name: fieldName
      }
    }
    
    const index = parseInt(nameParts[1])
    const dynamicData = currentData[attributeName][index]
    const componentName = dynamicData.__component

    return {
      uid: componentName,
      name: fieldName
    }
  }, [contentType, currentData, apiUid, name])
}

export default useFieldIdentifier