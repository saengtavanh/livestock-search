jQuery.noConflict();
(async function ($, Swal10, PLUGIN_ID) {
  const CONFIG = JSON.parse(kintone.plugin.app.getConfig(PLUGIN_ID).config);
  console.log("config", CONFIG);
  kintone.events.on('app.record.index.show', async (event) => {
    // if (!CONFIG) return;

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

      if (display.nameMarker) {
        let filteredRecords = CONFIG.searchContent.filter(item => item.groupName === display.groupName);
        filteredRecords.forEach(item => {
          records.forEach(record => {
            if (record[item.searchTarget].value === '') return;
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
    // =========================
    //string input search
   

    //Rang number search
    // var buildQueryForNumberValue = function (searchInfo, query, format, condiotionValue) {
    //   let startValue = document.getElementById(searchInfo.fieldInfo.code + "_start").value;
    //   let endValue = document.getElementById(searchInfo.fieldInfo.code + "_end").value;
    //   let queryChild = "";

    //   if (startValue && endValue == '') {
    //     queryChild = `${query ? " " + condiotionValue + " " : ""}` + "(" + searchInfo.fieldInfo.code + ' ' + ">=" + ' "' + startValue + '"' + ")";
    //     sessionStorage.setItem(`${searchInfo.fieldInfo.code}_start`, startValue);
    //   } else if (endValue && startValue == '') {
    //     queryChild = `${query ? " " + condiotionValue + " " : ""}` + "(" + searchInfo.fieldInfo.code + ' ' + "<=" + ' "' + endValue + '"' + ")";
    //     sessionStorage.setItem(`${searchInfo.fieldInfo.code}_end`, endValue);
    //   } else if (startValue && endValue) {
    //     queryChild = `${query ? " " + condiotionValue + " " : ""}` + "(" + searchInfo.fieldInfo.code + ' ' + ">=" + ' "' + startValue + '"' + " and " + searchInfo.fieldInfo.code + ' ' + "<=" + ' "' + endValue + '"' + ")";
    //     sessionStorage.setItem(`${searchInfo.fieldInfo.code}_start`, startValue);
    //     sessionStorage.setItem(`${searchInfo.fieldInfo.code}_end`, endValue);
    //   }
    //   return queryChild;
    // };

    // // =========================

    // var searchProcess = async function (searchInfoList) {
    //   var query = await getValueConditionAndBuildQuery(searchInfoList);
    //   var queryEscape = encodeURIComponent(query);
    //   var currentUrlBase = window.location.href.match(/\S+\//)[0];
    //   var url = currentUrlBase + "?query=" + queryEscape;

    //   return (window.location.href = url);
    // };

    // //check type to search
    // var getValueConditionAndBuildQuery = function () {
    //   var query = "";
    //   CONFIG.groupSetting.forEach(searchItem => {
    //     console.log("searchItem.searchType", searchItem.searchType);
    //     switch (searchItem.searchType) {
    //       case "text_initial":
    //       case "text_partial":
    //         // case "multi_text_initial":
    //         // case "multi_text_patial":
    //         // case "number_exact":
    //         // case "number_range":
    //         // case "date_exact":
    //         // case "date_range":
    //         let inputCondition = QueryTextInitialValue(searchInfo, query, condiotionValue);
    //         query += inputCondition;

    //         break;
    //       case "number_exact":
    //         let rangNumberCondition = buildQueryForNumberValue(searchInfo, query, "", condiotionValue);
    //         query += rangNumberCondition;

    //         break;
    //       // case "DATE":
    //       //   let dateCondition = buildQueryForRangDateValue(searchInfo, query, "YYYY-MM-DD", condiotionValue);
    //       //   query += dateCondition;

    //       //   break;
    //       // case "DATETIME":
    //       // case "CREATED_TIME":
    //       // case "UPDATED_TIME":
    //       //   let datetimeCondition = buildQueryForRangDateValue(searchInfo, query, "YYYY-MM-DDTHH:mm:ss", condiotionValue);
    //       //   query += datetimeCondition;

    //       //   break;
    //       // case "TIME":
    //       //   let timeCondition = buildQueryForRangTimeValue(searchInfo, query, "", condiotionValue);
    //       //   query += timeCondition;

    //       //   break;
    //       // case "MULTI_SELECT":
    //       // case "RADIO_BUTTON":
    //       // case "CHECK_BOX":
    //       // case "DROP_DOWN":
    //       // case "STATUS":
    //       //   let multiSelectItemList = document.getElementsByName(searchInfo.fieldInfo.code);
    //       //   let multiSelectConditionChild = "";

    //       //   for (let j = 0; j < multiSelectItemList.length; j++) {
    //       //     let selectedItem = multiSelectItemList[j];
    //       //     $(selectedItem).hasClass("dropdown-selected")
    //       //       ? (multiSelectConditionChild +=
    //       //         ' "' + $(selectedItem).data("option-value") + '", ')
    //       //       : null;
    //       //   }

    //       //   let multiSelectCondition = buildQueryForMultiValue(searchInfo, multiSelectConditionChild, query, condiotionValue);
    //       //   query += multiSelectCondition;

    //       //   break;
    //     }
    //   })

    //   return query;
    // };
    // ========================
   
    // ========================

    // Create input fields
    function createTextInput() {
      return $('<input type="text" class="kintoneplugin-input-text">').on('change', function () {
        console.log("Text Input:", $(this).val());
        QueryTextInitialValue($(this).val());
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
        // buildQueryForNumberValue($(this).val());
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
        case 'multi_text_initial':
        case 'multi_text_patial':
          inputElement = createTextArea();
          break;
        case 'number_exact':
          inputElement = createNumberInput();
          break;
        case 'number_range':
          inputElement = createNumberRangeInput();
          break;
        case 'date_exact':
          inputElement = createDateInput();
          break;
        case 'date_range':
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
  kintone.events.on(['app.record.edit.show', 'app.record.create.submit'], async (event) => {
    let record = event.record;
    let updateRecord = {};
    CONFIG.searchContent.forEach((searchItem) => {
      CONFIG.groupSetting.forEach((item) => {
        if (item.groupName === searchItem.groupName) {
          if (
            item.searchType === "text_initial" ||
            item.searchType === "text_patial" ||
            item.searchType === "text_exact" ||
            item.searchType === "multi_text_initial" ||
            item.searchType === "multi_text_patial"

          ) {
            let targetValue = record[searchItem.searchTarget].value;
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
      });
    });
    if (event.type === 'app.record.create.submit') {
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