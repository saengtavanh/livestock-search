jQuery.noConflict();
(async function ($, Swal10, PLUGIN_ID) {
  const config = JSON.parse((kintone.plugin.app.getConfig(PLUGIN_ID)).config);
  console.log(config);
  kintone.events.on(['app.record.edit.show', 'app.record.create.show', 'app.record.create.submit', 'app.record.edit.submit.success'], async (event) => {
    let record = event.record;
    let updateRecord = {};
    config.searchContent.forEach((searchItem) => {
      config.groupSetting.forEach((item) => {
        if (item.groupName === searchItem.groupName) {
          if (
            item.searchType === "text_initial" ||
            item.searchType === "text_patial" ||
            item.searchType === "text_exact" ||
            item.searchType === "multi_text_initial" ||
            item.searchType === "multi_text_patial"
          ) {
            if (event.type === 'app.record.create.show') {
              record[searchItem.fieldForSearch].disabled = true;
            } else {
              let targetValue = record[searchItem.searchTarget].value;
              record[searchItem.fieldForSearch].disabled = true;
              console.log(targetValue);
              let convertedValue = "";
              if (targetValue == "" || targetValue == undefined) {
                convertedValue = ""
              } else {
                switch (item.searchType) {
                  case "text_initial":
                  case "multi_text_initial":
                    convertedValue = `_,${targetValue.split('').join(',')}`;
                    break;
                  case "text_patial":
                  case "multi_text_patial":
                    convertedValue = `${targetValue.split('').join(',')}`;
                    break;
                  case "text_exact":
                    convertedValue = `_,${targetValue.split('').join(',')},_`;
                    break;
                  default:
                    break;
                }
              }
              updateRecord[searchItem.fieldForSearch] = {
                value: convertedValue
              }
              record[searchItem.fieldForSearch].value = convertedValue;
            }
          }
        }
      });
    });
    if (event.type == 'app.record.create.submit' || event.type == 'app.record.edit.submit.success') {
      let body = {
        app: kintone.app.getId(),
        records: [
          {
            id: kintone.app.record.getId(),
            record: updateRecord
          }
        ]
      };
      try {
        await kintone.api(kintone.api.url('/k/v1/records.json', true), 'PUT', body)
      } catch (error) {
        console.log(error);
      }
    }
    return event;
  });
})(jQuery, Sweetalert2_10.noConflict(true), kintone.$PLUGIN_ID);
