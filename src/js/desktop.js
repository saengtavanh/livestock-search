jQuery.noConflict();
(async function ($, Swal10, PLUGIN_ID) {
  const CONFIG = JSON.parse(kintone.plugin.app.getConfig(PLUGIN_ID).config);
  console.log("config", CONFIG);
  kintone.events.on('app.record.index.show', async (event) => {
    let setColor = CONFIG.colorSetting;

    const records = await window.RsComAPI.getRecords({ app: kintone.app.getId() });
    console.log("records", records);
    let elements = document.querySelectorAll('.recordlist-edit-gaia');
    elements.forEach(element => {
      element.style.display = 'none';
    });

    const urlObj = new URL(window.location.href);
    const bokTerms = urlObj.searchParams.get('bokTerms');
    const decodedBokTerms = decodeURIComponent(bokTerms).replace(/{{|}}/g, '');
    const cleanBokTerms = decodedBokTerms.replace(/[^{}\[\]":,0-9a-zA-Z._-]/g, '');
    const wrappedBokTerms = `{${cleanBokTerms}}`;

    if (bokTerms != null) {
      let bokTermsObj = JSON.parse(wrappedBokTerms);
      console.log('hellooo', bokTermsObj);
      CONFIG.groupSetting.forEach(searchItem => {
        if (searchItem.groupName === bokTermsObj.groupName.id) {
          let getIdElement = searchItem.groupName.replace(/\s+/g, "_");
          console.log('Formatted ID Element:', getIdElement);
          const getId = $(`#dropdown1`);
          const getId2 = $(`.kintoneplugin-dropdown`);
          console.log('Dropdown Element:', getId);
          console.log('Dropdown Element:', getId2);
          if (getId.hasClass("kintoneplugin-dropdown")) {
            const optionExists = getId.find(`option[value="${bokTermsObj.groupName.value}"]`).length > 0;
            if (optionExists) {
              getId.val(bokTermsObj.groupName.value);
            } else {
              getId.append($("<option>").text(bokTermsObj.groupName.value).val(bokTermsObj.groupName.value));
              getId.val(bokTermsObj.groupName.value);
            }
          }
        }
      });
    }

    const spaceEl = kintone.app.getHeaderMenuSpaceElement();
    if (!spaceEl) throw new Error('The header element is unavailable on this page.');
    if ($(spaceEl).find('.custom-space-el').length > 0) {
      console.log('Custom element already exists, skipping creation.');
      return;
    }
    const spaceElement = $(spaceEl)
    const elementsAll = $('<div></div>').addClass('custom-space-el');

    let searchProcess = async function (searchInfoList) {
      let query = "";
      query = await getValueConditionAndBuildQuery(searchInfoList, query);
      let queryEscape = encodeURIComponent(query);
      console.log("queryEscape", queryEscape);
      let currentUrlBase = window.location.href.match(/\S+\//)[0];
      let url = currentUrlBase + "?query=" + queryEscape;
      // window.location.href = url;
    };
    let getValueConditionAndBuildQuery = function (searchInfoList) {
      console.log("searchInfoList::::", searchInfoList);

      let query = "";
      searchInfoList.forEach((searchInfo) => {
        switch (searchInfo.searchType) {
          case 'text_initial':
            query += buildTextInitialQuery(searchInfo, query);
            break;
          case 'text_patial':
            query += buildTextPartialQuery(searchInfo, query);
            break;
          case 'text_exact':
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

    let buildTextInitialQuery = function (searchInfo, query) {
      console.log("GGG");
      console.log("searchInfo", searchInfo);
      let replacedText = searchInfo.groupName.replace(/\s+/g, "_");
      let queryChild;
      let searchValue;

      function transformString(input) {
        // Split the input string into an array of characters
        let characters = input.split('');

        // Join the characters with commas and add the leading underscore
        let transformed = '_, ' + characters.join(',');

        return transformed;
      }

      if ($(`#${replacedText}`).length) {
        console.log("have");
        if ($(`#${replacedText}`).val()) {
          searchValue = transformString($(`#${replacedText}`).val());
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

    let buildTextPartialQuery = function (searchInfo, query) {
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
        if ($(`#${replacedText}`).val()) {
          var searchValue = transformString($(`#${replacedText}`).val());
          console.log("bla", searchValue);
        }
      }

      if (searchValue) {
        if (searchInfo.target_field.length > 1) {
          console.log("searchInfo.target_field++++++", searchInfo.target_field);
          searchInfo.target_field.forEach((field) => {
            console.log("object", field);
            if (queryChild) {
              queryChild += `or (${field} like "${searchValue}")`
            } else {
              queryChild = `${query ? " and " : ""}(${field} like "${searchValue}") `;
            }
          })
        } else if ((searchInfo.target_field.length = 1)) {
          queryChild = `${query ? " and " : ""}(${searchInfo.target_field} like "${searchValue}")`;
        }
        return queryChild;
      }
      return '';
    };
    let buildTextExactQuery = function (searchInfo, query) {
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
        if ($(`#${replacedText}`).val()) {
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
    let buildMultieinitialQuery = function (searchInfo, query) {
      console.log("fff");
      console.log("searchInfo", searchInfo);
      let replacedText = searchInfo.groupName;

      const bla = $(`#${replacedText}`).length && $(`#${replacedText}`).val();
      // if ($(`#${replacedText}`).length) {
      //   console.log("have");

      //   let bla = $(`#${replacedText}`).val();
      //   console.log("bla", bla);
      // }

      if (bla) {
        let queryChild = `${query ? " and " : ""}(${searchInfo.target_field} like "${bla}")`;
        // sessionStorage.setItem(searchInfo.fieldInfo.code, inputVal); // Store in session storage
        return queryChild;
      }
      return '';
    };
    let buildMultiePatialQuery = function (searchInfo, query) {
      console.log("fff");
      console.log("searchInfo", searchInfo);
      let replacedText = searchInfo.groupName;
      const bla = $(`#${replacedText}`).length && $(`#${replacedText}`).val();
      // if ($(`#${replacedText}`).length) {
      //   console.log("have");

      //   let bla = $(`#${replacedText}`).val();
      //   console.log("bla", bla);
      // }

      if (bla) {
        let queryChild = `${query ? " and " : ""}(${searchInfo.target_field} like "${bla}")`;
        // sessionStorage.setItem(searchInfo.fieldInfo.code, inputVal); // Store in session storage
        return queryChild;
      }
      return '';
    };
    let buildNumberExactQuery = function (searchInfo, query) {
      let queryChild = "";
      let replacedText = searchInfo.groupName;
      const startValue = $(`#${replacedText}`).length && $(`#${replacedText}`).val();
      // if ($(`#${replacedText}`).length) {
      //   console.log("have");

      //   let bla = $(`#${replacedText}`).val();
      //   console.log("bla", bla);
      // }

      if (startValue == '') {
        queryChild = `${query ? " and " : ""}` + "(" + searchInfo.target_field + ' ' + ">=" + ' "' + startValue + '"' + ")";
      } else if (startValue) {
        queryChild = `${query ? " and " : ""}` + "(" + searchInfo.target_field + ' ' + ">=" + ' "' + startValue + '"' + ")";
      }
      return queryChild;
    }
    let buildNumberRangeQuery = function (searchInfo, query) {
      let queryChild = "";
      let replacedText = searchInfo.groupName;
      const startValue = $(`#${replacedText}_start`).length && $(`#${replacedText}_start`).val();
      const endValue = $(`#${replacedText}_end`).length && $(`#${replacedText}_end`).val();
      if (startValue && endValue == '') {
        queryChild = `${query ? " and " : ""}` + "(" + searchInfo.target_field + ' ' + ">=" + ' "' + startValue + '"' + ")";
      } else if (endValue && startValue == '') {
        queryChild = `${query ? " and " : ""}` + "(" + searchInfo.target_field + ' ' + "<=" + ' "' + endValue + '"' + ")";
      } else if (startValue && endValue) {
        queryChild = `${query ? " and " : ""}` + "(" + searchInfo.target_field + ' ' + ">=" + ' "' + startValue + '"' + " and " + searchInfo.target_field + ' ' + "<=" + ' "' + endValue + '"' + ")";
        // sessionStorage.setItem(`${searchInfo.fieldInfo.code}_start`, startValue);
        // sessionStorage.setItem(`${searchInfo.fieldInfo.code}_end`, endValue);
      }
      return queryChild;
    };
    let buildDateExactQuery = function (searchInfo, query) {
      console.log("searchInfo", searchInfo);
      let queryChild = "";
      let replacedText = searchInfo.groupName;
      const dateStartValue = $(`#${replacedText}`).length && $(`#${replacedText}`).val();
      console.log("object", dateStartValue);
      if (dateStartValue == '') {
        queryChild = `${query ? " and " : ""}` + "(" + searchInfo.target_field + ' ' + ">=" + ' "' + dateStartValue + '"' + ")";
      } else if (dateStartValue) {
        queryChild = `${query ? " and " : ""}` + "(" + searchInfo.target_field + ' ' + ">=" + ' "' + dateStartValue + '"' + ")";
      }
      return queryChild;
    };
    let buildDateRangeQuery = function (searchInfo, query) {
      console.log("object", searchInfo.target_field);
      let queryChild = "";
      let replacedText = searchInfo.groupName;
      const startValue = $(`#${replacedText}_start`).length && $(`#${replacedText}_start`).val();
      const endValue = $(`#${replacedText}_end`).length && $(`#${replacedText}_end`).val();
      if (startValue && endValue == '') {
        queryChild = `${query ? " and " : ""}` + "(" + searchInfo.target_field + ' ' + ">=" + ' "' + startValue + '"' + ")";
        // sessionStorage.setItem(`${searchInfo.fieldInfo.code}_start`, startValue);
      } else if (endValue && startValue == '') {
        queryChild = `${query ? " and " : ""}` + "(" + searchInfo.target_field + ' ' + "<=" + ' "' + endValue + '"' + ")";
        // sessionStorage.setItem(`${searchInfo.fieldInfo.code}_end`, endValue);
      } else if (startValue && endValue) {
        queryChild = `${query ? " and " : ""}` + "(" + searchInfo.target_field + ' ' + ">=" + ' "' + startValue + '"' + " and " + searchInfo.target_field + ' ' + "<=" + ' "' + endValue + '"' + ")";
        // sessionStorage.setItem(`${searchInfo.fieldInfo.code}_start`, startValue);
        // sessionStorage.setItem(`${searchInfo.fieldInfo.code}_end`, endValue);
      }
      return queryChild;
    };
    // Create dropdowns based on the configuration
    function createDropDowns(CONFIG, display, color) {
      console.log(">🎉🎉🎉setColor===", color);
      let relatedContent = CONFIG.searchContent.filter(content => content.groupName === display.groupName);
      // Only show content if `name_marker` is not empty
      if (display.nameMarker && relatedContent.length === 0) return;

      if (relatedContent.length > 0) {
        const dropDownTitle = $("<label>")
          .text(display.nameMarker ? display.groupName : relatedContent[0].searchName)
          .addClass('custom-dropdownTitle')
          .css({
            cursor: display.nameMarker ? "default" : "pointer",
            color: setColor?.titleColor
          }).on("click", function () {
            handleDropDownTitleClick(display, CONFIG, relatedContent, dropDownTitle, dropDown);
          });
        const dropDown = createDropDown(display, records, relatedContent[0], dropDownTitle);
        const DropdownAll = $('<div></div>').addClass('search-item').append(dropDownTitle, dropDown);
        elementsAll.append(DropdownAll);
      }
    }


    function handleDropDownTitleClick(display, CONFIG, relatedContent, dropDownTitle, dropDown) {
      if (display.nameMarker === "") {
        dropDownTitle.css({ cursor: "pointer" });
        const existingMenu = $('.custom-context-menu');
        if (existingMenu.length > 0) {
          existingMenu.remove();
        }

        // Filter items based on the group name
        const filteredItems = CONFIG.searchContent.filter(content => content.groupName === display.groupName && !display.nameMarker);
        console.log("filteredItems", filteredItems);
        const customContextMenu = $('<div></div>').addClass('custom-context-menu')
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
        const offset = dropDownTitle.offset();
        console.log(offset);
        customContextMenu.css({
          top: offset.top + dropDownTitle.outerHeight() - 250, // Position below the dropdown title
          left: offset.left - customContextMenu.outerWidth() + 90 // Position to the left with a gap of 10px
        });

        // Dynamically create buttons using Kuc.Button for each item in the list
        filteredItems.forEach((item, index) => {
          const buttonLabel = item.searchName;
          const targetField = filteredItems[index].searchTarget;
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

          customContextMenu.append(hoverBtn);
          $(hoverBtn).on('click', async () => {
            const selectedItem = filteredItems[index]; // Get the selected item by index
            dropDownTitle.text(selectedItem.searchName);
            updateDropDownOptions(selectedItem, filteredItems, records, dropDownTitle, dropDown);
            customContextMenu.remove();
          });
        });

        // Append the custom context menu to the DOM
        elementsAll.append(customContextMenu);
        $(document).on('click', function (event) {
          if (!customContextMenu.is(event.target) && customContextMenu.has(event.target).length === 0 && !dropDownTitle.is(event.target)) {
            customContextMenu.remove();
            $(document).off('click');
          }
        });
      }
    }
    // Create dropdown element
    function createDropDown(display, records, initialContent, dropDownTitle) {
      const NameDropdown = display.groupName;
      NameDropdown.replace(/\s+/g, "_");
      const dropDown = $("<select>")
        .addClass("kintoneplugin-dropdown")
        .attr("id", `${NameDropdown}`)
        .css({ width: display.searchLength });
      dropDown.append($("<option>").text('-----').val(''));

      if (display.nameMarker) {
        let filteredRecords = CONFIG.searchContent.filter(item => item.groupName === display.groupName);
        filteredRecords.forEach(item => {
          records.forEach(record => {
            if (record[item.searchTarget].value === '') return;
            const option = $("<option>")
              .text(record[item.searchTarget].value)
              .addClass('option')
              .attr('value', record[item.searchTarget].value)
              .attr('fieldCode', item.searchTarget);
            dropDown.append(option);
          });
        });
        // $dropDown.trigger('change');
      } else {
        dropDownTitle.text(initialContent.searchName);
        console.log(initialContent);
        records.forEach(item => {
          if (item[initialContent.searchTarget].value === '') return;
          const initialOption = $("<option>")
            .text(item[initialContent.searchTarget].value)
            .addClass('option')
            .attr('value', item[initialContent.searchTarget].value)
            .attr('fieldCode', initialContent.searchTarget);
          dropDown.append(initialOption);
        });
        dropDown.trigger('change');
      }
      dropDown.on('change', e => {
        const selectedValue = dropDown.val();
        const selectedOption = dropDown.find("option:selected");
        const fieldCode = selectedOption.attr('fieldCode');
        const getDropdownId = dropDown.attr('id');
        const dropdownId = getDropdownId.replace(/_/g, ' ');
        const labelValue = dropDown.closest('.search-item').find('.custom-dropdownTitle').text().trim();
        console.log(`Label Value: ${labelValue}`);

        queryDropdown(selectedValue, fieldCode, dropdownId, labelValue);
      });

      return dropDown;
    }

    // Update dropdown options
    function updateDropDownOptions(selectedItem, filteredItems, records, dropDownTitle) {
      const dropDown = dropDownTitle.next('select');
      dropDown.empty();
      dropDown.append($("<option>").text('-----').val(''));

      const selectedContent = filteredItems.find(content => content.searchTarget === selectedItem.searchTarget);
      records.forEach(record => {
        if (!records || record[selectedContent.searchTarget].value === '') return;
        const selectedOption = $("<option>")
          .text(record[selectedContent.searchTarget].value)
          .addClass('option')
          .attr('value', record[selectedContent.searchTarget].value)
          .attr('fieldCode', selectedContent.searchTarget);
        dropDown.append(selectedOption);
      });
      dropDown.trigger('change');
    }

    // createDropDowns(CONFIG);
    function createBokTermsObject(selectedValue, dropdownId, labelValue) {
      return {
        groupName: {
          id: dropdownId,
          value: selectedValue,
          active: labelValue
        }
      };
    }
    function queryDropdown(selectedValue, fieldCode, dropdownId, labelValue) {
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
      const bokTermsObject = createBokTermsObject(selectedValue, fieldCode, dropdownId, labelValue);
      console.log("BokTerms object:", bokTermsObject);
      const bokTermsString = JSON.stringify(bokTermsObject);
      const bokTerms = encodeURIComponent(bokTermsString)
      const QueryUrl = `${currentUrlBase}?query=${query}&bokTerms={${bokTerms}}`;
      console.log("Full URL:", QueryUrl);
      window.location.href = QueryUrl;
    }
    // ========================
    function createTextInput(searchType, groupName, width) {
      let initialText = groupName.replace(/\s+/g, "_");
      const inputElement = $('<input>', {
        type: searchType,
        class: 'kintoneplugin-input-text',
        'data-serach-type': searchType,
        'id': initialText
      }).css({
        'width': width.searchLength,
      })
      return inputElement;
    }
    function createTextArea(searchType, groupName, width) {
      let inputTeatArae = groupName.replace(/\s+/g, "_");
      const textarea = new Kuc.TextArea({
        requiredIcon: true,
        className: 'options-class',
        id: inputTeatArae,
        visible: true,
        disabled: false
      }).css({
        'width': width.searchLength,
      })
      textarea.setAttribute('data-search-type', searchType);
      return textarea;
    }

    function createTextNumberInput(searchType, groupName, width) {
      let initialNumber = groupName.replace(/\s+/g, "_");
      const InputNumber = $('<input>', {
        type: 'number',
        class: 'kintoneplugin-input-text',
        'data-search-type': searchType,
        'id': initialNumber
      }).css({
        'width': width.searchLength,
      })
      return InputNumber;
    }

    function createNumberRangeInput(searchType, groupName, width) {
      let NumberRange = groupName.replace(/\s+/g, "_");
      const wrapper = $('<div class="wrapperd-number"></div>');
      const start = $('<input>', {
        type: 'number',
        class: 'kintoneplugin-input-text',
        'data-search-type': searchType,
        id: `${NumberRange}_start`,
      }).css({
        'width': width.searchLength,
      })
      const end = $('<input>', {
        type: 'number',
        class: 'kintoneplugin-input-text',
        'data-search-type': searchType,
        id: `${NumberRange}_end`,
      }).css({
        'width': width.searchLength,
      })
      const separator = $('<span>⁓</span>').addClass('separatornumber')
      return wrapper.append(start, separator, end);
    }

    function createDateInput(searchType, groupName, width) {
      let dateInput = groupName.replace(/\s+/g, "_");
      const datePicker = new Kuc.DatePicker({
        requiredIcon: true,
        language: 'auto',
        className: 'options-class',
        id: dateInput,
        visible: true,
        disabled: false
      }).css({
        'width': width.searchLength,
      })
      datePicker.setAttribute('data-search-type', searchType);
      return datePicker;
    }

    function createDateRangeInput(searchType, groupName, width) {
      let dateRange = groupName.replace(/\s+/g, "_");
      const datePickerSatrt = new Kuc.DatePicker({
        requiredIcon: true,
        language: 'auto',
        className: 'options-class',
        id: `${dateRange}_start`,
        visible: true,
        disabled: false
      }).css({
        'width': width.searchLength,
      })
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
      }).css({
        'width': width.searchLength,
      })
      datePickerEnd.setAttribute('data-search-type', searchType);

      const separator = $('<span>⁓</span>').addClass('separator-datepicker');
      const wrapper = $('<div></div>').addClass('wrapper-datepiker')
      wrapper.append(datePickerSatrt).append(separator).append(datePickerEnd);
      return wrapper;
    }

    // Create action buttons
    function createButton(text, callback) {
      return $('<button>').text(text).addClass('kintoneplugin-button-dialog-ok').css({
        'background': setColor.buttonColor,
        'color': setColor.buttonTextColor,
      }).on('click', callback);
    }

    const searchButton = createButton('Search', () => {
      let searchInfoList = CONFIG.groupSetting;
      searchProcess(searchInfoList);
    });
    const clearButton = createButton('C', () => {
      Swal10.fire({
        title: 'Are you sure?',
        text: "Do you want to delete the search condition?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          CONFIG.groupSetting.forEach(searchItem => {
            let getIdElement = searchItem.groupName.replace(/\s+/g, "_");
            const getId = $(`#${getIdElement}`);
            const getIdStart = $(`#${getIdElement}_start`);
            const getIdEnd = $(`#${getIdElement}_end`);
            if (getId.length) getId.val('');
            if (getIdStart.length) getIdStart.val('');
            if (getIdEnd.length) getIdEnd.val('');
            if (getId.hasClass("kintoneplugin-dropdown")) {
              if (!getId.find("option[value='']").length) {
                getId.append($("<option>").text('-----').val(''));
              }
            }
            window.location.href = '../../' + "k" + "/" + kintone.app.getId() + "/";
          });
        }
      });
    });

    //check type to create element
    const elementBtn = $('<div class="element-button"></div>').append(searchButton, clearButton);
    CONFIG.groupSetting.forEach(searchItem => {
      const { searchType, groupName, nameMarker } = searchItem;
      let setSearchTarget = [];
      let Titlename;
      let afterFilter = CONFIG.searchContent.filter((searchItem) => searchItem.groupName === groupName);
      console.log("afterFilter", afterFilter);
      let masterId = afterFilter.length > 0 ? afterFilter[0].masterId : null;
      console.log("masterIds", masterId);
      let Codemaster = CONFIG.codeMasterSetting.filter(marster => marster.masterId === masterId);
      console.log("Codemaster", Codemaster[0].codeField);
      afterFilter.forEach(searchItemTarget => {
        Titlename = nameMarker ? searchItemTarget.groupName : searchItemTarget.searchName;
        setSearchTarget.push(searchItemTarget.fieldForSearch != "-----" ? searchItemTarget.fieldForSearch : searchItemTarget.searchTarget);
        setSearchTarget.push(searchItemTarget.nameMarker !== "-----" ? searchItemTarget.searchTarget : Codemaster.length > 0 ? Codemaster[0].codeField : "");
      });

      if (afterFilter.length >= 1) {
        searchItem["target_field"] = setSearchTarget;
        const elementInput = $('<div></div>').addClass('search-item').css({
          'color': setColor.titleColor,
        });
        let inputElement;
        switch (searchType) {
          case 'text_initial':
            inputElement = createTextInput(searchType, groupName, searchItem);
            break;
          case 'text_patial':
            inputElement = createTextInput(searchType, groupName, searchItem);
            break;
          case 'text_exact':
            inputElement = createTextInput(searchType, groupName, searchItem);
            break;
          case 'multi_text_initial':
            inputElement = createTextArea(searchType, groupName, searchItem);
            break;
          case 'multi_text_patial':
            inputElement = createTextArea(searchType, groupName, searchItem);
            break;
          case 'number_exact':
            inputElement = createTextNumberInput(searchType, groupName, searchItem);
            break;
          case 'number_range':
            inputElement = createNumberRangeInput(searchType, groupName, searchItem);
            break;
          case 'date_exact':
            inputElement = createDateInput(searchType, groupName, searchItem);
            break;
          case 'date_range':
            inputElement = createDateRangeInput(searchType, groupName, searchItem);
            break;
          case 'dropdown_exact':
            inputElement = createDropDowns(CONFIG, searchItem, setColor);
            break;
          default:
            inputElement = null;
        }
        if (searchItem.searchType !== 'dropdown_exact') {
          const label = $('<label>').text(Titlename).addClass('label');
          elementInput.append(label);
        }
        elementInput.append(inputElement);
        elementsAll.append(elementInput);
      }
    });

    elementsAll.append(elementBtn);
    spaceElement.append(elementsAll);

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
  kintone.events.on(['app.record.edit.show', 'app.record.create.show', 'app.record.create.submit', 'app.record.edit.submit.success'], async (event) => {
    let record = event.record;
    let updateRecord = {};
    console.log(CONFIG);

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