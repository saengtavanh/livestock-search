jQuery.noConflict();
(async function ($, Swal10, PLUGIN_ID) {
  const CONFIG = JSON.parse(kintone.plugin.app.getConfig(PLUGIN_ID).config);
  console.log("config", CONFIG);
  kintone.events.on('app.record.index.show', async (event) => {

    let elements = document.querySelectorAll('.recordlist-edit-gaia');
    console.log(elements);
    elements.forEach(element => {
      element.style.display = 'none';
    });
    // if (!CONFIG) return;
    console.log(window.location.href);
    // Create a URL object
    const urlObj = new URL(window.location.href);

    // Get the bokTerms parameter
    const bokTerms = urlObj.searchParams.get('bokTerms');

    // Decode the bokTerms string
    const decodedBokTerms = decodeURIComponent(bokTerms).replace(/{{|}}/g, '');
    console.log(decodedBokTerms);

    const result = {};
    decodedBokTerms.split(',').forEach(pair => {
      const [key, value] = pair.split(':').map(item => item.trim().replace(/"/g, ''));
      result[key] = value;
    });

    // Log the result
    console.log(result);

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
        console.log("filteredItems", filteredItems);
        // const itemsList = filteredItems.map(content => content.searchName && content.searchTarget);
        // console.log("itemsList", itemsList);

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
            color: '#000',
            position: 'absolute', // Make sure it appears above other elements
            zIndex: 1000 // Ensure it’s above other content
          });
        // Position the pop-up to the left of the dropdown title
        const offset = $dropDownTitle.offset();
        console.log(offset);
        customContextMenu.css({
          top: offset.top + $dropDownTitle.outerHeight() - 250, // Position below the dropdown title
          left: offset.left - customContextMenu.outerWidth() + 90 // Position to the left with a gap of 10px
        });

        // Dynamically create buttons using Kuc.Button for each item in the list
        filteredItems.forEach((item, index) => {
          const buttonLabel = item.searchName;
          const targetField = filteredItems[index].searchTarget; // Assuming you need the target field
          console.log("targetField", targetField);

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
            const selectedItem = filteredItems[index]; // Get the selected item by index
            console.log("selectedItem 555", selectedItem);
            // Update the title with the selected item
            $dropDownTitle.text(selectedItem.searchName);
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
      const NameDropdown = display.groupName;
      NameDropdown.replace(/\s+/g, "_");
      const $dropDown = $("<select>")
        .addClass("kintoneplugin-dropdown")
        .attr("id", `${NameDropdown}`)
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
        console.log(initialContent);
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
      console.log("selectedItem", selectedItem);
      const $dropDown = $dropDownTitle.next("select"); // Find the corresponding dropdown
      $dropDown.empty();
      $dropDown.append($("<option>").text('-----').val(''));

      const selectedContent = filteredItems.find(content => content.searchTarget === selectedItem.searchTarget);
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
//TODO: FunctionSearch-------------------------------------------------
    var searchProcess = async function (searchInfoList) {
      var query = await getValueConditionAndBuildQuery(searchInfoList, query);
      var queryEscape = encodeURIComponent(query);
      console.log("queryEscape", queryEscape);
      var currentUrlBase = window.location.href.match(/\S+\//)[0];
      var url = currentUrlBase + "?query=" + queryEscape;

      window.location.href = url;
    };
    var getValueConditionAndBuildQuery = function (searchInfoList) {
      console.log("searchInfoList::::", searchInfoList);

      var query = "";
      searchInfoList.forEach((searchInfo) => {
        switch (searchInfo.searchType) {
          case 'text_initial':
            query += buildTextInitialQuery(searchInfo, query);
            break;
          case 'text_patial':
            query += buildTextPartialQuery(searchInfo, query);
            break;
          case "text_exact":
            query += buildTextExactQuery(searchInfo, query);
            break;
          case 'multi_text_initial':
            query += buildMultieinitialQuery(searchInfo, query);
            break;
          case 'multi_text_patial':
            query += buildMultiePatialQuery(searchInfo, query);
            break;
          case 'number_exact':
            query += buildNumberExactQuery(searchInfo, query);
            break;
          case 'number_range':
            query += buildNumberRangeQuery(searchInfo, query);
            break;
          case 'date_exact':
            query += buildDateExactQuery(searchInfo, query);
            break;
          case 'date_range':
            query += buildDateRangeQuery(searchInfo, query);
            break;
          default:
            break;
        }
      });

      console.log("query", query);
      return query;
    };
//TODO:InitailQuery------------------------------------------------
    var buildTextInitialQuery = function (searchInfo, query) {
      console.log("GGG");
      console.log("searchInfo", searchInfo);
      let replacedText = searchInfo.groupName.replace(/\s+/g, "_");
      let queryChild;

      function transformString(input) {
        // Split the input string into an array of characters
        let characters = input.split('');
    
        // Join the characters with commas and add the leading underscore
        let transformed = '_, ' + characters.join(',');
    
        return transformed;
      }

      if ($(`#${replacedText}`).length) {
        console.log("have");
        if ( $(`#${replacedText}`).val()) {
          var searchValue = transformString($(`#${replacedText}`).val());
          console.log("bla", searchValue);
        }
      }

      if (searchValue) {
        if (searchInfo.target_field.length > 1) {
          console.log("searchInfo.target_field++++++", searchInfo.target_field);
          searchInfo.target_field.forEach((field, index) => {

            const isLastIndex = index === searchInfo.target_field.length - 1;
          
            if (queryChild) {
              if (isLastIndex) {
                queryChild += `or (${field} like "${searchValue}"))`;
              } else {
                queryChild += `or (${field} like "${searchValue}") `;
              }
            } else {
              queryChild = `${query ? " and " : ""}((${field} like "${searchValue}") `;
            }
          });
        } else if ((searchInfo.target_field.length = 1)) {
          queryChild = `${query ? " and " : ""}(${searchInfo.target_field} like "${searchValue}")`;
        }
        // sessionStorage.setItem(searchInfo.fieldInfo.code, inputVal); // Store in session storage
        return queryChild;
      }
      return '';
    };

    var buildTextPartialQuery = function (searchInfo, query) {
      console.log("fff");
      console.log("searchInfo", searchInfo);
      let replacedText = searchInfo.groupName.replace(/\s+/g, "_");
      let queryChild;

      function transformString(input) {
        // Split the input string into an array of characters
        let characters = input.split('');
    
        // Join the characters with commas and add the leading underscore
        let transformed = characters.join(',');
    
        return transformed;
      }

      if ($(`#${replacedText}`).length) {
        console.log("have");
        if ( $(`#${replacedText}`).val()) {
          var searchValue = transformString($(`#${replacedText}`).val());
          console.log("bla", searchValue);
        }
      }

      if (searchValue) {
        if (searchInfo.target_field.length > 1) {
          console.log("searchInfo.target_field++++++", searchInfo.target_field);
          searchInfo.target_field.forEach((field) => {
            if (queryChild) {
              queryChild += `or (${field} like "${searchValue}")`
            } else {
              queryChild = `${query ? " and " : ""}(${field} like "${searchValue}") `;
            }
          })
        } else if ((searchInfo.target_field.length = 1)) {
          queryChild = `${query ? " and " : ""}(${searchInfo.target_field} like "${searchValue}")`;
        }
        // sessionStorage.setItem(searchInfo.fieldInfo.code, inputVal); // Store in session storage
        return queryChild;
      }
      return '';
    };

    var buildTextExactQuery = function (searchInfo, query) {
      console.log("fff");
      console.log("searchInfo", searchInfo);
      let replacedText = searchInfo.groupName.replace(/\s+/g, "_");

      function transformString(input) {
        // Split the input string into an array of characters
        let characters = input.split('');
    
        // Join the characters with commas and add the leading underscore
        let transformed = '_, ' + characters.join(',') + ',_';
    
        return transformed;
      }

      if ($(`#${replacedText}`).length) {
        console.log("have");
        var searchValue = $(`#${replacedText}`).val();
        if ( $(`#${replacedText}`).val()) {
          var searchValue = transformString($(`#${replacedText}`).val());
          console.log("bla", searchValue);
        }
      }

      if (searchValue) {
        if (searchInfo.target_field.length > 1) {
          console.log("searchInfo.target_field++++++", searchInfo.target_field);
          searchInfo.target_field.forEach((field) => {
            if (queryChild) {
              queryChild += `or (${field} like "${searchValue}")`
            } else {
              queryChild = `${query ? " and " : ""}(${field} like "${searchValue}") `;
            }
          })
        } else if ((searchInfo.target_field.length = 1)) {
          queryChild = `${query ? " and " : ""}(${searchInfo.target_field} like "${searchValue}")`;
        }
        // sessionStorage.setItem(searchInfo.fieldInfo.code, inputVal); // Store in session storage
        return queryChild;
      }
      return '';
    };
    var buildMultieinitialQuery = function (searchInfo, query) {
      console.log("fff");
      console.log("searchInfo", searchInfo);
      let replacedText = searchInfo.groupName;

      if ($(`#${replacedText}`).length) {
        console.log("have");

        var bla = $(`#${replacedText}`).val();
        console.log("bla", bla);
      }

      if (bla) {
        let queryChild = `${query ? " and " : ""}(${searchInfo.target_field} like "${bla}")`;
        // sessionStorage.setItem(searchInfo.fieldInfo.code, inputVal); // Store in session storage
        return queryChild;
      }
      return '';
    };
    var buildMultiePatialQuery = function (searchInfo, query) {
      console.log("fff");
      console.log("searchInfo", searchInfo);
      let replacedText = searchInfo.groupName;

      if ($(`#${replacedText}`).length) {
        console.log("have");

        var bla = $(`#${replacedText}`).val();
        console.log("bla", bla);
      }

      if (bla) {
        let queryChild = `${query ? " and " : ""}(${searchInfo.target_field} like "${bla}")`;
        // sessionStorage.setItem(searchInfo.fieldInfo.code, inputVal); // Store in session storage
        return queryChild;
      }
      return '';
    };
    var buildNumberExactQuery = function (searchInfo, query) {
      console.log("fff");
      console.log("searchInfo", searchInfo);
      let replacedText = searchInfo.groupName;

      if ($(`#${replacedText}`).length) {
        console.log("have");

        var bla = $(`#${replacedText}`).val();
        console.log("bla", bla);
      }

      if (bla) {
        let queryChild = `${query ? " and " : ""}(${searchInfo.target_field} like "${bla}")`;
        // sessionStorage.setItem(searchInfo.fieldInfo.code, inputVal); // Store in session storage
        return queryChild;
      }
      return '';
    };
    var buildNumberRangeQuery = function (searchInfo, query) {
      console.log("fff");
      console.log("searchInfo", searchInfo);
      let replacedText = searchInfo.groupName;
      if ($(`#${replacedText}_start`).length) {
        console.log("have");

        var start = $(`#${replacedText}_start`).val();
        console.log("bla", start);
      }
      if ($(`#${replacedText}_end`).length) {
        console.log("have");

        var end = $(`#${replacedText}_end`).val();
        console.log("bla", end);
      }
      if (start && end) {
        let queryChild = `${query ? " and " : ""}(${searchInfo.target_field} like "${start}" and "${end}")`;
        return queryChild;
      }
      return '';
    };
    var buildDateExactQuery = function (searchInfo, query) {
      console.log("fff");
      console.log("searchInfo", searchInfo);
      let replacedText = searchInfo.groupName;
      console.log($(`#${replacedText}`));
      if ($(`#${replacedText}`).length) {
        console.log("have");

        var date = $(`#${replacedText}`).val();
        console.log("bla", date);
      }

      if (date) {
        let queryChild = `${query ? " and " : ""}(${searchInfo.target_field} like "${date}")`;
        // sessionStorage.setItem(searchInfo.fieldInfo.code, inputVal); // Store in session storage
        return queryChild;
      }
      return '';
    };
    var buildDateRangeQuery = function (searchInfo, query) {
      console.log("fff");
      console.log("searchInfo", searchInfo);
      let replacedText = searchInfo.groupName;
      console.log($(`#${replacedText}_start`));
      if ($(`#${replacedText}_start`).length) {
        console.log("have");

        var start = $(`#${replacedText}_start`).val();
        console.log("bla", start);
      }
      if ($(`#${replacedText}_end`).length) {
        console.log("have");

        var end = $(`#${replacedText}_end`).val();
        console.log("bla", end);
      }

      if (start && end) {
        let queryChild = `${query ? " and " : ""}(${searchInfo.target_field} like "${start}" and "${end}")`;
        // sessionStorage.setItem(searchInfo.fieldInfo.code, inputVal); // Store in session storage
        return queryChild;
      }
      return '';
    };

//TODO: CreateElement
    // ========================
    function createTextInput(searchType, groupName) {
      console.log("type +++11", searchType);
      console.log("groupName +++111", groupName);
      let initialText = groupName.replace(/\s+/g, "_");
      const inputElement = $('<input>', {
        type: searchType,
        class: 'kintoneplugin-input-text',
        'data-serach-type': searchType,
        'id': initialText
      });

      // Return the input element for further use
      console.log(inputElement.val());
      return inputElement;
    }
    function createTextArea(searchType, groupName) {
      console.log("type +++22", searchType);
      console.log("groupName +++22", groupName);
      let inputTeatArae = groupName.replace(/\s+/g, "_");
      const textarea = new Kuc.TextArea({
        requiredIcon: true,
        className: 'options-class',
        id: inputTeatArae,
        visible: true,
        disabled: false
      });
      textarea.setAttribute('data-search-type', searchType);
      // textarea.setAttribute('id', inputTeatArae);
      textarea.addEventListener('change', event => console.log("TextArea:", event.detail.value));
      return textarea;
    }

    function createTextNumberInput(searchType, groupName) {
      let initialNumber = groupName.replace(/\s+/g, "_");
      const InputNumber = $('<input>', {
        type: 'number',
        class: 'kintoneplugin-input-text',
        'data-search-type': searchType,
        'id': initialNumber
      })
      return InputNumber;
    }

    function createNumberRangeInput(searchType, groupName) {
      let NumberRange = groupName.replace(/\s+/g, "_");
      const $wrapper = $('<div class="wrapperd-number"></div>');
      const $start = $('<input>', {
        type: 'number',
        class: 'kintoneplugin-input-text',
        'data-search-type': searchType,
        id: `${NumberRange}_start`,
      });
      const $end = $('<input>', {
        type: 'number',
        class: 'kintoneplugin-input-text',
        'data-search-type': searchType,
        id: `${NumberRange}_end`,
      });
      const $separator = $('<span>⁓</span>').addClass('separatornumber');

      return $wrapper.append($start, $separator, $end);
    }

    function createDateInput(searchType, groupName) {
      let dateInput = groupName.replace(/\s+/g, "_");
      const datePicker = new Kuc.DatePicker({
        requiredIcon: true,
        language: 'auto',
        className: 'options-class',
        id: dateInput,
        visible: true,
        disabled: false
      });
      datePicker.setAttribute('data-search-type', searchType);
      datePicker.addEventListener('change', event => console.log("DatePicker", event.detail.value));
      return datePicker;
    }

    function createDateRangeInput(searchType, groupName) {
      let dateRange = groupName.replace(/\s+/g, "_");
      const datePickerSatrt = new Kuc.DatePicker({
        requiredIcon: true,
        language: 'auto',
        className: 'options-class',
        id: `${dateRange}_start`,
        visible: true,
        disabled: false
      });
      datePickerSatrt.setAttribute('data-search-type', searchType);
      datePickerSatrt.addEventListener('change', event => {
        console.log("Start Date", event.detail.value);
      });

      const datePickerEnd = new Kuc.DatePicker({
        requiredIcon: true,
        language: 'auto',
        className: 'options-class',
        id: `${dateRange}_end`,
        visible: true,
        disabled: false
      });
      datePickerEnd.setAttribute('data-search-type', searchType);
      datePickerEnd.addEventListener('change', event => {
        console.log("End Date", event.detail.value);
      });

      const $separator = $('<span>⁓</span>').addClass('separator-datepicker');

      const $wrapper = $('<div></div>').addClass('wrapper-datepiker')
      $wrapper.append(datePickerSatrt).append($separator).append(datePickerEnd);

      return $wrapper;
    }

    // Create action buttons
    function createButton(text, callback) {
      return $('<button>').text(text).addClass('kintoneplugin-button-dialog-ok').css('font-size', '13px').on('click', callback);
    }

    const $searchButton = createButton('Search', () => {
      var searchInfoList = CONFIG.groupSetting;
      searchProcess(searchInfoList);
    });
    const $clearButton = createButton('C', () => alert('Clear button clicked!'));

    const $elementBtn = $('<div class="element-button"></div>').append($searchButton, $clearButton);


    //TODO: Create Function-------------------------------------------------------------------------
    
    let setSearchForfile = [];
    CONFIG.groupSetting.forEach(searchItem => {
      const { searchType, groupName, nameMarker } = searchItem;
      let setSearchTarget = [];
      let Titlename;
      let afterFilter = CONFIG.searchContent.filter((searchItem) => searchItem.groupName == groupName);
        console.log("🚀 ~ kintone.events.on ~ afterFilter:", afterFilter);
        afterFilter.forEach(searchItemTarget => {
          console.log("searchItemTarget", searchItemTarget);
          Titlename = nameMarker ? searchItemTarget.groupName : searchItemTarget.searchName;
          setSearchTarget.push(searchItemTarget.fieldForSearch);
        });

        console.log("setSearchTarget::", setSearchTarget);
        

        if (afterFilter.length >= 1) {
          searchItem["target_field"] = setSearchTarget;
          const $elementInput = $('<div></div>').addClass('search-item');
          let inputElement;
          switch (searchType) {
            case 'text_initial':
              inputElement = createTextInput(searchType, groupName);
              break;
            case 'text_patial':
              inputElement = createTextInput(searchType, groupName);
              break;
            case 'text_exact':
              inputElement = createTextInput(searchType, groupName);
              break;
            case 'multi_text_initial':
              inputElement = createTextArea(searchType, groupName);
              break;
            case 'multi_text_patial':
              
              inputElement = createTextArea(searchType, groupName);
              break;
            case 'number_exact':
              inputElement = createTextNumberInput(searchType, groupName);
              break;
            case 'number_range':
              inputElement = createNumberRangeInput(searchType, groupName);
              break;
            case 'date_exact':
              inputElement = createDateInput(searchType, groupName);
              break;
            case 'date_range':
              inputElement = createDateRangeInput(searchType, groupName);
              break;
            default:
              inputElement = null;
          }
          if (inputElement) {
            $(inputElement).css('width', searchItem.searchLength);
            const $label = $('<label>').text(Titlename).addClass('label');
            $elementInput.append($label, inputElement);
            $elementsAll.append($elementInput);
          }
        }
      
    });

    $elementsAll.append($elementBtn);
    $spaceEl.append($elementsAll);

  });
        // console.log("🚀 ~ kintone.events.on ~ searchItem:", searchItem)
        // console.log("🚀 ~ buildTextInitialQuery ~ value:", value)

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
   kintone.events.on([
    'app.record.edit.show',
    'app.record.create.show',
    'app.record.create.submit',
    'app.record.edit.submit.success',
    'app.record.detail.show'], async (event) => {
      let record = event.record;
      let updateRecord = {};
      console.log("hello", CONFIG);
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
              kintone.app.record.setFieldShown(searchItem.fieldForSearch, false)
              let targetValue = record[searchItem.searchTarget].value;
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