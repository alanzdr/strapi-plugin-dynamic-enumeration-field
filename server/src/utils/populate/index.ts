
import type { IPopulate, IPopulateObject } from './types'

import type { UID } from '@strapi/strapi'

import CONSTANTS from "../../constants";

const REMOVED_FIELDS = [
  'createdAt',
  'updatedAt',
  'publishedAt',
  'createdBy',
  'updatedBy',
  'localizations'
]

export function populateSchema(uid: UID.Schema, stack: UID.Schema[] = []): IPopulate {
  if (uid === 'admin::user') {
    return {
      populate: false,
    }
  }

  if (uid === 'plugin::upload.file') {
    return {
      populate: true,
    }
  }

  if (stack.includes(uid)) {
    return {
      populate: false,
    }
  }

  const nextStack = [...stack, uid]

  const populate: IPopulateObject = {}
  const fields: string[] = []

  const model = strapi.getModel(uid)

  const attributes = model.attributes

  const attributeEntries = Object.entries(attributes) as [string, any][]

  for (const [key, value] of attributeEntries) {
    if (!value || REMOVED_FIELDS.includes(key)) {
      continue
    }

    /** @FIELD */
    if (value.customField === CONSTANTS.FIELD_FULL_NAME) {
      fields.push(key)
      continue
    }

    /** @COMPONENT */
    if (value.type === 'component') {
      populate[key] = populateSchema(value.component, nextStack)
      continue
    }

    /** @DYNAMIC_ZONE */
    if (value.type === 'dynamiczone') {
      if (!value.components) {
        continue
      }

      const dynamicPopulate = value.components.reduce(
        (prev: Record<string, IPopulateObject>, currentComponent) => {
          const componentPopulate = populateSchema(currentComponent, nextStack)
          return {
            ...prev,
            [currentComponent]: componentPopulate,
          } as IPopulateObject
        },
        {} as Record<string, IPopulateObject>
      )
      populate[key] = { on: dynamicPopulate }
      continue
    }

    /** @RELATION */
    if (value.type === 'relation') {
      populate[key] = populateSchema(value.target, nextStack)
    }

    /** @MEDIA */
    if (value.type === 'media') {
      populate[key] = true
    }
  }

  return {
    populate,
    fields
  }
}
