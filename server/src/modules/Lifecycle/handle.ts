import CONSTANTS from "../../constants";

const LifecycleHandle: any = ({ query, fieldNames }: any) => ({
  queue: strapi.service(CONSTANTS.QUEUE_SERVICE as any),
  async onCreate(data: any) {
    return this.queue.execute(async () => {
      const locale = data.locale;

      for (const fieldName of fieldNames) {
        const fieldData = data[fieldName];

        if (!fieldData || typeof fieldData !== "string") {
          continue;
        }

        const enumeration = await query.enum.get(fieldName, locale);

        if (enumeration) {
          let values = [...enumeration.values];

          const valueIndex = values.findIndex(
            (value) => value.content === fieldData
          );

          if (valueIndex >= 0) {
            values[valueIndex].length += 1;
          } else {
            values = [
              ...values,
              {
                content: fieldData,
                length: 1,
              },
            ];
          }

          await query.enum.update(enumeration.id, values);
        } else {
          await query.enum.create(fieldName, fieldData, locale);
        }
      }
    });
  },
  async onUpdate(before: any, current: any) {
    return this.queue.execute(async () => {
      // Enumerations
      const locale = before.locale;

      for (const fieldName of fieldNames) {
        const fieldData = current[fieldName];
        const beforeData = before[fieldName];

        if (fieldData === beforeData || fieldData == null) {
          continue;
        }

        const enumeration = await query.enum.get(fieldName, locale);

        if (enumeration) {
          let values = [...enumeration.values];
          //
          const oldValueIndex = values.findIndex(
            (value) => value.content === beforeData
          );
          if (oldValueIndex >= 0) {
            const newValue = Number(values[oldValueIndex].length) - 1;
            if (newValue <= 0) {
              values.splice(oldValueIndex, 1);
            } else {
              values[oldValueIndex].length = newValue;
            }
          }
          //
          if (fieldData) {
            const newValueIndex = values.findIndex(
              (value) => value.content === fieldData
            );
            if (newValueIndex >= 0) {
              values[newValueIndex].length += 1;
            } else {
              values = [
                ...values,
                {
                  content: fieldData,
                  length: 1,
                },
              ];
            }
          }

          await query.enum.update(enumeration.id, values);
        } else {
          if (!fieldData) {
            continue;
          }
          await query.enum.create(fieldName, fieldData, locale);
        }
      }
    });
  },
  async onDelete(data: any) {
    return this.queue.execute(async () => {
      // Enumerations
      const locale = data.locale;
      // Fields
      for (const fieldName of fieldNames) {
        const fieldData = data[fieldName];
        const enumeration = await query.enum.get(fieldName, locale);

        if (fieldData && enumeration) {
          let values = enumeration.values;
          const valueIndex = values.findIndex(
            (value: any) => value.content === fieldData
          );
          if (valueIndex >= 0) {
            const newValue = Number(values[valueIndex].length) - 1;
            if (newValue <= 0) {
              values = values.filter((value) => value.content !== fieldData);
            } else {
              values[valueIndex].length = newValue;
            }
          }

          await query.enum.update(enumeration.id, values);
        }
      }
    });
  },
});

export default LifecycleHandle;
