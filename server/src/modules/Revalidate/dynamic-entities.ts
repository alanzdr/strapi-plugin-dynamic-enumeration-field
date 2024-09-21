import CONSTANTS from "../../constants";

async function updateOrCreateDynamicData(strapi, data) {
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

async function updateDynamicEntities(strapi, collectionsData) {
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

        const data = {
          locale,
          uid,
          name,
          values,
        };

        await updateOrCreateDynamicData(strapi, data);
      }
    }
  }
}

export default updateDynamicEntities;
