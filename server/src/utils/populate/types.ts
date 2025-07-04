export type IPopulateObject = 
  boolean | 
  Record<string, 
    IPopulate | 
    { on: Record<string, IPopulate> } | 
    boolean
  >


export interface IPopulate {
  fields?: string[]
  populate?: IPopulateObject
}
