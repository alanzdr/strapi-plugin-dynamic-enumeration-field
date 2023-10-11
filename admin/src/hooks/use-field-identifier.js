import React from "react"

import CONSTANTS from '../constants';
import useLocale from './use-locale';

function useFieldIdentifier ({contentType, currentData, apiUid, name, options}) {
  const locale = useLocale()
  
  return React.useMemo(() => {
    const nameParts = name.split('.')
    
    if (options && options.global) {
      return {
        uid: CONSTANTS.GLOBALS_UID,
        name: options.global,
        locale
      }
    }
  
    if (nameParts.length < 2) {
      return {
        uid: apiUid,
        name,
        locale
      }
    }

    const attributeName = nameParts[0]
    const fieldName = nameParts[nameParts.length - 1]
    
    const attributes = contentType.attributes[attributeName]
    const isDynamicZoze = attributes.type === 'dynamiczone'
    
    if (!isDynamicZoze) {
      const componentName = attributes.component
      return {
        uid: componentName,
        name: fieldName,
        locale
      }
    }
    
    const index = parseInt(nameParts[1])
    const dynamicData = currentData[attributeName][index]
    const componentName = dynamicData.__component

    return {
      uid: componentName,
      name: fieldName,
      locale
    }
  }, [contentType, currentData, apiUid, name, options, locale])
}

export default useFieldIdentifier