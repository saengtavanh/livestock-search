jQuery.noConflict();
(async function ($, Swal10, PLUGIN_ID) {

  window.RsComAPI.getRecords({ app: 262 })
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
  // const config = {
  //   search_displays: [
  //     {
  //       name_marker: "TextInitial",
  //       group_name: "TextInitial",
  //       search_length: "1rem 10px",
  //       search_type: "text_initial"
  //     },
  //     {
  //       name_marker: "textPartial",
  //       group_name: "textPartial",
  //       search_length: "1rem 10px",
  //       search_type: "text_partial"
  //     },
  //     // {
  //     //   name_marker: "textExact",
  //     //   group_name: "textExact",
  //     //   search_length: "1rem 10px",
  //     //   search_type: "text_exact"
  //     // },
  //     // {
  //     //   name_marker: "MultiTextInitial",
  //     //   group_name: "MultiTextInitial",
  //     //   search_length: "1rem 10px",
  //     //   search_type: "MultiText_initial"
  //     // },
  //     // {
  //     //   name_marker: "MultiTextPartial",
  //     //   group_name: "MultiTextPartial",
  //     //   search_length: "1rem 10px",
  //     //   search_type: "MultiText_Partial"
  //     // },
  //     // {
  //     //   name_marker: "NumberExact",
  //     //   group_name: "NumberExact",
  //     //   search_length: "1rem 10px",
  //     //   search_type: "Number_Exact"
  //     // },
  //     // {
  //     //   name_marker: "NumberRange",
  //     //   group_name: "NumberRange",
  //     //   search_length: "1rem 10px",
  //     //   search_type: "Number_Range"
  //     // },
  //     // {
  //     //   name_marker: "DateExact",
  //     //   group_name: "DateExact",
  //     //   search_length: "1rem 10px",
  //     //   search_type: "Date_Exact"
  //     // },
  //     // {
  //     //   name_marker: "DateRange",
  //     //   group_name: "DateRange",
  //     //   search_length: "1rem 10px",
  //     //   search_type: "Date_Range"
  //     // },
  //     {
  //       name_marker: "DropdownExact",
  //       group_name: "DropdownExact",
  //       search_length: "1rem 10px",
  //       search_type: "Dropdown_Exact"
  //     },
  //     {
  //       name_marker: "",
  //       group_name: "DropdownExactEmpy",
  //       search_length: "1rem 10px",
  //       search_type: "Dropdown_Exact"
  //     },
  //     {
  //       name_marker: "DropdownExactTest",
  //       group_name: "DropdownExactTest",
  //       search_length: "1rem 10px",
  //       search_type: "Dropdown_Exact"
  //     },
  //   ],
  //   search_content: [
  //     {
  //       group_name: "TextInitial",
  //       search_name: "food",
  //       code_master_id: "",
  //       target_field: "TextInitialCode",
  //       field_for_search: "foodSearch"
  //     },
  //     {
  //       group_name: "textPartial",
  //       search_name: "food1",
  //       code_master_id: "",
  //       target_field: "textPartialCode",
  //       field_for_search: "foodSearch"
  //     },
  //     {
  //       group_name: "textExact",
  //       search_name: "food12",
  //       code_master_id: "",
  //       target_field: "textExactCode",
  //       field_for_search: "foodSearch"
  //     },
  //     {
  //       group_name: "MultiTextInitial",
  //       search_name: "food2134",
  //       code_master_id: "",
  //       target_field: "MultiTextInitialCode",
  //       field_for_search: "foodSearch"
  //     },
  //     {
  //       group_name: "MultiTextPartial",
  //       search_name: "food000",
  //       code_master_id: "",
  //       target_field: "MultiTextPartialCode",
  //       field_for_search: "foodSearch"
  //     },
  //     {
  //       group_name: "NumberExact",
  //       search_name: "food0033",
  //       code_master_id: "",
  //       target_field: "NumberExactCode",
  //       field_for_search: "foodSearch"
  //     },
  //     {
  //       group_name: "NumberRange",
  //       search_name: "food0033",
  //       code_master_id: "",
  //       target_field: "NumberRangeCode",
  //       field_for_search: "foodSearch"
  //     },
  //     {
  //       group_name: "DateExact",
  //       search_name: "food0033",
  //       code_master_id: "",
  //       target_field: "DateExactCode",
  //       field_for_search: "foodSearch"
  //     },
  //     {
  //       group_name: "DateRange",
  //       search_name: "food0033",
  //       code_master_id: "",
  //       target_field: "DateRangeCode",
  //       field_for_search: "foodSearch"
  //     },
  //     {
  //       group_name: "DropdownExact",
  //       search_name: "fark111",
  //       code_master_id: "",
  //       target_field: "TextInitialCode",
  //       field_for_search: "foodSearch"
  //     },
  //     {
  //       group_name: "DropdownExact",
  //       search_name: "fark000",
  //       code_master_id: "",
  //       target_field: "DropdownExact",
  //       field_for_search: "foodSearch"
  //     },
  //     {
  //       group_name: "DropdownExactEmpy",
  //       search_name: "fark999",
  //       code_master_id: "",
  //       target_field: "DropdownExact",
  //       field_for_search: "foodSearch"
  //     },
  //     {
  //       group_name: "DropdownExactEmpy",
  //       search_name: "fark888",
  //       code_master_id: "",
  //       target_field: "NumberExactCode",
  //       field_for_search: "foodSearch"
  //     },
  //     {
  //       group_name: "DropdownExactTest",
  //       search_name: "Test1",
  //       code_master_id: "",
  //       target_field: "DropdownExact",
  //       field_for_search: "foodSearch"
  //     },
  //     {
  //       group_name: "DropdownExactTest",
  //       search_name: "Test2",
  //       code_master_id: "",
  //       target_field: "TextInitialCode",
  //       field_for_search: "foodSearch"
  //     },
  //   ],
  //   code_master: [
  //     {
  //       master_id: "12345678",
  //       app_id: "",
  //       api_token: "",
  //       code_field: "",
  //       name_field: "",
  //       type: "",
  //     }
  //   ]
  // };

  kintone.events.on('app.record.index.show', async (event) => {
    // if (!CONFIG) return;
    const CONFIG = JSON.parse(kintone.plugin.app.getConfig(PLUGIN_ID).config);
    console.log("config", CONFIG);
    const records = await window.RsComAPI.getRecords({ app: kintone.app.getId() });
    console.log("records", records);

    const spaceEl = kintone.app.getHeaderMenuSpaceElement();
    if (!spaceEl) throw new Error('The header element is unavailable on this page.');
    // Check if the custom element already exists to avoid duplicates
    if ($(spaceEl).find('.custom-space-el').length > 0) {
      console.log('Custom element already exists, skipping creation.');
      return; // Stop if element already exists
    }
    const $spaceEl = $(spaceEl)
    const $elementsAll = $('<div></div>').addClass('custom-space-el');

    // Create dropdowns based on the configuration
    function createDropDowns(CONFIG) {
      CONFIG.groupSetting.forEach(display => {
        console.log("4545", display);
        if (display.searchType === "dropdown_exact") {
          let relatedContent = CONFIG.searchContent.filter(content => content.groupName === display.groupName);

          // Only show content if `name_marker` is not empty
          if (display.nameMarker) {
            relatedContent = relatedContent.filter(content => content.groupName === display.groupName);
          }

          if (relatedContent.length > 0) {
            const $dropDownTitle = $("<label>")
              .text(display.nameMarker ? display.groupName : relatedContent[0].searchName)
              .addClass('custom-dropdownTitle')
              .css({ cursor: display.nameMarker ? "default" : "pointer" })
              .on("click", function () {
                handleDropDownTitleClick(display, CONFIG, relatedContent, $dropDownTitle);
              });
            const $dropDown = createDropDown(display, records, relatedContent[0], $dropDownTitle);
            const $elementDropdown = $('<div></div>').addClass('search-item').append($dropDownTitle, $dropDown);
            $elementsAll.append($elementDropdown)
          }
        }
      });
    }

    function handleDropDownTitleClick(display, CONFIG, relatedContent, $dropDownTitle) {
      if (display.nameMarker === "") {
        $dropDownTitle.css({ cursor: "pointer" });
        // Check if the dropdown is already visible
        const existingMenu = $('.custom-context-menu');
        if (existingMenu.length > 0) {
          existingMenu.remove(); // Remove existing menu if it exists
          // return; // Exit if you are closing the menu
        }

        // Filter items based on the group name
        const filteredItems = CONFIG.searchContent.filter(content => content.groupName === display.groupName && !display.nameMarker);
        const itemsList = filteredItems.map(content => content.searchName);

        // Create a custom context menu or container for buttons
        const customContextMenu = $('<div></div>')
          .addClass('custom-context-menu')
          .css({
            display: 'flex',
            'flex-direction': 'column',
            'align-items': 'center',
            margin: '5px',
            padding: '10px',
            'background-color': '#f0f0f0',
            position: 'absolute', // Make sure it appears above other elements
            zIndex: 1000 // Ensure it’s above other content
          });
        // Position the pop-up to the left of the dropdown title
        const offset = $dropDownTitle.offset();
        console.log(offset);
        customContextMenu.css({
          top: offset.top + $dropDownTitle.outerHeight() - 250, // Position below the dropdown title
          left: offset.left - customContextMenu.outerWidth() + 115 // Position to the left with a gap of 10px
        });

        // Dynamically create buttons using Kuc.Button for each item in the list
        itemsList.forEach((item, index) => {
          const buttonLabel = item;
          const targetField = filteredItems[index].fieldForSearch; // Assuming you need the target field

          const hoverBtn = new Kuc.Button({
            text: buttonLabel,
            type: 'normal',
            className: 'class-btn',
            id: targetField
          });
          $(hoverBtn).css({
            margin: '5px 0',
            width: '100%'
          });

          // Append the button to the custom context menu
          customContextMenu.append(hoverBtn);

          // Add click event handler to each button
          $(hoverBtn).on('click', async () => {
            const selectedItem = itemsList[index]; // Get the selected item by index

            // Update the title with the selected item
            $dropDownTitle.text(selectedItem);

            // Call your function to update any other parts of the UI or state
            updateDropDownOptions(selectedItem, filteredItems, records, $dropDownTitle);

            // Optionally remove the custom context menu after selection
            customContextMenu.remove();
          });
        });

        // Append the custom context menu to the DOM
        $elementsAll.append(customContextMenu); // Or another container you want to append to
        $(document).on('click', function (event) {
          if (!customContextMenu.is(event.target) && customContextMenu.has(event.target).length === 0 && !$dropDownTitle.is(event.target)) {
            customContextMenu.remove(); // Close the menu
            $(document).off('click'); // Remove the event listener once menu is closed
          }
        });
      }
    }
    // Create dropdown element
    function createDropDown(display, records, initialContent, $dropDownTitle) {
      const $dropDown = $("<select>")
        .addClass("kintoneplugin-dropdown")
        .attr("name", "mySelect")
        .css({ width: display.searchLength });
      $dropDown.append($("<option>").text('-----').val(''));

      if (display.name_marker) {
        let filteredRecords = CONFIG.searchContent.filter(item => item.groupName === display.groupName);
        filteredRecords.forEach(item => {
          if (!records || records[item.searchTarget].value === '') return;
          records.forEach(record => {
            const $option = $("<option>")
              .text(record[item.searchTarget].value)
              .addClass('option')
              .attr('value', record[item.searchTarget].value)
              .attr('fieldCode', item.searchTarget);
            $dropDown.append($option);
          });
        });
        // $dropDown.trigger('change');
      } else {
        $dropDownTitle.text(initialContent.searchName);
        records.forEach(item => {
          if (item[initialContent.searchTarget].value === '') return;
          const $initialOption = $("<option>")
            .text(item[initialContent.searchTarget].value)
            .addClass('option')
            .attr('value', item[initialContent.searchTarget].value)
            .attr('fieldCode', initialContent.searchTarget);
          $dropDown.append($initialOption);
        });
        $dropDown.trigger('change');
      }
      $dropDown.on('change', e => {
        const selectedValue = $dropDown.val();
        const selectedOption = $dropDown.find("option:selected");
        const fieldCode = selectedOption.attr('fieldCode');
        console.log(selectedValue);
        console.log(fieldCode);

        // Call queryDropdown function with the selected value
        queryDropdown(selectedValue, fieldCode);
        // queryDropdownNotEmty(selectedValue, fieldCode);
      });

      return $dropDown;
    }

    // Update dropdown options
    function updateDropDownOptions(selectedItem, filteredItems, records, $dropDownTitle) {
      const $dropDown = $dropDownTitle.next("select"); // Find the corresponding dropdown
      $dropDown.empty();
      $dropDown.append($("<option>").text('-----').val(''));

      const selectedContent = filteredItems.find(content => content.searchName === selectedItem);
      records.forEach(record => {
        if (!records || record[selectedContent.searchTarget].value === '') return;
        const $selectedOption = $("<option>")
          .text(record[selectedContent.searchTarget].value)
          .addClass('option')
          .attr('value', record[selectedContent.searchTarget].value)
          .attr('fieldCode', selectedContent.searchTarget);
        $dropDown.append($selectedOption);
      });
      $dropDown.trigger('change');
    }

    createDropDowns(CONFIG);
    function createBokTermsObject(fieldCode, selectedValue) {
      return { [fieldCode]: selectedValue };
    }

    function queryDropdown(selectedValue, fieldCode) {
      console.log("selectedValue", selectedValue);
      console.log("fieldCode", fieldCode);
      const currentUrlBase = window.location.href.match(/\S+\//)[0];
      console.log("currentUrlBase:", currentUrlBase);

      // Check if both selectedValue and fieldCode are present
      if (!selectedValue || !fieldCode) {
        console.log("Missing selectedValue or fieldCode. Redirection aborted.");
        return;
      }

      // Encode the query string properly
      const query = encodeURIComponent(`${fieldCode} = "${selectedValue}"`);
      console.log("Query string:", query);

      // Create the bokTermsObject using the helper function
      const bokTermsObject = createBokTermsObject(fieldCode, selectedValue);
      console.log("BokTerms object:", bokTermsObject);

      // Convert bokTermsObject to a JSON string
      const bokTermsString = JSON.stringify(bokTermsObject);
      const bokTerms = encodeURIComponent(bokTermsString)

      // Construct the full URL with the query
      const QueryUrl = `${currentUrlBase}?query=${query}&bokTerms={${bokTerms}}`;
      console.log("Full URL:", QueryUrl);

      // Redirect to the new URL
      window.location.href = QueryUrl;
    }


    // Create input fields
    function createTextInput() {
      return $('<input type="text" class="kintoneplugin-input-text">').on('change', function () {
        console.log("Text Input:", $(this).val());
      });
    }

    function createTextArea() {
      const textarea = new Kuc.TextArea({
        requiredIcon: true,
        className: 'options-class',
        id: 'options-id',
        visible: true,
        disabled: false
      });
      textarea.addEventListener('change', event => console.log("TextArea:", event.detail.value));
      return textarea;
    }

    function createNumberInput() {
      return $('<input type="number" class="kintoneplugin-input-text">').on('change', function () {
        console.log("Number Input:", $(this).val());
      });
    }

    function createNumberRangeInput() {
      const $wrapper = $('<div class="wrapperd-number"></div>');
      const $rangeMin = $('<input type="number" class="kintoneplugin-input-text">').on('change', function () {
        console.log("Range Min:", $(this).val());
      });
      const $rangeMax = $('<input type="number" class="kintoneplugin-input-text">').on('change', function () {
        console.log("Range Max:", $(this).val());
      });
      const $separator = $('<span>⁓</span>').addClass('separatornumber');

      return $wrapper.append($rangeMin, $separator, $rangeMax);
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
      datePicker.addEventListener('change', event => console.log("DatePicker", event.detail.value));
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

      const $separator = $('<span>⁓</span>').addClass('separator-datepicker');

      const $wrapper = $('<div></div>').addClass('wrapper-datepiker')
      $wrapper.append(datePickerFirst).append($separator).append(datePickerFinally);

      return $wrapper;
    }

    // Create action buttons
    function createButton(text, callback) {
      return $('<button>').text(text).addClass('kintoneplugin-button-dialog-ok').css('font-size', '13px').on('click', callback);
    }

    const $searchButton = createButton('Search', () => alert('Search button clicked!'));
    const $clearButton = createButton('C', () => alert('Clear button clicked!'));

    const $elementBtn = $('<div class="element-button"></div>').append($searchButton, $clearButton);

    CONFIG.groupSetting.forEach(searchItem => {
      const { searchType, groupName } = searchItem;
      const $elementInput = $('<div></div>').addClass('search-item');

      let inputElement;
      switch (searchType) {
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
        default:
          inputElement = null;
      }
      if (inputElement) {
        $(inputElement).css('width', searchItem.searchLength);
        const $label = $('<label>').text(groupName).addClass('label');
        $elementInput.append($label, inputElement);
        $elementsAll.append($elementInput);
      }
    });

    $elementsAll.append($elementBtn);
    $spaceEl.append($elementsAll);
  });

  kintone.events.on(['app.record.index.show', 'app.record.edit.show'], async (event) => {
    const record = event.record;
    window.RsComAPI.getRecords({ app: 262 })
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
                  selectElement.append($('<option>')
                    .attr('value', record.name.value)
                    .attr('code', record.code.value)
                    .attr('types', record.Type.value)
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
})(jQuery, Sweetalert2_10.noConflict(true), kintone.$PLUGIN_ID);