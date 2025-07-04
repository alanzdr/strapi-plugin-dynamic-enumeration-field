import QueueService from "~/services/Queue";

import LifecycleProvider from "./provider";
import { IEnumerationEntity, IEnumerationInfo } from "~/types";
import { inspect } from "util";



class LifeCycleMutation {
  private queue: QueueService;

  constructor(private provider: LifecycleProvider) {
    this.queue = QueueService.getInstance();
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

  public async mutate(data: any, locale?: string, remove = false) {
    let promises: Promise<void>[] = [];

    for (const fieldName of this.provider.fieldNames) {
      const enumeration: IEnumerationInfo = {
        uid: this.provider.uid,
        name: fieldName,
        locale,
      }

      const value = data[fieldName];

      if (!value || typeof value !== "string") {
        continue
      } 

      const queue = this.queue.execute(enumeration, (current) => {
        if (remove) {
          return this.removeEnumerationValue(current, value);
        }
        return this.addEnumerationValue(current, value)
      })

      promises.push(queue);
    }

    await Promise.all(promises);
  }



}

export default LifeCycleMutation;
