(function (PLUGIN_ID) {
  kintone.events.on(['app.record.index.show',], (event) => {
    // Fetch records using Kintone API
    kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', { app: 1 }, function (resp) {
      console.log(resp.records);
      localStorage.setItem('kintoneRecords', JSON.stringify(resp.records));
      let storedRecords = JSON.parse(localStorage.getItem('kintoneRecords'));
      if (storedRecords) {
        console.log('Retrieved records from localStorage:', storedRecords);
        storedRecords.forEach(record => {
          for (let field in record) {
            if (record[field].type == 'DROP_DOWN' || record[field].type == 'NUMBER' || record[field].type == 'SINGLE_LINE_TEXT') {
              console.log(`Field: ${field}, Type: ${record[field].type}, Value: ${record[field].value}`);
            }
          }
        });
      } else {
        console.log('No records found in localStorage.');
      }
    });
  });
})(kintone.$PLUGIN_ID);
