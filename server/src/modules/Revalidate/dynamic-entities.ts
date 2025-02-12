import CONSTANTS from "../../constants";
import { Core } from "@strapi/strapi";

interface IUpdatedDynamicData {
  locale: string;
  uid: string;
  name: string;
  values: Array<{
    content: string;
    length: number;
  }>;
}

async function updateOrCreateDynamicData(
  strapi: Core.Strapi,
  data: IUpdatedDynamicData
) {
  console.log(
    "[DYNAMIC-ENUMERATION-FIELD]",
    "Locale:",
    data.locale,
    "Updating:",
    `${data.uid}.${data.name}`
  );
  const query = strapi.db.query(CONSTANTS.ENUMERATION_CONTENT_TYPE);

  const existResponse = await query.findOne({
    select: ["id"],
    where: {
      locale: data.locale,
      uid: data.uid,
      name: data.name,
    },
  });

  if (existResponse) {
    await query.update({
      where: {
        id: existResponse.id,
      },
      data: {
        values: data.values,
      },
    });
  } else {
    await query.create({ data });
  }
}

async function updateDynamicEntities(strapi: Core.Strapi, collectionsData) {
  const parallelPromises = new Map<string, Promise<void>[]>();

  const addData = (key: string, data: IUpdatedDynamicData) => {
    if (!parallelPromises.has(key)) {
      parallelPromises.set(key, []);
    }

    const promise = updateOrCreateDynamicData(strapi, data);
    parallelPromises.get(key).push(promise);
  };

  for (const locale in collectionsData) {
    for (const uid in collectionsData[locale]) {
      for (const name in collectionsData[locale][uid]) {
        const values = [];
        const valuesNames = collectionsData[locale][uid][name];
        for (const valuesName in valuesNames) {
          if (!valuesName) {
            continue;
          }
          values.push({
            content: valuesName,
            length: valuesNames[valuesName],
          });
        }

        const data: IUpdatedDynamicData = {
          locale,
          uid,
          name,
          values,
        };

        addData(`${locale}-${uid}`, data);
      }
    }
  }

  const promises = Array.from(parallelPromises.values());

  await Promise.all(promises.map((promises) => Promise.all(promises)));
}

export default updateDynamicEntities;
