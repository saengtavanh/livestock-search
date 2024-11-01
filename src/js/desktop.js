jQuery.noConflict();
(async function ($, Swal10, PLUGIN_ID) {
  let CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID).config;
  if (!CONFIG) return;
  kintone.events.on("app.record.index.show", async (event) => {
    CONFIG = JSON.parse(kintone.plugin.app.getConfig(PLUGIN_ID).config);
    let DETFIELDlIST = cybozu.data.page.SCHEMA_DATA;
    console.log("config", CONFIG);
    //data test
    window.RsComAPI.getRecords({ app: 234 })
      .then(dataFromMaster => {
        console.log(dataFromMaster, "helloooo");
        sessionStorage.setItem("kintoneRecords", JSON.stringify(dataFromMaster));
        sessionStorage.setItem("dataspace", JSON.stringify([{
          spc: "spaceA",
          kind: "品種",
          code: "品種CD",
          name: "品種",
          required: true
        },
        {
          spc: "spaceB",
          kind: "性別",
          code: "性別CD",
          name: "性別",
          required: true
        },
        {
          spc: "spaceC",
          kind: "產地",
          code: "產地CD",
          name: "產地",
          required: true
        },
        {
          spc: "spaceD",
          kind: "預託区分",
          code: "預託区分CD",
          name: "預託区分",
          required: true
        }]));
      });
    //data test

    console.log(CONFIG);

    CONFIG.codeMasterSetting.forEach(setting => {
      window.RsComAPI.getRecords({ app: setting.appId, query: setting.typeField })
        .then(dataFromMaster => {
          const codeAndName = dataFromMaster.map(record => ({
            code: record.code.value,
            name: record.name.value
          }));

          const dataToStore = {
            AppId: setting.appId,
            ApiToken: setting.apiToken,
            codeAndName: codeAndName,
            condition: setting.typeField,
          };
          sessionStorage.setItem(`bokMst${setting.masterId}`, JSON.stringify(dataToStore));
        })
        .catch(error => {
          console.error("Error fetching records:", error);
        });
    });

    let SETCOLOR = CONFIG.colorSetting;
    let queryForDropdow = "";
    let queryAll = "";
    let bokTermsGet = {};
    let bokTermsObject;

    const records = await window.RsComAPI.getRecords({ app: kintone.app.getId() });
    console.log("records", records);

    let elements = document.querySelectorAll(".recordlist-edit-gaia");
    console.log(elements);
    elements.forEach(element => {
      element.style.display = "none";
    });

    const recordRows = document.querySelectorAll('.recordlist-row-gaia');
    recordRows.forEach(row => {
      row.addEventListener(
        'dblclick',
        function (e) {
          e.stopImmediatePropagation();
          e.preventDefault();
        },
        true
      );
    });

    // getItem sessionStorage 
    function getDataFromSessionStorage(key) {
      const data = sessionStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }
    const storedData = getDataFromSessionStorage("bokMst1");
    
    let coseMaster = storedData != null ? storedData.codeAndName : null;
    let ITEMS = [];

    if (coseMaster !== null) {
      ITEMS.push(coseMaster);
    }

    // // if (!CONFIG) return;
    // console.log(window.location.href);
    const urlObj = new URL(window.location.href);

    const bokTerms = urlObj.searchParams.get("bokTerms");

    const decodedBokTerms = decodeURIComponent(bokTerms).replace(/{|}/g, "");
    console.log(decodedBokTerms);

    const result = {};
    decodedBokTerms.split(",").forEach(pair => {
      const [key, value] = pair.split(":").map(item => item.trim().replace(/"/g, ""));
      result[key] = value;
    });

    // Log the result
    console.log(result);

    const spaceEl = kintone.app.getHeaderMenuSpaceElement();
    if (!spaceEl) throw new Error("The header element is unavailable on this page.");
    // Check if the custom element already exists to avoid duplicates

    if ($(spaceEl).find(".custom-space-el").length > 0) {
      console.log("Custom element already exists, skipping creation.");
      return; // Stop if element already exists
    }
    const spaceElement = $(spaceEl);
    const elementsAll = $("<div></div>").addClass("custom-space-el");

//TODO: FunctionSearch-------------------------------------------------
    let searchProcess = async function (searchInfoList) {
      let query = await getValueConditionAndBuildQuery(searchInfoList, false);
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

    let getValueConditionAndBuildQuery = function (searchInfoList, dropDownChange) {
      let query = "";
      let queryChild = "";

      searchInfoList.forEach((searchInfo) => {
        if ($(`#${searchInfo.groupName}`).is('select')) {
          let selectedValue = $(`#${searchInfo.groupName} option:selected`).val();
          let dropdownId = searchInfo.groupName;
          let labelText = $(`#${searchInfo.groupName}`).prev('label').text();
          if (selectedValue) {
              bokTermsObject = createBokTermsObject(selectedValue, dropdownId, labelText);
              if (!dropDownChange) {
                
                  if (searchInfo.groupName == labelText && searchInfo.nameMarker && searchInfo.searchType == "dropdown_exact") {
                    if (searchInfo.target_field.length > 1) {
                      searchInfo.target_field.forEach((fieldCode, index) => {
                        const isLastIndex = index === searchInfo.target_field.length - 1;
            
                        if (queryChild) {
                          if (isLastIndex) {
                            queryChild += `or (${fieldCode} in ("${selectedValue}")))`;
                          } else {
                            queryChild += `or (${fieldCode} in ("${selectedValue}"))`;
                          }
                        } else {
                          queryChild = `((${fieldCode} in ("${selectedValue}")) `;
                        }
                      });
                      query += `${query ? " and " : ""}${queryChild}`;
                    } else {
                      query += `${query ? " and " : ""}(${searchInfo.target_field[0]} in ("${selectedValue}"))`;
                    }
                  } else if (searchInfo.groupName == selectedId && searchInfo.nameMarker == '' && searchInfo.searchType == "dropdown_exact") {
                      query += `${query ? " and " : ""}(${fieldCode} in ("${selectedValue}"))`;
                  }
              }
          } 
        }
          


        switch (searchInfo.searchType) {
          case "text_initial":
            query += buildTextInitialQuery(searchInfo, query);
            break;
          case "text_patial":
            query += buildTextPartialQuery(searchInfo, query);
            break;
          case "text_exact":
            query += buildTextExactQuery(searchInfo, query);
            break;
          case "multi_text_initial":
            query += buildTextInitialQuery(searchInfo, query);
            break;
          case "multi_text_patial":
            query += buildTextPartialQuery(searchInfo, query);
            break;
          case "number_exact":
            query += buildNumberExactQuery(searchInfo, query);
            break;
          case "number_range":
            query += buildNumberRangeQuery(searchInfo, query);
            break;
          case "date_exact":
            query += buildDateExactQuery(searchInfo, query);
            break;
          case "date_range":
            query += buildNumberRangeQuery(searchInfo, query);
            break;
          default:
            break;
        }
      });

      return query;
    };

    function transformString(input) {
      let characters = input.split("");
      let transformed = "_, " + characters.join(",");

      return transformed;
    }

//TODO:InitailQuery------------------------------------------------
    let buildTextInitialQuery = function (searchInfo, query) {
      let replacedText = searchInfo.groupName.replace(/\s+/g, "_");
      let queryChild;
      let searchValue;

      if ($(`#${replacedText}`).length) {
        if ($(`#${replacedText}`).val()) {
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
      return "";
    };

    let buildTextPartialQuery = function (searchInfo, query) {
      let replacedText = searchInfo.groupName.replace(/\s+/g, "_");
      let queryChild;
      let searchValue;

      if ($(`#${replacedText}`).length) {
        if ($(`#${replacedText}`).val()) {
          searchValue = transformString($(`#${replacedText}`).val());
          bokTermsGet[replacedText] = $(`#${replacedText}`).val();
        }
      }

      if (searchValue) {
        if (searchInfo.target_field.length > 1) {
          searchInfo.target_field.forEach((field) => {
            if (queryChild) {
              queryChild += `or (${field} like "${searchValue}")`;
            } else {
              queryChild = `${query ? " and " : ""}(${field} like "${searchValue}") `;
            }
          })
        } else if ((searchInfo.target_field.length = 1)) {
          queryChild = `${query ? " and " : ""}(${searchInfo.target_field} like "${searchValue}")`;
        }

        return queryChild;
      }
      return "";
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
              queryChild += `or (${field} like "${searchValue}")`;
            } else {
              queryChild = `${query ? " and " : ""}(${field} like "${searchValue}") `;
            }
          })
        } else if ((searchInfo.target_field.length = 1)) {
          queryChild = `${query ? " and " : ""}(${searchInfo.target_field} like "${searchValue}")`;
        }
        return queryChild;
      }
      return "";
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
        return queryChild;
      }
      return '';
    };

    // Create dropdowns based on the configuration
    function createDropDowns(display) {
      let relatedContent = CONFIG.searchContent.filter(content => content.groupName === display.groupName);
      // Only show content if `name_marker` is not empty
      if (display.nameMarker && relatedContent.length === 0) return;

      if (relatedContent.length > 0) {
        const dropDownTitle = $("<label>")
          .text(display.nameMarker ? display.groupName : relatedContent[0].searchName)
          .addClass("custom-dropdownTitle")
          .css({
            cursor: display.nameMarker ? "default" : "pointer",
            color: SETCOLOR?.titleColor
          }).on("click", function () {
            handleDropDownTitleClick(display, relatedContent, dropDownTitle, dropDown);
          });
        const dropDown = createDropDown(display, records, relatedContent[0], dropDownTitle);
        const DropdownAll = $("<div></div>").addClass("search-item").append(dropDownTitle, dropDown);
        elementsAll.append(DropdownAll);
      }
    }


    function handleDropDownTitleClick(display, dropDownTitle, dropDown) {
      if (display.nameMarker === "") {
        dropDownTitle.css({ cursor: "pointer" });
        const existingMenu = $(".custom-context-menu");
        if (existingMenu.length > 0) {
          existingMenu.remove();
        }

        // Filter items based on the group name
        const filteredItems = CONFIG.searchContent.filter(content => content.groupName === display.groupName && !display.nameMarker);
        console.log("filteredItems", filteredItems);
        const customContextMenu = $("<div></div>").addClass("custom-context-menu")
          .css({
            display: "flex",
            "flex-direction": "column",
            "align-items": "center",
            margin: "5px",
            padding: "10px",
            "background-color": "#f0f0f0",
            color: "#000",
            position: "absolute",
            zIndex: 1000
          });

        // Position the pop-up to the left of the dropdown title
        const offset = dropDownTitle.offset();
        console.log(offset);
        customContextMenu.css({
          top: offset.top + dropDownTitle.outerHeight() - 250, 
          left: offset.left - customContextMenu.outerWidth() + 90 
        });

        // Dynamically create buttons using Kuc.Button for each item in the list
        filteredItems.forEach((item, index) => {
          const buttonLabel = item.searchName;
          const targetField = filteredItems[index].searchTarget;

          const hoverBtn = new Kuc.Button({
            text: buttonLabel,
            type: "normal",
            className: "class-btn",
            id: targetField
          });
          $(hoverBtn).css({
            margin: "5px 0",
            width: "100%"
          });

          customContextMenu.append(hoverBtn);
          $(hoverBtn).on("click", async () => {
            const selectedItem = filteredItems[index]; // Get the selected item by index
            dropDownTitle.text(selectedItem.searchName);
            updateDropDownOptions(selectedItem, filteredItems, records, dropDownTitle, dropDown);
            customContextMenu.remove();
          });
        });

        // Append the custom context menu to the DOM
        elementsAll.append(customContextMenu);
        $(document).on("click", function (event) {
          if (!customContextMenu.is(event.target) && customContextMenu.has(event.target).length === 0 && !dropDownTitle.is(event.target)) {
            customContextMenu.remove();
            $(document).off("click");
          }
        });
      }
    }
    // Create dropdown element
    function createDropDown(display, records, initialContent, dropDownTitle) {
      const NameDropdown = display.groupName.replace(/\s+/g, "_");
      const dropDown = $("<select>")
        .addClass("kintoneplugin-dropdown")
        .attr("id", `${NameDropdown}`)
        .css({ width: display.searchLength });
      dropDown.append($("<option>").text("-----").val(""));
      let filteredRecords = CONFIG.searchContent.filter(item => item.groupName === display.groupName);

      if (display.nameMarker) {
        if (filteredRecords[0]?.masterId > 0) {
          filteredRecords.forEach(item => {
            ITEMS[0].forEach(data => {
              if (data.code && data.name) {
                const option = $("<option>")
                  .text(data.name)
                  .addClass("option")
                  .attr("value", data.code)
                  .attr("fieldCode", item.searchTarget);
                dropDown.append(option);
              }
            });
          });
        } else {
          let filteredRecords = CONFIG.searchContent.filter(
            (item) => item.groupName === display.groupName
          );
          //get field 
          $.each(filteredRecords, (index, item) => {
            $.each(DETFIELDlIST, (index, data) => {
              let fieldList = data.fieldList;
              $.each(fieldList, (index, value) => {
                if (item.searchTarget !== value.var) return;
                let dataValue = value.properties?.options;
                if (!dataValue) return;
                $.each(dataValue, (index, options) => {
                  let optionValue = options.label;
                  const option = $("<option>")
                    .text(optionValue)
                    .addClass("option")
                    .attr("value", optionValue)
                    .attr("fieldCode", item.searchTarget);
                  dropDown.append(option);
                });
              });
            });
          });
        }
      } else {
        if (filteredRecords[0]?.masterId > 0) {
        dropDownTitle.text(initialContent.searchName);
        ITEMS[0].forEach(data => {
          if (data.code && data.name) {
            const initialOption = $("<option>")
              .text(data.name)
              .addClass("option")
              .attr("value", data.code)
              .attr("fieldCode", initialContent.searchTarget);
            dropDown.append(initialOption);
          }
        });
        dropDown.trigger("change");
      } else {
          dropDownTitle.text(initialContent.searchName);
          $.each(DETFIELDlIST, (index, data) => {
            let fieldList = data.fieldList;
            $.each(fieldList, (index, value) => {
              if (initialContent.searchTarget !== value.var) return;
              let dataValue = value.properties?.options;
              if (!dataValue) return;
              $.each(dataValue, (index, options) => {
                let optionValue = options.label;
                const initialOption = $("<option>")
                  .text(optionValue)
                  .addClass("option")
                  .attr("value", optionValue)
                  .attr("fieldCode", initialContent.searchTarget);
                dropDown.append(initialOption);
              });
            });
          });
          dropDown.trigger("change");
        }
      }
      dropDown.on('change', (e) => {
        const selectedValue = dropDown.val();
        const selectedOption = dropDown.find("option:selected");
        const fieldCode = selectedOption.attr("fieldCode");
        const getDropdownId = dropDown.attr("id");
        const dropdownId = getDropdownId.replace(/_/g, " ");
        const labelValue = dropDown.closest(".search-item").find(".custom-dropdownTitle").text().trim();
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
          if (matchingContent.masterId > 0) {
            ITEMS[0].forEach(data => {
              console.log("+++++++++++++++++++++++++++++", data)
              const selectedOption = $("<option>")
                .text(data.name)
                .addClass('option')
                .attr('value', data.code)
                .attr('fieldCode', matchingContent.searchTarget);
              dropDown.append(selectedOption);
            });
            dropDown.trigger('change');
          } else {
            $.each(DETFIELDlIST, (index, data) => {
              let fieldList = data.fieldList;
              $.each(fieldList, (index, value) => {
                if (matchingContent.searchTarget !== value.var) return;
                let dataValue = value.properties?.options;
                if (!dataValue) return;
                $.each(dataValue, (index, options) => {
                  let optionValue = options.label;
                  const selectedOption = $("<option>")
                    .text(optionValue)
                    .addClass("option")
                    .attr("value", optionValue)
                    .attr("fieldCode", matchingContent.searchTarget);
                  dropDown.append(selectedOption);
                });
              });
            });
            dropDown.trigger("change");
          }
        }
      } else {
        const dropDown = dropDownTitle.next("select"); // Find the corresponding dropdown
        dropDown.empty();
        dropDown.append($("<option>").text("-----").val(""));
        const selectedContent = filteredItems.find(content => content.searchTarget === selectedItem.searchTarget);
        if (selectedContent.masterId > 0) {
          ITEMS[0].forEach(data => {
            console.log("CodeMaster", data)
            if (data.name && data.code) {
              const selectedOption = $("<option>")
                .text(data.name)
                .addClass("option")
                .attr("value", data.code)
                .attr("fieldCode", selectedContent.searchTarget);
              dropDown.append(selectedOption);
            }
          });
          dropDown.trigger("change");
        } else {
          $.each(DETFIELDlIST, (index, data) => {
            let fieldList = data.fieldList;
            console.log("fieldList", fieldList);
            $.each(fieldList, (index, value) => {
              if (selectedItem.searchTarget !== value.var) return;
              let dataValue = value.properties?.options;
              if (!dataValue) return;
              $.each(dataValue, (index, options) => {
                let optionValue = options.label;
                const selectedOption = $("<option>")
                  .text(optionValue)
                  .addClass("option")
                  .attr("value", optionValue)
                  .attr("fieldCode", selectedItem.searchTarget);
                dropDown.append(selectedOption);
              });
            });
          });
          dropDown.trigger("change");
        }
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

      let selectedId = dropdownId;
      let queryChild;
      let query;
      let searchInfoList = CONFIG.groupSetting;

      let urlObjDropdown = new URL(window.location.href);
      let getQueryFromUrl = urlObjDropdown.searchParams.get('query');
      let changeToArray;
      if (getQueryFromUrl) {
        changeToArray = getQueryFromUrl.split(/ and /);
        console.log("🚀 ~ queryDropdown ~ changeToArray:", changeToArray)
      }


      let queryInput = await getValueConditionAndBuildQuery(searchInfoList, true);
      if (queryForDropdow) {
        query = `${query ? " and" : ""} ${queryForDropdow}`;
     }
     console.log("searchInfoList :::::::::::::::::::", searchInfoList);
     
    searchInfoList.forEach((field, index) => {
      queryChild = "";
      if (field.groupName == selectedId && field.nameMarker) {
        if (field.target_field.length > 1) {
          field.target_field.forEach((fieldCode, index) => {
            const isLastIndex = index === field.target_field.length - 1;

            if (queryChild) {
              if (isLastIndex) {
                queryChild += `or (${fieldCode} in ("${selectedValue}")))`;
              } else {
                queryChild += `or (${fieldCode} in ("${selectedValue}"))`;
              }
            } else {
              queryChild = `((${fieldCode} in ("${selectedValue}")) `;
            }
          });
          query = `${query ? " and " : ""}${queryChild}`;
        } else {
          query = `${query ? " and " : ""}(${field.target_field[0]} in ("${selectedValue}"))`;
        }
      } else if (field.groupName == selectedId && field.nameMarker == '') {
          query = `${query ? " and " : ""}(${fieldCode} = "${selectedValue}")`;
      }
    });

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
          console.log("🚀 ~ queryDropdown ~ bokTermObj:", bokTermObj)
        } catch (error) {
          console.error('Error parsing bokTerm:', error);
          bokTermObj = {}; // initialize as an empty object in case of error
        }

        console.log("fieldCode=====>", fieldCode);
          if (!selectedValue || !fieldCode) {
            // if selected == "-----";
            Object.entries(bokTermObj).forEach(([key, bokTermsObj]) => {
              console.log("key ====", bokTermsObj);
              searchInfoList.forEach((field) => {
                if (field.groupName == selectedId) {
                  if (field.groupName == bokTermsObj.active && field.nameMarker && field.searchType == "dropdown_exact") {
                    if (field.target_field.length > 1) {
                      field.target_field.forEach((fieldCode, index) => {
                        const isLastIndex = index === field.target_field.length - 1;
                        if (queryChild) {
                          if (isLastIndex) {
                            queryChild += `or (${fieldCode} in ("${bokTermsObj.value}")))`;
                          } else {
                            queryChild += `or (${fieldCode} in ("${bokTermsObj.value}"))`;
                          }
                        } else {
                          queryChild = `((${fieldCode} in ("${bokTermsObj.value}")) `;
                        }
                      });
                        // query += `${query ? " and " : ""}${queryChild}`;
                        let filteredArray = changeToArray.filter(item => item !== queryChild);
                        let string = filteredArray.join(' and ');
                        delete bokTermObj[selectedId];
                        query = string;
                        
                    } else {
                      // query += `${query ? " and " : ""}(${field.target_field[0]} like "${bokTermsObj.value}")`;
                      let filteredArray = changeToArray.filter(item => item !== `(${field.target_field[0]} in ("${bokTermsObj.value}"))`);
                      let string = filteredArray.join(' and ');
                      delete bokTermObj[selectedId];
                      query = string;
                    }
                  } else if (field.groupName == selectedId && field.nameMarker == '') {
                      let filteredArray = changeToArray.filter(item => item !== `(${fieldCode} in ("${bokTermsObj.value}"))`);
                      let string = filteredArray.join(' and ');
                      delete bokTermObj[selectedId];
                      query = string;
                  }
                }
                
              })
              console.log("queryChild::::::::::::", queryChild);
            });

        } else {

          Object.entries(bokTermObj).forEach(([key, bokTermsObj]) => {
            console.log("key ====", bokTermsObj);
            searchInfoList.forEach((field) => {
              if (field.groupName != selectedId) {
                if (field.groupName == bokTermsObj.active && field.nameMarker && field.searchType == "dropdown_exact") {
                  if (field.target_field.length > 1) {
                    field.target_field.forEach((fieldCode, index) => {
                      const isLastIndex = index === field.target_field.length - 1;
                      if (queryChild) {
                        if (isLastIndex) {
                          queryChild += `or (${fieldCode} in ("${bokTermsObj.value}")))`;
                        } else {
                          queryChild += `or (${fieldCode} in ("${bokTermsObj.value}"))`;
                        }
                      } else {
                        queryChild = `((${fieldCode} in ("${bokTermsObj.value}")) `;
                      }
                    });
                      query += `${query ? " and " : ""}${queryChild}`;
                  } else {
                    query += `${query ? " and " : ""}(${field.target_field[0]} in ("${bokTermsObj.value}"))`;
                  }
                } else if (field.groupName == selectedId && field.nameMarker == '') {
                    query += `${query ? " and " : ""}(${fieldCode} = "${bokTermsObj.value}")`;
                }
              }
              
            })
            console.log("queryChild::::::::::::", queryChild);
          });

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

        }

        querySuccess = encodeURIComponent(query)
        const mergedBokTerms = encodeURIComponent(JSON.stringify(bokTermObj));
        const updatedUrl = `${currentUrlBase}?query=${querySuccess}&bokTerms=${mergedBokTerms}`;
        window.location.href = updatedUrl;
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
                console.log("bokTermsObj.valu ======>>>>>", bokTermsObj.valu);
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
      const inputElement = $("<input>", {
        type: searchType,
        class: "kintoneplugin-input-text",
        "data-serach-type": searchType,
        "id": initialText
      })

      inputElement.css("width", width);

      if (result[initialText]) {
        inputElement.val(result[initialText]);
      }

      // Return the input element for further use
      console.log(inputElement.val());
      return inputElement;
    }

    function createTextNumberInput(searchType, groupName, width) {
      let initialNumber = groupName.replace(/\s+/g, "_");
      const InputNumber = $("<input>", {
        type: "number",
        class: "kintoneplugin-input-text",
        "data-search-type": searchType,
        "id": initialNumber
      })

      InputNumber.css("width", width);
      
      return InputNumber;
    }

    function createNumberRangeInput(searchType, groupName, width) {
      let NumberRange = groupName.replace(/\s+/g, "_");
      const wrapper = $('<div class="wrapperd-number"></div>');
      const start = $("<input>", {
        type: "number",
        class: "kintoneplugin-input-text",
        "data-search-type": searchType,
        id: `${NumberRange}_start`,
      })

      // set css
      start.css("width", width);

      const end = $("<input>", {
        type: "number",
        class: "kintoneplugin-input-text",
        "data-search-type": searchType,
        id: `${NumberRange}_end`,
      })

      // set css
      end.css("width", width);

      result[`${NumberRange}_start`] ? start.val(result[`${NumberRange}_start`]) : "";
      result[`${NumberRange}_end`] ? end.val(result[`${NumberRange}_end`]) : "";

      const separator = $('<span>⁓</span>').addClass('separatornumber');

      return wrapper.append(start, separator, end);
    }

    function createDateInput(searchType, groupName) {
      let dateInput = groupName.replace(/\s+/g, "_");
      const datePicker = new Kuc.DatePicker({
        requiredIcon: true,
        language: 'auto',
        className: 'options-class-date',
        id: dateInput,
        visible: true,
        disabled: false
      })

      datePicker.setAttribute('data-search-type', searchType);
      datePicker.addEventListener('change', event => console.log("DatePicker", event.detail.value));
      return datePicker;
    }

    function createDateRangeInput(searchType, groupName) {
      let dateRange = groupName.replace(/\s+/g, "_");
      const datePickerSatrt = new Kuc.DatePicker({
        requiredIcon: true,
        language: 'auto',
        className: 'options-class-date',
        id: `${dateRange}_start`,
        visible: true,
        disabled: false
      })

      datePickerSatrt.setAttribute('data-search-type', searchType);
      datePickerSatrt.addEventListener('change', event => {
        console.log("Start Date", event.detail.value);
      });

      const datePickerEnd = new Kuc.DatePicker({
        requiredIcon: true,
        language: "auto",
        className: "options-class-date",
        id: `${dateRange}_end`,
        visible: true,
        disabled: false
      }).css({
        "width": width.searchLength || ""
      });

      datePickerEnd.setAttribute("data-search-type", searchType);
      datePickerEnd.addEventListener("change", event => {
        console.log("End Date", event.detail.value);
      });

      result[`${dateRange}_start`] ? datePickerSatrt.val(result[`${dateRange}_start`]) : "";
      result[`${dateRange}_end`] ? datePickerEnd.val(result[`${dateRange}_end`]) : "";

      const $separator = $("<span>⁓</span>").addClass("separator-datepicker");

      const $wrapper = $("<div></div>").addClass("wrapper-datepiker")
      $wrapper.append(datePickerSatrt).append($separator).append(datePickerEnd);

      return $wrapper;
    }

    // Create action buttons
    function createButton(text, callback) {
      return $("<button>").text(text).addClass("kintoneplugin-button-dialog-ok").css({
        "background": SETCOLOR.buttonColor,
        "color": SETCOLOR.buttonTextColor,
      }).on("click", callback);
    }

    const $searchButton = createButton('Search', () => {
      let searchInfoList = CONFIG.groupSetting;
      searchProcess(searchInfoList);
    });

    const clearButton = createButton("C", () => {
      Swal10.fire({
        position: "center",
        icon: "info",
        text: "クエリをクリアにしますか？",
        confirmButtonColor: "#3498db",
        showCancelButton: true,
        cancelButtonColor: "#f7f9fa",
        confirmButtonText: "はい",
        cancelButtonText: "いいえ",
        customClass: {
            confirmButton: 'custom-confirm-button',
            cancelButton: 'custom-cancel-button'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          const urlObj = new URL(window.location.href);
          const bokTerms = urlObj.searchParams.get("bokTerms");
          let bokTermObj;
          if (bokTerms != null) {
            const decodedBokTerms = decodeURIComponent(bokTerms).replace(/(^\{|\}$)/g, "");
            const cleanBokTerms = decodedBokTerms.replace(/[^{}\[\]":,0-9a-zA-Z._-\s]/g, "");
            const wrappedBokTerms = `{${cleanBokTerms}}`;
            try {
              bokTermObj = JSON.parse(wrappedBokTerms);
            } catch (error) {
              console.error("Error parsing bokTerm:", error);
              return;
            }
            eventClickHandler(bokTermObj)
          } else {
            eventClickHandler(bokTermObj)
          }
        }
      });
      function eventClickHandler(bokTermObj) {
        CONFIG.groupSetting.forEach((searchItem) => {
          let getIdElement = searchItem.groupName.replace(/\s+/g, "_");
          const getId = $(`#${getIdElement}`);
          // const getIdStart = $(`#${getIdElement}_start`);
          // const getIdEnd = $(`#${getIdElement}_end`);
          // if (getId.length) getId.val("");
          // if (getIdStart.length) getIdStart.val("");
          // if (getIdEnd.length) getIdEnd.val("");
          if (getId.hasClass("kintoneplugin-dropdown")) {
            const dropdownId = getId.attr("id");
            const labelValue = getId.closest(".search-item").find(".custom-dropdownTitle").text().trim();
            if (dropdownId && dropdownId in bokTermObj) {
              bokTermObj[dropdownId].value = "-----";
              bokTermObj[dropdownId].active = labelValue;
            } else if (dropdownId) {
              bokTermObj[dropdownId] = {
                value: "-----",
                active: labelValue,
              };
            }
          }
        });
        const currentUrlBase = window.location.href.match(/\S+\//)[0];
        const mergedBokTerms = encodeURIComponent(JSON.stringify(bokTermObj));
        const updatedUrl = `${currentUrlBase}?&bokTerms=${mergedBokTerms}`;
        window.location.href = updatedUrl;
      }
    });

    const elementBtn = $('<div class="element-button"></div>').append($searchButton, clearButton);


    //TODO: Create Function-------------------------------------------------------------------------
    CONFIG.groupSetting.forEach(searchItem => {
      const { searchType, groupName, nameMarker } = searchItem;
      let setSearchTarget = [];
      let Titlename;
      let afterFilter = CONFIG.searchContent.filter((searchItem) => searchItem.groupName == groupName);
        afterFilter.forEach(searchItemTarget => {
          Titlename = nameMarker ? searchItemTarget.groupName : afterFilter[0].searchName;
            setSearchTarget.push(searchItemTarget.fieldForSearch != "-----" ? searchItemTarget.fieldForSearch : searchItemTarget.searchTarget);
        });

        //get with css in config
      let setWidth = searchItem.searchLength
        .match(/^\s*(\d+\s*(rem|px|%))/i)[1]
        .replace(/\s/g, '');
      if (!setWidth) return;

        if (afterFilter.length >= 1) {
          searchItem["target_field"] = setSearchTarget;
          const elementInput = $('<div></div>').addClass('search-item').css({
            'color': SETCOLOR.titleColor,
          });

          let inputElement;
          switch (searchType) {
            case "text_initial":
              inputElement = createTextInput(searchType, groupName, setWidth);
              break;
            case "text_patial":
              inputElement = createTextInput(searchType, groupName, setWidth);
              break;
            case "text_exact":
              inputElement = createTextInput(searchType, groupName, setWidth);
              break;
            case "multi_text_initial":
              inputElement = createTextInput(searchType, groupName, setWidth);
              break;
            case "multi_text_patial":
              inputElement = createTextInput(searchType, groupName, setWidth);
              break;
            case "number_exact":
              inputElement = createTextNumberInput(
                searchType,
                groupName,
                setWidth
              );
              break;
            case "number_range":
              inputElement = createNumberRangeInput(
                searchType,
                groupName,
                setWidth
              );
              break;
            case "date_exact":
              inputElement = createDateInput(searchType, groupName);
              setTimeout(() => {
                $(inputElement).find(`input`).css({ width: setWidth });
              }, 0);
              break;
            case "date_range":
              inputElement = createDateRangeInput(
                searchType,
                groupName,
                searchItem
              );
              setTimeout(() => {
                $(inputElement).find(`input`).css({ width: setWidth });
              }, 0);
              break;
            case "dropdown_exact":
              inputElement = createDropDowns(searchItem);
            default:
              inputElement = null;
          }
          if (searchItem.searchType !== "dropdown_exact") {
            const label = $("<label>").text(Titlename).addClass("label");
            elementInput.append(label);
          }
          elementInput.append(inputElement);
          elementsAll.append(elementInput);
        }
    });
    elementsAll.append(elementBtn);
    spaceElement.append(elementsAll);
    getURL();
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
                let convertedValue = "";
                if (record[searchItem.searchTarget].type != "CHECK_BOX") {

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

      //------------------------Get space in App LiveStock-------------------------//
      if (event.type == 'app.record.edit.show' || event.type == 'app.record.edit.submit.success') {
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
        console.log(sortedSpaces);


        let storedRecords = JSON.parse(sessionStorage.getItem('kintoneRecords'));
        let storedDataSpace = JSON.parse(sessionStorage.getItem('dataspace'));

        if (storedDataSpace && storedDataSpace.length > 0) {
          storedDataSpace.forEach(item => {
            sortedSpaces.forEach(space => {
              let selectElement;
              console.log(item.spc)
              console.log(space.value)
              if (item.spc === space.value) {
                console.log(storedRecords);


                let filteredRecords = storedRecords.filter(rec => rec.type.value == item.kind);
                let blankElement = kintone.app.record.getSpaceElement(space.value);

                if (blankElement) {
                  let label = $('<div>', {
                    class: 'kintoneplugin-title',
                    html: item.name + (item.required ? '<span class="kintoneplugin-require">*</span>' : '')
                  });
                  let divMain = $('<div>', { class: 'custom-main' }).css({
                    display: 'flex',
                    flexDirection: 'column'
                  });
                  let containerDiv = $('<div>', { class: 'custom-container' }).css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  });;
                  let inputBox = $('<input>', {
                    type: 'number',
                    class: 'modern-input-box kintoneplugin-input-text',
                    min: '0'
                  }).css({
                    width: '50px',
                    hight: '50px'
                  });;
                  let dropdownOuter = $('<div>', { class: 'kintoneplugin-select-outer' }).css({
                    marginTop: '6px'
                  });
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
                  })

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
      }


      return event;
    });

})(jQuery, Sweetalert2_10.noConflict(true), kintone.$PLUGIN_ID);