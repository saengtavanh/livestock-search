(function (PLUGIN_ID) {
  kintone.events.on(['app.record.index.show', 'app.record.edit.show'], async (event) => {
    window.RsComAPI.getRecords({ app: 1 })
      .then(dataFromMaster => {
        sessionStorage.setItem('kintoneRecords', JSON.stringify(dataFromMaster));
        sessionStorage.setItem('dataspace', JSON.stringify([{
          spc: 'spaceA',
          kind: '品種',
          code: '品種CD',
          name: '品種',
          required: true
        },
        {
          spc: 'spaceB',
          kind: '性別',
          code: '性別CD',
          name: '性別',
          required: true
        },
        {
          spc: 'spaceC',
          kind: '產地',
          code: '產地CD',
          name: '產地',
          required: true
        },
        {
          spc: 'spaceD',
          kind: '預託区分',
          code: '預託区分CD',
          name: '預託区分',
          required: true
        }]));
      });

    // Get space in App LiveStock
    let GETSPACE = await kintone.api("/k/v1/preview/app/form/layout.json", "GET", {
      app: kintone.app.getId()
    });

    let SPACE = GETSPACE.layout.reduce((setSpace, layoutFromApp) => {
      if (layoutFromApp.type === "GROUP") {
        layoutFromApp.layout.forEach(layoutItem => {
          layoutItem.fields.forEach(field => {
            if (field.type === "SPACER") {
              setSpace.push({
                type: "space",
                value: field.elementId
              });
            }
          });
        });
      } else {
        layoutFromApp.fields.forEach(field => {
          if (field.type === "SPACER") {
            setSpace.push({
              type: "space",
              value: field.elementId
            });
          }
        });
      }
      return setSpace;
    }, []);

    let sortedSpaces = SPACE.sort((a, b) => {
      return a.value.localeCompare(b.value);
    });

    let storedRecords = JSON.parse(sessionStorage.getItem('kintoneRecords'));
    let storedDataSpace = JSON.parse(sessionStorage.getItem('dataspace'));

    if (storedDataSpace && storedDataSpace.length > 0) {
      storedDataSpace.forEach(item => {
        sortedSpaces.forEach(space => {
          let selectElement;
          if (item.spc === space.value) {
            let filteredRecords = storedRecords.filter(rec => rec.Type.value == item.kind);
            let blankElement = kintone.app.record.getSpaceElement(space.value);

            if (blankElement) {
              let label = $('<div>', {
                class: 'kintoneplugin-title',
                html: item.name + (item.required ? '<span class="kintoneplugin-require">*</span>' : '')
              });
              let divMain = $('<div>', { class: 'custom-main' });
              let containerDiv = $('<div>', { class: 'custom-container' });
              let inputBox = $('<input>', {
                type: 'number',
                class: 'modern-input-box kintoneplugin-input-text',
                min: '0'
              });
              let dropdownOuter = $('<div>', { class: 'kintoneplugin-select-outer' });
              let dropdown = $('<div>', { class: 'kintoneplugin-select' });
              selectElement = $('<select>');
              selectElement.append($('<option>').attr('value', '-----').text('-----'));

              // Populate dropdown with stored records
              if (filteredRecords.length > 0) {
                filteredRecords.forEach(record => {
                  console.log(record);

                  selectElement.append($('<option>')
                    .attr('value', record.name.value)
                    .attr('code', record.code.value)
                    .attr('types', record.Type.value)
                    .text(record.name.value));
                });
              }

              inputBox.on('input', function () {
                let inputValue = $(this).val();
                inputValue = inputValue.replace(/[^0-9]/g, '');
                if (this.value.startsWith('0') && this.value.length > 1) {
                  this.value = this.value.replace(/^0+/, '');
                }
                let nearestSelect = $(this).closest('.custom-container').find('.kintoneplugin-select select');
                if (nearestSelect.length > 0) {
                  if (filteredRecords.length > 0) {
                    let matchFound = false;
                    filteredRecords.forEach(record => {
                      if (record.code.value == inputValue) {
                        let existingOption = nearestSelect.find(`option[value="${record.name.value}"]`);
                        if (existingOption.length > 0) {
                          existingOption.prop('selected', true);
                        } else {
                          let newOption = $('<option>').attr('value', record.name.value).text(record.name.value);
                          nearestSelect.append(newOption);
                          newOption.prop('selected', true);
                        }
                        matchFound = true;
                      }
                    });

                    if (!matchFound) {
                      let defaultOption = nearestSelect.find('option[value="-----"]');
                      if (defaultOption.length > 0) {
                        defaultOption.prop('selected', true);
                      } else {
                        let newDefaultOption = $('<option>').attr('value', "-----").text("-----");
                        nearestSelect.append(newDefaultOption);
                        newDefaultOption.prop('selected', true);
                      }
                    }
                  }
                }
              });

              selectElement.on('change', function (e) {
                const selectedOption = $(e.target).find('option:selected');
                let nearestInput = $(this).closest('.custom-container').find('.kintoneplugin-input-text');
                nearestInput.val('');
                const selectedCode = selectedOption.attr('code');
                const selectedValue = selectedOption.attr('value');
                const selectedType = selectedOption.attr('types');
                nearestInput.val(selectedCode);
                if (item.kind == selectedType) {
                  const record = kintone.app.record.get();
                  const fieldCode = item.name;
                  const fieldCode2 = item.code;
                  record.record[fieldCode].value = selectedValue;
                  record.record[fieldCode2].value = selectedCode;
                  kintone.app.record.set(record);
                }
              });

              // selectElement.on('change', function (e) {
              //   const selectedOption = $(e.target).find('option:selected');
              //   let nearestInput = $(this).closest('.custom-container').find('.kintoneplugin-input-text');
              //   nearestInput.val('');
              //   nearestInput.val(selectedOption.attr('code'));
              //   const record = kintone.app.record.get();
              //   console.log(record);

              //   const fieldCode = '品種'; // Replace 'yourFieldCode' with the actual field code
              //   const fieldCode2 = '品種CD'; // Replace 'yourFieldCode' with the actual field code
              //   record.record[fieldCode].value = selectedCode;
              //   record.record[fieldCode2].value = selectedCode;
              //   kintone.app.record.set(record);
              // });

              dropdown.append(selectElement);
              dropdownOuter.append(dropdown);
              containerDiv.append(inputBox).append(dropdownOuter);
              divMain.append(label);
              divMain.append(containerDiv);
              $(blankElement).append(divMain);
            }
          }
        });

        // Hide fields by code and name
        kintone.app.record.setFieldShown(item.code, false);
        kintone.app.record.setFieldShown(item.name, false);
      });
    }
  });
  kintone.events.on('app.record.edit.submit', async (event) => {
    const dropdowns = $('.custom-container .kintoneplugin-select select');
    dropdowns.each(function (index, dropdown) {
      const selectedValue = $(dropdown).val();
      console.log(`Dropdown ${index + 1} Selected Value: `, selectedValue);
    });
    const inputBoxes = $('.custom-container .kintoneplugin-input-text');
    inputBoxes.each(function (index, inputBox) {
      const inputValue = $(inputBox).val();
      console.log(`Input Box ${index + 1} Value: `, inputValue);
    });
  });


})(kintone.$PLUGIN_ID);
