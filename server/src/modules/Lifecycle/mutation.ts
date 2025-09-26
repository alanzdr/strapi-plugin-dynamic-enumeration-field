import QueueService from "~/services/Queue";
import { Struct, UID } from "@strapi/strapi";

import { IEnumerationEntity, IEnumerationInfo } from "~/types";
import CONSTANTS from "../../constants";

interface IEnumerationToMutate extends IEnumerationInfo {

  value: string;
}

class LifeCycleMutation {
  private uid: UID.ContentType;
  private queue: QueueService;

  constructor(private model: Struct.Schema) {
    this.queue = QueueService.getInstance();
    this.uid = model.uid as UID.ContentType;
  }
  
  private addEnumerationValue(enumeration: IEnumerationEntity, content: string) {
    let values = enumeration.values;

    const valueIndex = values.findIndex(
      (v) => v.content === content
    );

    if (valueIndex >= 0) {
      values[valueIndex].length += 1;
    } else {
      values.push({
        content,
        length: 1,
      })
    }
    enumeration.values = values;
    return enumeration
  }

  private removeEnumerationValue(enumeration: IEnumerationEntity, content: string) {
    let values = enumeration.values;

    const valueIndex = values.findIndex(
      (v) => v.content === content
    );

    if (valueIndex >= 0) {
      values[valueIndex].length -= 1;
      if (values[valueIndex].length <= 0) {
        values.splice(valueIndex, 1);
      }
    }

    enumeration.values = values;
    return enumeration
  }

  private async getEnumerations(data: any, dataLocale?: string): Promise<IEnumerationToMutate[]> {
    const enumerations: IEnumerationToMutate[] = [];
    const locale = await this.queue.getLocale(dataLocale)

    const fieldKeys = Object.entries(this.model.attributes)
      .filter(([key, value]) => {
        return (value as any).customField === CONSTANTS.FIELD_FULL_NAME;
      })
      .map(([key]) => key);

    for (const key of fieldKeys) {
      const value = data[key];
      if (!value || typeof value !== "string") {
        continue
      }

      const options = (this.model.attributes as any)[key]?.options;
      if (options && options.global) {
        enumerations.push({
          value,
          uid: CONSTANTS.GLOBALS_UID,
          name: options.global,
          locale,
        })
      } else {
        enumerations.push({
          value,
          uid: this.uid,
          name: key,
          locale,
        })
      }
    }

    return enumerations
  }

  public async mutate(data: any, dataLocale?: string, remove = false) {
    const enumerations =  await this.getEnumerations(data, dataLocale);

    for (const enumeration of enumerations) {
      const {
        value,
        ...info
      } = enumeration;

      this.queue.add(info, (current) => {
        if (remove) {
          return this.removeEnumerationValue(current, value);
        }
        return this.addEnumerationValue(current, value);
      })

    }

    await this.queue.execute();
  }



}

export default LifeCycleMutation;
