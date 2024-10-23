jQuery.noConflict();
(async function ($, Swal10,PLUGIN_ID) {

  window.RsComAPI.getRecords({ app: 234 })
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
  const config = {
    search_displays: [
      {
        name_marker: "TextInitial",
        group_name: "TextInitial",
        search_length: "1rem 10px",
        search_type: "text_initial"
      },
      {
        name_marker: "textPartial",
        group_name: "textPartial",
        search_length: "1rem 10px",
        search_type: "text_partial"
      },
      {
        name_marker: "textExact",
        group_name: "textExact",
        search_length: "1rem 10px",
        search_type: "text_exact"
      },
      {
        name_marker: "MultiTextInitial",
        group_name: "MultiTextInitial",
        search_length: "1rem 10px",
        search_type: "MultiText_initial"
      },
      {
        name_marker: "MultiTextPartial",
        group_name: "MultiTextPartial",
        search_length: "1rem 10px",
        search_type: "MultiText_Partial"
      },
      {
        name_marker: "NumberExact",
        group_name: "NumberExact",
        search_length: "1rem 10px",
        search_type: "Number_Exact"
      },
      {
        name_marker: "NumberRange",
        group_name: "NumberRange",
        search_length: "1rem 10px",
        search_type: "Number_Range"
      },
      {
        name_marker: "DateExact",
        group_name: "DateExact",
        search_length: "1rem 10px",
        search_type: "Date_Exact"
      },
      {
        name_marker: "DateRange",
        group_name: "DateRange",
        search_length: "1rem 10px",
        search_type: "Date_Range"
      },
      {
        name_marker: "DropdownExact",
        group_name: "DropdownExact",
        search_length: "1rem 10px",
        search_type: "Dropdown_Exact"
      },
      {
        name_marker: "",
        group_name: "DropdownExactEmpy",
        search_length: "1rem 10px",
        search_type: "Dropdown_Exact"
      },
      {
        name_marker: "DropdownExactTest",
        group_name: "DropdownExactTest",
        search_length: "1rem 10px",
        search_type: "Dropdown_Exact"
      },
    ],
    search_content: [
      {
        group_name: "TextInitial",
        search_name: "food",
        code_master_id: "",
        target_field: "TextInitialCode",
        field_for_search: "foodSearch"
      },
      {
        group_name: "textPartial",
        search_name: "food1",
        code_master_id: "",
        target_field: "textPartialCode",
        field_for_search: "foodSearch"
      },
      {
        group_name: "textExact",
        search_name: "food12",
        code_master_id: "",
        target_field: "textExactCode",
        field_for_search: "foodSearch"
      },
      {
        group_name: "MultiTextInitial",
        search_name: "food2134",
        code_master_id: "",
        target_field: "MultiTextInitialCode",
        field_for_search: "foodSearch"
      },
      {
        group_name: "MultiTextPartial",
        search_name: "food000",
        code_master_id: "",
        target_field: "MultiTextPartialCode",
        field_for_search: "foodSearch"
      },
      {
        group_name: "NumberExact",
        search_name: "food0033",
        code_master_id: "",
        target_field: "NumberExactCode",
        field_for_search: "foodSearch"
      },
      {
        group_name: "NumberRange",
        search_name: "food0033",
        code_master_id: "",
        target_field: "NumberRangeCode",
        field_for_search: "foodSearch"
      },
      {
        group_name: "DateExact",
        search_name: "food0033",
        code_master_id: "",
        target_field: "DateExactCode",
        field_for_search: "foodSearch"
      },
      {
        group_name: "DateRange",
        search_name: "food0033",
        code_master_id: "",
        target_field: "DateRangeCode",
        field_for_search: "foodSearch"
      },
      {
        group_name: "DropdownExact",
        search_name: "fark111",
        code_master_id: "",
        target_field: "TextInitialCode",
        field_for_search: "foodSearch"
      },
      {
        group_name: "DropdownExact",
        search_name: "fark000",
        code_master_id: "",
        target_field: "DropdownExact",
        field_for_search: "foodSearch"
      },
      {
        group_name: "DropdownExactEmpy",
        search_name: "fark999",
        code_master_id: "",
        target_field: "DropdownExact",
        field_for_search: "foodSearch"
      },
      {
        group_name: "DropdownExactEmpy",
        search_name: "fark888",
        code_master_id: "",
        target_field: "NumberExactCode",
        field_for_search: "foodSearch"
      },
      {
        group_name: "DropdownExactTest",
        search_name: "Test1",
        code_master_id: "",
        target_field: "DropdownExact",
        field_for_search: "foodSearch"
      },
      {
        group_name: "DropdownExactTest",
        search_name: "Test2",
        code_master_id: "",
        target_field: "TextInitialCode",
        field_for_search: "foodSearch"
      },
    ],
    code_master: [
      {
        master_id: "12345678",
        app_id: "",
        api_token: "",
        code_field: "",
        name_field: "",
        type: "",
      }
    ]
  };

  // Event listener for showing the record index page
  kintone.events.on('app.record.index.show', async (event) => {

    let records = await window.RsComAPI.getRecords({ app: kintone.app.getId() });
    console.log("records", records);
    const spaceEl = kintone.app.getHeaderSpaceElement();
    if (!spaceEl) {
      throw new Error('The header element is unavailable on this page.');
    }
    const $spaceEl = $(spaceEl).css({
      'display': 'flex',
      'flex-wrap': 'wrap',
      'gap': '10px',
      'justify-content': 'flex-start',
      'marginBottom': '50px'
    });
    let space = [];
    console.log(space);
    function createDropDowns(config) {
      config.search_displays.forEach((display) => {
        if (display.search_type === "Dropdown_Exact") {
          // Filter related content based on group_name
          let relatedContent = config.search_content.filter(
            (content) => content.group_name === display.group_name
          );

          // Only show content if `name_marker` is not empty
          if (display.name_marker) {
            relatedContent = relatedContent.filter((content) => content.group_name === display.group_name);
          }

          if (relatedContent.length > 0) {
            const $dropDownTitle = $("<label>")
              .text(display.name_marker ? display.group_name : relatedContent[0].search_name)
              .css({ color: "#4CAF50" });

            // Conditionally set the cursor to "pointer" if name_marker is empty
            if (display.name_marker === "") {
              $dropDownTitle.css({ cursor: "pointer" });

              // Event listener for clicking the dropDownTitle (shows SweetAlert pop-up)
              $dropDownTitle.on("click", function () {
                const filteredItems = config.search_content.filter(
                  (content) => content.group_name === display.group_name && !display.name_marker
                );
                console.log("filteredItems", filteredItems);

                const itemsList = filteredItems.map((content) => content.search_name);

                // Use SweetAlert to display a selection pop-up
                Swal10.fire({
                  title: 'Select an Item',
                  input: 'select',
                  inputOptions: itemsList.reduce((options, item, index) => {
                    options[index] = item;
                    return options;
                  }, {}),
                  showCancelButton: true,
                  // inputValidator: (value) => {
                  //   return new Promise((resolve) => {
                  //     if (value === '') {
                  //       resolve('You need to select something!');
                  //     } else {
                  //       resolve();
                  //     }
                  //   });
                  // }
                }).then((result) => {
                  console.log("object54545", result.value);
                  if (result.value !== undefined) {
                    const selectedItem = itemsList[result.value];
                    console.log("selectedItem", selectedItem);

                    // Update the title of the drop-down with the selected item
                    $dropDownTitle.text(selectedItem);

                    // Filter and update the drop-down options to show only the selected item
                    $dropDown.empty();

                    const selectedContent = filteredItems.find(
                      (content) => content.search_name === selectedItem
                    );
                    console.log("object", selectedContent);
                    for (let item of records) {
                      const $selectedOption = $("<option>")
                        .text(item[selectedContent.target_field].value)
                        .attr('value', item[selectedContent.target_field].value);
                      $dropDown.append($selectedOption);
                    }
                  }
                });
              });
            }
            // Create drop-down
            const $dropDown = $("<select>")
              .addClass("kintoneplugin-dropdown")
              .attr("name", "mySelect")
              .css({ width: display.search_length });

            // Add default option
            const $defaultOption = $("<option>")
              .text('-----')
              .val('');
            $dropDown.append($defaultOption);


            // Event listener for when the dropdown value changes
            $dropDown.on('change', function (e) {
              console.log("value::", e.target.value);
              const selectedValue = $(this).val();
              console.log("Selected value:", selectedValue);
            });

            // Set specific option value if name_marker is not empty
            if (display.name_marker) {
              let filteredRecords = config.search_content.filter(item => item.group_name == display.group_name);
              console.log('filteredRecords', filteredRecords);
              for (let item of filteredRecords) {
                console.log('target', item.target_field);
                for (let record of records) {
                  if (!record[item.target_field].value) continue;
                  const $option = $("<option>")
                    .text(record[item.target_field].value)
                    .attr('value', record[item.target_field].value);
                  $dropDown.append($option);
                }
              }

              console.log("1");


            } else {
              const initialContent = relatedContent[0];
              $dropDownTitle.text(initialContent.search_name);

              $dropDown.empty();
              for (let item of records) {
                const $initialOption = $("<option>")
                  .text(item[initialContent.target_field].value)
                  .attr('value', item[initialContent.target_field].value);
                $dropDown.append($initialOption);
              }
              console.log("2");
            }

            let selected = $("select[name='mySelect'] option:selected");

            console.log("selected ++++", selected.val());

            const $element = $('<div></div>').addClass('search-item').css({
              'display': 'flex',
              'flex-direction': 'column',
              'gap': '5px'
            });
            $element.append($dropDownTitle);
            $element.append($dropDown);
            space.push($element);
            // $spaceEl.append($element);
          }
        }
      });
    }
    createDropDowns(config);

    // Functions for creating each input type
    function createTextInput() {
      const $input = $('<input>').attr('type', 'text').addClass('kintoneplugin-input-text');

      $input.on('change', function () {
        console.log("Text Input:", $(this).val());
      });

      return $input;
    }

    function createTextArea() {
      const textarea = new Kuc.TextArea({
        requiredIcon: true,
        className: 'options-class',
        id: 'options-id',
        visible: true,
        disabled: false
      });

      textarea.addEventListener('change', event => {
        console.log("TextArea:", event.detail.value);
      });
      return textarea;
    }

    function createNumberInput() {
      const $input = $('<input>').attr('type', 'number').addClass('kintoneplugin-input-text');

      $input.on('change', function () {
        console.log("Number Input:", $(this).val());
      });
      return $input;
    }

    function createNumberRangeInput() {
      const $rangeMin = $('<input>').attr('type', 'number').attr('placeholder', 'Min').addClass('kintoneplugin-input-text');
      const $rangeMax = $('<input>').attr('type', 'number').attr('placeholder', 'Max').addClass('kintoneplugin-input-text');
      const $separatornumber = $('<span>⁓</span>').css({ 'margin': '0', 'font-size': '20px', 'align-self': 'center' });

      const $wrapperd = $('<div></div>').css({ 'display': 'flex', 'align-items': 'center', 'gap': '10px' });
      $wrapperd.append($rangeMin).append($separatornumber).append($rangeMax);

      $rangeMin.on('change', function () {
        console.log("Range Min:", $(this).val());
      });

      $rangeMax.on('change', function () {
        console.log("Range Max:", $(this).val());
      });

      return $wrapperd;
    }

    function createDateInput() {
      const datePicker = new Kuc.DatePicker({
        requiredIcon: true,
        language: 'auto',
        className: 'options-class',
        id: 'options-id',
        visible: true,
        disabled: false
      });

      datePicker.addEventListener('change', event => {
        console.log("DatePicker", event.detail.value);
      });

      return datePicker;
    }

    function createDateRangeInput() {
      const datePickerFirst = new Kuc.DatePicker({
        requiredIcon: true,
        language: 'auto',
        className: 'options-class',
        id: 'start-date-picker',
        visible: true,
        disabled: false
      });

      datePickerFirst.addEventListener('change', event => {
        console.log("Start Date", event.detail.value);
      });

      const datePickerFinally = new Kuc.DatePicker({
        requiredIcon: true,
        language: 'auto',
        className: 'options-class',
        id: 'end-date-picker',
        visible: true,
        disabled: false
      });

      datePickerFinally.addEventListener('change', event => {
        console.log("End Date", event.detail.value);
      });

      const $separator = $('<span>⁓</span>').css({ 'margin': '0', 'font-size': '20px', 'align-self': 'center' });

      const $wrapper = $('<div></div>').css({ 'display': 'flex', 'align-items': 'center', 'gap': '10px' });
      $wrapper.append(datePickerFirst).append($separator).append(datePickerFinally);

      return $wrapper;
    }
    const $searchButton = $('<button>')
      .text('Search')
      .addClass('kintoneplugin-button-dialog-ok')
      .css({ backgroundColor: '#4CAF50' })
      .on('click', function () {
        alert('Search button clicked!');
        // Add search logic here
      });

    const $clearButton = $('<button>')
      .text('Clear')
      .addClass('kintoneplugin-button-dialog-ok')
      .css({ backgroundColor: '#4CAF50' })
      .on('click', function () {
        alert('Clear button clicked!');
        // Add clear logic here
      });

    config.search_displays.forEach((searchItem) => {
      const { search_type, group_name } = searchItem;

      const $element = $('<div></div>').addClass('search-item').css({
        'display': 'flex',
        'flex-direction': 'column',
        'gap': '5px'
      });

      let inputElement;

      switch (search_type) {
        case 'text_initial':
        case 'text_partial':
        case 'text_exact':
          inputElement = createTextInput();
          break;
        case 'MultiText_initial':
        case 'MultiText_Partial':
          inputElement = createTextArea();
          break;
        case 'Number_Exact':
          inputElement = createNumberInput();
          break;
        case 'Number_Range':
          inputElement = createNumberRangeInput();
          break;
        case 'Date_Exact':
          inputElement = createDateInput();
          break;
        case 'Date_Range':
          inputElement = createDateRangeInput();
          break;
        // case 'Dropdown_Exact':
        //   inputElement = createDropDowns(config);
        //   break;
        default:
          inputElement = null;
      }
      if (inputElement) {
        $(inputElement).css({
          'width': searchItem.search_length
        });
        const $label = $('<label>').text(group_name);
        $element.append($label).append(inputElement);
        space.push($element)
        // $spaceEl.append($element);
      }
    });
    $spaceEl.append(space);
    $spaceEl.append($searchButton, $clearButton);
  });
  
  kintone.events.on('app.record.edit.show', async (event) => {
    const record = event.record;
    window.RsComAPI.getRecords({ app: 255 })
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
            let filteredRecords = storedRecords.filter(rec => rec.type.value == item.kind);
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
                  selectElement.append($('<option>')
                    .attr('value', record.name.value)
                    .attr('code', record.code.value)
                    .attr('types', record.type.value)
                    .text(record.name.value));
                });
              }
              console.log(record);
              inputBox.on('input', function () {
                let inputValue = $(this).val().replace(/[^0-9]/g, ''); // Keep only numbers
                if (inputValue.startsWith('0') && inputValue.length > 1) {
                  inputValue = inputValue.replace(/^0+/, ''); // Remove leading zeros
                }

                if (filteredRecords.length > 0) {
                  let matchFound = false;
                  filteredRecords.forEach(record => {
                    if (record.code.value === inputValue) {
                      let existingOption = selectElement.find(`option[value="${record.name.value}"]`);
                      let selectedType = existingOption.attr('types');
                      let selectedCode = existingOption.attr('code');
                      let selectedValue = existingOption.attr('value');
                      if (existingOption.length > 0) {
                        existingOption.prop('selected', true);
                        setField(selectedCode, selectedValue, selectedType)
                      } else {
                        let newOption = $('<option>').attr('value', record.name.value).text(record.name.value);
                        selectElement.append(newOption);
                        newOption.prop('selected', true);
                      }
                      matchFound = true;
                    }

                  });

                  if (!matchFound) {
                    let defaultOption = selectElement.find('option[value="-----"]');
                    if (defaultOption.length > 0) {
                      defaultOption.prop('selected', true);
                    } else {
                      let newDefaultOption = $('<option>').attr('value', '-----').text('-----');
                      selectElement.append(newDefaultOption);
                      newDefaultOption.prop('selected', true);
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
                setField(selectedCode, selectedValue, selectedType)
              });

              function setField(selectedCode, selectedValue, selectedType) {
                if (item.kind == selectedType) {
                  const record = kintone.app.record.get();
                  const fieldCode = item.name;
                  const fieldCode2 = item.code;
                  record.record[fieldCode].value = selectedValue;
                  record.record[fieldCode2].value = selectedCode;
                  kintone.app.record.set(record);
                }
              }
              dropdown.append(selectElement);
              dropdownOuter.append(dropdown);
              containerDiv.append(inputBox).append(dropdownOuter);
              divMain.append(label);
              divMain.append(containerDiv);
              $(blankElement).append(divMain);

              selectElement.each(function (index, selectElement) {
                $(selectElement).find('option').each(function (optionIndex, optionElement) {
                  const codeValue = $(optionElement).attr('code');
                  const typeValue = $(optionElement).attr('types');
                  const optionValue = $(optionElement).val();
                  $.each(record, function (fieldKey, fieldValue) {
                    if (typeValue === fieldKey) {
                      const fieldValueContent = fieldValue.value;
                      if (fieldValueContent === optionValue) {
                        $(optionElement).prop('selected', true);
                        //setField(codeValue, optionValue, typeValue);
                        const correspondingInputBox = inputBox.eq(index);
                        console.log(correspondingInputBox);
                        correspondingInputBox.val(codeValue);
                        return false;
                      }
                    }
                  });
                });
              });
            }
          }
        });

        // Hide fields by code and name
        kintone.app.record.setFieldShown(item.code, false);
        kintone.app.record.setFieldShown(item.name, false);
      });
    }
    return event;
  });
})(jQuery, Sweetalert2_10.noConflict(true),kintone.$PLUGIN_ID);