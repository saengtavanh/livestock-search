jQuery.noConflict();
(async function ($, Swal10, PLUGIN_ID) {
  const CONFIG = JSON.parse(kintone.plugin.app.getConfig(PLUGIN_ID).config);
  console.log("config", CONFIG);
  kintone.events.on('app.record.index.show', async (event) => {
    let setColor = CONFIG.colorSetting;
    let queryAll;
    let bokTermsGet = {};
    let bokTermsObject;

    const records = await window.RsComAPI.getRecords({ app: kintone.app.getId() });
    console.log("records", records);

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
    const decodedBokTerms = decodeURIComponent(bokTerms).replace(/{|}/g, '');
    console.log(decodedBokTerms);

    const result = {};
    decodedBokTerms.split(',').forEach(pair => {
      const [key, value] = pair.split(':').map(item => item.trim().replace(/"/g, ''));
      result[key] = value;
    });

    // Log the result
    console.log(result);

    const spaceEl = kintone.app.getHeaderMenuSpaceElement();
    if (!spaceEl) throw new Error('The header element is unavailable on this page.');
    // Check if the custom element already exists to avoid duplicates

    if ($(spaceEl).find('.custom-space-el').length > 0) {
      console.log('Custom element already exists, skipping creation.');
      return; // Stop if element already exists
    }
    const spaceElement = $(spaceEl)
    const elementsAll = $('<div></div>').addClass('custom-space-el');

    // =========================
//TODO: FunctionSearch-------------------------------------------------
    let searchProcess = async function (searchInfoList) {
      let query = await getValueConditionAndBuildQuery(searchInfoList);
      let queryEscape = encodeURIComponent(query);
      let currentUrlBase = window.location.href.match(/\S+\//)[0];
      if (bokTermsObject) {
        bokTermsGet = { ...bokTermsGet, ...bokTermsObject };
      }
      
      const bokTermsString = JSON.stringify(bokTermsGet);
      const bokTerms = encodeURIComponent(bokTermsString)
      let url = currentUrlBase + "?query=" + queryEscape + "&bokTerms="+bokTerms+"";

      window.location.href = url;
    };

    let getValueConditionAndBuildQuery = function (searchInfoList) {
      let query = "";
      searchInfoList.forEach((searchInfo) => {
          if ($(`#${searchInfo.groupName}`).is('select')) {
            let selectedValue = $(`#${searchInfo.groupName} option:selected`).val();
            let dropdownId = searchInfo.groupName;
            let labelText = $(`#${searchInfo.groupName}`).prev('label').text();
           
            bokTermsObject = createBokTermsObject(selectedValue, dropdownId, labelText);
        } 

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
            query += buildTextInitialQuery(searchInfo, query);
            break;
          case 'multi_text_patial':
            query += buildTextPartialQuery(searchInfo, query);
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
            query += buildNumberRangeQuery(searchInfo, query);
            break;
          default:
            break;
        }
      });

      return query;
    };

    function transformString(input) {
      let characters = input.split('');
      let transformed = '_, ' + characters.join(',');

      return transformed;
    }

//TODO:InitailQuery------------------------------------------------
    let buildTextInitialQuery = function (searchInfo, query) {
      let replacedText = searchInfo.groupName.replace(/\s+/g, "_");
      let queryChild;
      let searchValue;

      if ($(`#${replacedText}`).length) {
        if ( $(`#${replacedText}`).val()) {
          searchValue = transformString($(`#${replacedText}`).val());
          bokTermsGet[replacedText] = $(`#${replacedText}`).val();
        }
      }

      if (searchValue) {
        if (searchInfo.target_field.length > 1) {
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
        return queryChild;
      }
      return '';
    };

    let buildTextPartialQuery = function (searchInfo, query) {
      let replacedText = searchInfo.groupName.replace(/\s+/g, "_");
      let queryChild;
      let searchValue;

      if ($(`#${replacedText}`).length) {
        if ( $(`#${replacedText}`).val()) {
          searchValue = transformString($(`#${replacedText}`).val());
          bokTermsGet[replacedText] = $(`#${replacedText}`).val();
        }
      }

      if (searchValue) {
        if (searchInfo.target_field.length > 1) {
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

        return queryChild;
      }
      return '';
    };

    let buildTextExactQuery = function (searchInfo, query) {
      let replacedText = searchInfo.groupName.replace(/\s+/g, "_");
      let queryChild;
      let searchValue;

      if ($(`#${replacedText}`).length) {
        searchValue = $(`#${replacedText}`).val();
        if (searchValue) {
          searchValue = transformString($(`#${replacedText}`).val());
          bokTermsGet[replacedText] = $(`#${replacedText}`).val();
        }
      }

      if (searchValue) {
        if (searchInfo.target_field.length > 1) {
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
        return queryChild;
      }
      return '';
    };

    let buildMultieinitialQuery = function (searchInfo, query) {
      console.log("fff");
      console.log("searchInfo", searchInfo);
      let replacedText = searchInfo.groupName;

      if ($(`#${replacedText}`).length) {
        console.log("have");

        let bla = $(`#${replacedText}`).val();
        console.log("bla", bla);
      }

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

      if ($(`#${replacedText}`).length) {
        console.log("have");

        let bla = $(`#${replacedText}`).val();
        console.log("bla", bla);
      }

      if (bla) {
        let queryChild = `${query ? " and " : ""}(${searchInfo.target_field} like "${bla}")`;
        // sessionStorage.setItem(searchInfo.fieldInfo.code, inputVal); // Store in session storage
        return queryChild;
      }
      return '';
    };


    let buildNumberExactQuery = function (searchInfo, query) {
      let replacedText = searchInfo.groupName.replace(/\s+/g, "_");
      let queryChild;
      let searchValue;

      if ($(`#${replacedText}`).length) {
        searchValue = $(`#${replacedText}`).val();
        if (searchValue) {
          searchValue = $(`#${replacedText}`).val();
        }
      }

      if (searchValue) {
        if (searchInfo.target_field.length > 1) {
          searchInfo.target_field.forEach((field) => {
            if (queryChild) {
              queryChild += `or (${field} = "${searchValue}")`
            } else {
              queryChild = `${query ? " and " : ""}(${field} = "${searchValue}") `;
            }
          })
        } else if ((searchInfo.target_field.length = 1)) {
          queryChild = `${query ? " and " : ""}(${searchInfo.target_field} = ${searchValue})`;
        }
        return queryChild;
      }
      return '';
    };

    let buildNumberRangeQuery = function (searchInfo, query) {
      let queryChild = "";
      let replacedText = searchInfo.groupName.replace(/\s+/g, "_");
      const startValue = $(`#${replacedText}_start`).length && $(`#${replacedText}_start`).val();
      const endValue = $(`#${replacedText}_end`).length && $(`#${replacedText}_end`).val();

      searchInfo.target_field.forEach((field) => {
        if (startValue && endValue == '') {
          bokTermsGet[`${replacedText}_start`] = $(`#${replacedText}_start`).val();
            queryChild += queryChild ? `${query ? " and " : ""}` + " or (" + field + ' ' + ">=" + ' "' + startValue + '"' + ")" : "(" + field + ' ' + ">=" + ' "' + startValue + '"' + ")";
        } else if (endValue && startValue == '') {
          bokTermsGet[`${replacedText}_end`] = $(`#${replacedText}end`).val();
          queryChild += queryChild ? `${query ? " and " : ""}` + " or (" + field + ' ' + "<=" + ' "' + endValue + '"' + ")" : "or (" + field + ' ' + "<=" + ' "' + endValue + '"' + ")";
        } else if (startValue && endValue) {
          bokTermsGet[`${replacedText}_start`] = $(`#${replacedText}_start`).val();
          bokTermsGet[`${replacedText}_end`] = $(`#${replacedText}_end`).val();
          queryChild += queryChild ?  + " or ((" + field + ' ' + ">=" + ' "' + startValue + '")' + " and (" + field + ' ' + "<=" + ' "' + endValue + '"' + "))" :
            "((" + field + ' ' + ">=" + ' "' + startValue + '")' + " and (" + field + ' ' + "<=" + ' "' + endValue + '"' + "))";
        }

      });
      let queryFinal
      if (queryChild) {
        queryFinal = `${query ? " and " : ""}` +queryChild;
      } else {
        return "";
      }
      
      return queryFinal;
    };

    let buildDateExactQuery = function (searchInfo, query) {
      let replacedText = searchInfo.groupName;
      let date
      if ($(`#${replacedText}`).length) {
        date = $(`#${replacedText}`).val();
      }

      if (date) {
        let queryChild = `${query ? " and " : ""}(${searchInfo.target_field} like "${date}")`;
        // sessionStorage.setItem(searchInfo.fieldInfo.code, inputVal); // Store in session storage
        return queryChild;
      }
      return '';
    };

    let buildDateRangeQuery = function (searchInfo, query) {
      let replacedText = searchInfo.groupName;
      if ($(`#${replacedText}_start`).length) {
        let start = $(`#${replacedText}_start`).val();
      }
      if ($(`#${replacedText}_end`).length) {
        console.log("have");

        let end = $(`#${replacedText}_end`).val();
        console.log("bla", end);
      }

      if (start && end) {
        let queryChild = `${query ? " and " : ""}(${searchInfo.target_field} like "${start}" and "${end}")`;
        // sessionStorage.setItem(searchInfo.fieldInfo.code, inputVal); // Store in session storage
        return queryChild;
      }
      return '';
    };

    // Create dropdowns based on the configuration
    function createDropDowns(CONFIG, display, color) {
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
      } else {
        dropDownTitle.text(initialContent.searchName);
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
        queryDropdown(selectedValue, fieldCode, dropdownId, labelValue);
      });

      return dropDown;
    }

    // Update dropdown options
    function updateDropDownOptions(selectedItem, filteredItems, records, dropDownTitle, groupName, status) {
      if (status == "active") {
        const dropDown = dropDownTitle
        dropDown.empty();
        dropDown.append($("<option>").text('-----').val(''));
        const selectedContent = filteredItems.filter(content => content.groupName === groupName);
        const matchingContent = selectedContent.find(content => content.searchName === selectedItem);
        if (matchingContent) {
          records.forEach(record => {
            if (!records || record[matchingContent.searchTarget].value === '') return;
            const selectedOption = $("<option>")
              .text(record[matchingContent.searchTarget].value)
              .addClass('option')
              .attr('value', record[matchingContent.searchTarget].value)
              .attr('fieldCode', matchingContent.searchTarget);
            dropDown.append(selectedOption);
          });
          dropDown.trigger('change');
        }
      } else {
        const dropDown = dropDownTitle.next("select"); // Find the corresponding dropdown
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
    }

    function createBokTermsObject(selectedValue, dropdownId, labelValue) {
      return {
        [dropdownId]: {
          value: selectedValue,
          active: labelValue
        }
      };
    }

    async function queryDropdown(selectedValue, fieldCode, dropdownId, labelValue) {
      console.log("🚀 ~ queryDropdown ~ selectedValue:", selectedValue)
      // Check if both selectedValue and fieldCode are present
      if (!selectedValue || !fieldCode) {
        bokTermsObject = createBokTermsObject("-----", dropdownId, labelValue);
        return;
      }

      let searchInfoList = CONFIG.groupSetting;
      let queryInput = await getValueConditionAndBuildQuery(searchInfoList);
      
      // let query = encodeURIComponent(`${fieldCode} = "${selectedValue}"`);
      let query = `(${fieldCode} = "${selectedValue}")`;
      bokTermsObject = createBokTermsObject(selectedValue, dropdownId, labelValue);
      let joinObject = { ...bokTermsGet, ...bokTermsObject };
      
      const currentUrlBase = window.location.href.match(/\S+\//)[0];
      const bokTermsString = JSON.stringify(joinObject);
      const bokTerms = encodeURIComponent(bokTermsString);
      // const bokTermsString = JSON.stringify(bokTermsObject);
      // const bokTerms = encodeURIComponent(bokTermsString);
      
      if (queryInput) {
        query += `${query ? " and" : ""} ${queryInput}`;
      }
      let querySuccess = encodeURIComponent(query)
      
      const QueryUrl = `${currentUrlBase}?query=${querySuccess}&bokTerms=${bokTerms}`;
      const urlObj = new URL(window.location.href);
      const bokTerm = urlObj.searchParams.get('bokTerms');
      if (bokTerm == null) {
        window.location.href = QueryUrl;
      } else {
        const decodedBokTerms = decodeURIComponent(bokTerm).replace(/(^\{|\}$)/g, '');
        const cleanBokTerms = decodedBokTerms.replace(/[^{}\[\]":,0-9a-zA-Z._-\s]/g, '');
        const wrappedBokTerms = `{${cleanBokTerms}}`;
        let bokTermObj;
        try {
          bokTermObj = JSON.parse(wrappedBokTerms);
        } catch (error) {
          console.error('Error parsing bokTerm:', error);
          bokTermObj = {}; // initialize as an empty object in case of error
        }

        // Update the bokTermObj only if the dropdownId exists
        if (dropdownId in bokTermObj) {
          bokTermObj[dropdownId].value = selectedValue;
          bokTermObj[dropdownId].active = labelValue;
        } else {
          bokTermObj[dropdownId] = {
            value: selectedValue,
            active: labelValue
          };
        }

        console.log("bokTermObj:::::::::", bokTermObj);
        
        const mergedBokTerms = encodeURIComponent(JSON.stringify(bokTermObj));
        console.log("🚀 ~ queryDropdown ~ mergedBokTerms:", mergedBokTerms)
        const updatedUrl = `${currentUrlBase}?query=${querySuccess}&bokTerms=${mergedBokTerms}`;
        // window.location.href = updatedUrl;
        console.log("🚀 ~ queryDropdown ~ querySuccess:", querySuccess)
      }
    };

    async function getURL() {
      const urlObj = new URL(window.location.href);
      const bokTerms = urlObj.searchParams.get('bokTerms');
      if (bokTerms != null) {
        const decodedBokTerms = decodeURIComponent(bokTerms).replace(/(^\{|\}$)/g, '');
        const cleanBokTerms = decodedBokTerms.replace(/[^{}\[\]":,0-9a-zA-Z._-\s]/g, '');
        const wrappedBokTerms = `{${cleanBokTerms}}`;
        let bokTerm;
        try {
          bokTerm = JSON.parse(wrappedBokTerms);
          console.log(bokTerm);
        } catch (error) {
          console.error('Error parsing bokTerm:', error);
          return; // Exit if there's an error parsing
        }
        Object.entries(bokTerm).forEach(([key, bokTermsObj]) => {
          CONFIG.groupSetting.forEach(searchItem => {
            if (searchItem.groupName === key) {
              if (searchItem.nameMarker == "") {
                let getIdElement = searchItem.groupName.replace(/\s+/g, "_");
                const getId = $(`#${getIdElement}`);
                const trimmedActive = bokTermsObj.active.trim();
                getId.closest('.search-item').find('.custom-dropdownTitle').text(trimmedActive);
                updateDropDownOptions(trimmedActive, CONFIG.searchContent, records, getId, searchItem.groupName, "active");
                if (getId.hasClass("kintoneplugin-dropdown")) {
                  const optionExists = getId.find(`option[value="${bokTermsObj.value}"]`).length > 0;
                  if (optionExists) {
                    getId.val(bokTermsObj.value);
                  } else {
                    getId.append($("<option>").text(bokTermsObj.value).val(bokTermsObj.value));
                    getId.val(bokTermsObj.value);
                  }
                }
              }
              else {
                let getIdElement = searchItem.groupName.replace(/\s+/g, "_");
                const getId = $(`#${getIdElement}`);
                if (getId.hasClass("kintoneplugin-dropdown")) {
                  const optionExists = getId.find(`option[value="${bokTermsObj.value}"]`).length > 0;
                  if (optionExists) {
                    getId.val(bokTermsObj.value);
                  } else {
                    getId.append($("<option>").text(bokTermsObj.value).val(bokTermsObj.value));
                    getId.val(bokTermsObj.value);
                  }
                }
              }
            }
          });
        });
      }
    }

//TODO: CreateElement
    // ========================
    function createTextInput(searchType, groupName, width) {
      let initialText = groupName.replace(/\s+/g, "_");
      const inputElement = $('<input>', {
        type: searchType,
        class: 'kintoneplugin-input-text',
        'data-serach-type': searchType,
        'id': initialText
      }).css({
        'width': width.searchLength || ""
      })

      if (result[initialText]) {
        inputElement.val(result[initialText]);
      }

      // Return the input element for further use
      console.log(inputElement.val());
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
        'width': width.searchLength || ""
      })

      if (result[inputTeatArae]) {
        textarea.value = result[inputTeatArae];
      }

      textarea.setAttribute('data-search-type', searchType);
      // textarea.setAttribute('id', inputTeatArae);
      textarea.addEventListener('change', event => console.log("TextArea:", event.detail.value));
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
        'width': width.searchLength || ""
      });
      
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
        'width': width.searchLength || ""
      });

      const end = $('<input>', {
        type: 'number',
        class: 'kintoneplugin-input-text',
        'data-search-type': searchType,
        id: `${NumberRange}_end`,
      }).css({
        'width': width.searchLength || ""
      });

      result[`${NumberRange}_start`] ? start.val(result[`${NumberRange}_start`]) : "";
      result[`${NumberRange}_end`] ? end.val(result[`${NumberRange}_end`]) : "";

      const separator = $('<span>⁓</span>').addClass('separatornumber');

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
        'width': width.searchLength || ""
      });

      datePicker.setAttribute('data-search-type', searchType);
      datePicker.addEventListener('change', event => console.log("DatePicker", event.detail.value));
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
        'width': width.searchLength || ""
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
      }).css({
        'width': width.searchLength || ""
      });

      datePickerEnd.setAttribute('data-search-type', searchType);
      datePickerEnd.addEventListener('change', event => {
        console.log("End Date", event.detail.value);
      });

      result[`${dateRange}_start`] ? datePickerSatrt.val(result[`${dateRange}_start`]) : "";
      result[`${dateRange}_end`] ? datePickerEnd.val(result[`${dateRange}_end`]) : "";

      const $separator = $('<span>⁓</span>').addClass('separator-datepicker');

      const $wrapper = $('<div></div>').addClass('wrapper-datepiker')
      $wrapper.append(datePickerSatrt).append($separator).append(datePickerEnd);

      return $wrapper;
    }

    // Create action buttons
    function createButton(text, callback) {
      return $('<button>').text(text).addClass('kintoneplugin-button-dialog-ok').css({
        'background': setColor.buttonColor,
        'color': setColor.buttonTextColor,
      }).on('click', callback);
    }

    const $searchButton = createButton('Search', () => {
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

    const elementBtn = $('<div class="element-button"></div>').append($searchButton, clearButton);


    //TODO: Create Function-------------------------------------------------------------------------
    CONFIG.groupSetting.forEach(searchItem => {
      const { searchType, groupName, nameMarker } = searchItem;
      let setSearchTarget = [];
      let Titlename;
      let afterFilter = CONFIG.searchContent.filter((searchItem) => searchItem.groupName == groupName);
        afterFilter.forEach(searchItemTarget => {
          Titlename = nameMarker ? searchItemTarget.groupName : searchItemTarget.searchName;
            setSearchTarget.push(searchItemTarget.fieldForSearch != "-----" ? searchItemTarget.fieldForSearch : searchItemTarget.searchTarget);
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
    getURL()
  });

  kintone.events.on([
    'app.record.edit.show',
    'app.record.create.show',
    'app.record.create.submit',
    'app.record.edit.submit.success',
    'app.record.detail.show'], async (event) => {
      let record = event.record;
      let updateRecord = {};
      for (const searchItem of CONFIG.searchContent) {
        for (const item of CONFIG.groupSetting) {
          if (item.groupName == searchItem.groupName) {
            if (
              item.searchType == "text_initial" ||
              item.searchType == "text_patial" ||
              item.searchType == "text_exact" ||
              item.searchType == "multi_text_initial" ||
              item.searchType == "multi_text_patial"
            ) {
              console.log(searchItem.fieldForSearch);
              kintone.app.record.setFieldShown(searchItem.fieldForSearch, false);
              let targetValue = record[searchItem.searchTarget].value;
              console.log(targetValue);

              let convertedValue = "";
              if (targetValue == "" || targetValue == undefined) {
                convertedValue = "";
              } else {
                switch (item.searchType) {
                  case "text_initial":
                  case "multi_text_initial":
                    convertedValue = `_,${targetValue.split("").join(",")}`;
                    break;
                  case "text_patial":
                  case "multi_text_patial":
                    convertedValue = `${targetValue.split("").join(",")}`;
                    break;
                  case "text_exact":
                    convertedValue = `_,${targetValue.split("").join(",")},_`;
                    break;
                  default:
                    break;
                }
              }
              updateRecord[searchItem.fieldForSearch] = { value: convertedValue };
              record[searchItem.fieldForSearch].value = convertedValue;
            }
          }
        }
      }

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