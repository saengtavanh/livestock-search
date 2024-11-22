jQuery.noConflict();
(async function ($, PLUGIN_ID) {
  let CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID).config;
  if (!CONFIG) return;
  CONFIG = JSON.parse(kintone.plugin.app.getConfig(PLUGIN_ID).config);
//  get custom view
  async function getConditionView(GETVIEWS, viewId) {
    for (const key in GETVIEWS.views) {
      if (GETVIEWS.views.hasOwnProperty(key)) {
        let view = GETVIEWS.views[key];
        if (view.id == viewId) return view.filterCond;
      }
    }
    return "";
  }
  kintone.events.on("app.record.index.show", async (event) => {
    // get views from kintone app.
    let GETVIEWS = await kintone.api("/k/v1/app/views.json", "GET", {
      app: kintone.app.getId()
    });
    let SETCOLOR = CONFIG.colorSetting;
    let bokTermsGet = {};
    let bokTermsObject;
    let elements = document.querySelectorAll(".recordlist-edit-gaia");
    elements.forEach((element) => {
      element.remove();
    });
    const recordRows = document.querySelectorAll(".recordlist-row-gaia");
    recordRows.forEach((row) => {
      row.addEventListener(
        "dblclick",
        function (e) {
          e.stopImmediatePropagation();
          e.preventDefault();
        },
        true
      );
    });
    const urlObj = new URL(window.location.href);
    const bokTerms = urlObj.searchParams.get("bokTerms");
    const decodedBokTerms = decodeURIComponent(bokTerms).replace(/{|}/g, "");
    const result = {};
    decodedBokTerms.split(",").forEach((pair) => {
      const [key, value] = pair
        .split(":")
        .map((item) => item.trim().replace(/"/g, ""));
      result[key] = value;
    });
    const spaceEl = kintone.app.getHeaderMenuSpaceElement();
    if ($(spaceEl).find(".custom-space-el").length > 0) {
      return;
    }
    const spaceElement = $(spaceEl);
    const elementsAll = $("<div></div>").addClass("custom-space-el");
    //TODO: FunctionSearch-------------------------------------------------
    let searchProcess = async function (searchInfoList) {
      let query = await getValueConditionAndBuildQuery(searchInfoList, false);
      let queryEscape = encodeURIComponent(query);
      const newUrl = new URL(window.location.href);
      // Get the base URL with only the 'view' parameter
      const baseUrl = `${newUrl.origin}${newUrl.pathname}`;
      const currentUrlBase = baseUrl;
      if (bokTermsObject) {
        bokTermsGet = { ...bokTermsGet, ...bokTermsObject };
      }
      const bokTermsString = JSON.stringify(bokTermsGet);
      const bokTerms = encodeURIComponent(bokTermsString);
      let url =
        currentUrlBase + `?view=${event.viewId}${queryEscape ? "&query=" + queryEscape : ""}&bokTerms=${bokTerms}`;
      window.location.href = url;
    };
    let getValueConditionAndBuildQuery = async function (
      searchInfoList,
      dropDownChange
    ) {
      let viewCond = await getConditionView(GETVIEWS, event.viewId)
      let query = event.viewId == 20 ? "" : viewCond ? `(${viewCond})` : "";
      let searchContent = CONFIG.searchContent;
      let mergedBokTermsObject = {};

      searchInfoList.forEach((searchInfo) => {
        checkFieldForSearch = searchContent.filter((item) => item.groupName == searchInfo.groupName);
        if (checkFieldForSearch && checkFieldForSearch[0]?.fieldForSearch) {
          searchInfo["fieldForSearch"] = checkFieldForSearch[0].fieldForSearch;
        }

        searchInfo["fieldType"] = checkFieldForSearch[0].searchTarget.type;
        // Check type 
        switch (searchInfo.searchType.value) {
          case "initial":
            query += buildTextInitialQuery(searchInfo, query);
            break;
          case "patial":
            query += buildTextPartialQuery(searchInfo, query);
            break;
          case "exact":
            query += buildTextExactQuery(searchInfo, query);
            break;
          case "range":
            query += buildNumberRangeQuery(searchInfo, query);
            break;
          default:
            break;
        }
      });
      bokTermsObject = mergedBokTermsObject;
      return query;
    };
    function transformString(input) {
      let characters = input.split("");
      let transformed = "_, " + characters.join(",");
      return transformed;
    }
    function transformStringPartial(input) {
      let characters = input.split("");
      let transformed = characters.join(",");
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
          searchValue = transformStringPartial($(`#${replacedText}`).val());
          bokTermsGet[replacedText] = $(`#${replacedText}`).val();
        }
      }
      if (searchValue) {
        if (searchInfo.target_field.length > 1) {
          searchInfo.target_field.forEach((field) => {
            const isLastIndex = index === searchInfo.target_field.length - 1;
            if (queryChild) {
              if (isLastIndex) {
                queryChild += `or (${field} like "${searchValue}"))`;
              } else {
                queryChild += `or (${field} like "${searchValue}")`;
              }
            } else {
              queryChild = `${query ? " and " : ""}((${field} like "${searchValue}") `;
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
          bokTermsGet[replacedText] = $(`#${replacedText}`).val();
      }
      if (searchInfo.fieldType === "DATE" || searchInfo.fieldType === "DATE_TIME") {
        if (searchValue) {
          if (searchInfo.target_field.length > 1) {
            searchInfo.target_field.forEach((field) => {
              if (queryChild) {
                queryChild += `or (${field} = "${searchValue}")`;
              } else {
                queryChild = `${query ? " and " : ""}(${field} = "${searchValue}") `;
              }
            })
          } else if ((searchInfo.target_field.length = 1)) {
            queryChild = `${query ? " and " : ""}(${searchInfo.target_field} = "${searchValue}")`;
  
          }
          return queryChild;
        }
      } else {
        if (searchValue) {
          if (searchInfo.target_field.length > 1) {
            searchInfo.target_field.forEach((field) => {
              if (queryChild) {
                queryChild += `or (${field} in ("${searchValue}"))`;
              } else {
                queryChild = `${query ? " and " : ""}(${field} in ("${searchValue}")) `;
              }
            })
          } else if ((searchInfo.target_field.length = 1)) {
            queryChild = `${query ? " and " : ""}(${searchInfo.target_field} in ("${searchValue}"))`;
          }
          return queryChild;
        }
      }
      return "";
    };
    let buildNumberExactQuery = function (searchInfo, query) {
      let replacedText = searchInfo.groupName.replace(/\s+/g, "_");
      let queryChild;
      let searchValue;

      if ($(`#${replacedText}`).length) {
        searchValue = $(`#${replacedText}`).val();
        if (searchValue) {
          searchValue = $(`#${replacedText}`).val();
          bokTermsGet[replacedText] = $(`#${replacedText}`).val();
        }
      }

      if (searchValue) {
        if (searchInfo.target_field.length > 1) {
          searchInfo.target_field.forEach((field, index) => {
            const isLastIndex = index === searchInfo.target_field.length - 1;

            if (queryChild) {
              if (isLastIndex) {
                queryChild += `or (${field} = "${searchValue}"))`
              } else {
                queryChild += `or (${field} = "${searchValue}")`
              }
            } else {
              queryChild = `${query ? " and " : ""}((${field} = "${searchValue}") `;
            }
          })
        } else if ((searchInfo.target_field.length = 1)) {
          queryChild = `${query ? " and " : ""}(${searchInfo.target_field} = "${searchValue}")`;
        }
        return queryChild;
      }
      return '';
    };
    let buildNumberRangeQuery = function (searchInfo, query) {
      let queryChild = "";
      let replacedText = searchInfo.groupName.replace(/\s+/g, "_");
      const startValue = $(`#${replacedText}_start`).val();
      const endValue = $(`#${replacedText}_end`).val();

      if (searchInfo.target_field > 1) {
        searchInfo.target_field.forEach((field) => {
          if (startValue && endValue == '') {
            bokTermsGet[`${replacedText}_start`] = $(`#${replacedText}_start`).val();
            queryChild += queryChild ? `${query && !queryChild ? " and " : ""}` + " or (" + field + ' ' + ">=" + ' "' + startValue + '"' + "))" : "((" + field + ' ' + ">=" + ' "' + startValue + '"' + ")";
          } else if (endValue && startValue == '') {
            bokTermsGet[`${replacedText}_end`] = $(`#${replacedText}_end`).val();
            queryChild += queryChild ? `${query && !queryChild ? " and " : ""}` + " or (" + field + ' ' + "<=" + ' "' + endValue + '"' + "))" : "((" + field + ' ' + "<=" + ' "' + endValue + '"' + ")";
          } else if (startValue && endValue) {
            bokTermsGet[`${replacedText}_start`] = $(`#${replacedText}_start`).val();
            bokTermsGet[`${replacedText}_end`] = $(`#${replacedText}_end`).val();
            queryChild += queryChild ? " or ((" + field + ' ' + ">=" + ' "' + startValue + '")' + " and (" + field + ' ' + "<=" + ' "' + endValue + '"' + "))" :
              "((" + field + ' ' + ">=" + ' "' + startValue + '")' + " and (" + field + ' ' + "<=" + ' "' + endValue + '"' + "))";
          }
        });
      } else {
        if (startValue && endValue == '') {
          bokTermsGet[`${replacedText}_start`] = $(`#${replacedText}_start`).val();
          queryChild += queryChild ? `${query && !queryChild ? " and " : ""}` + " or (" + searchInfo.target_field[0] + ' ' + ">=" + ' "' + startValue + '"' + ")" : "(" + searchInfo.target_field[0] + ' ' + ">=" + ' "' + startValue + '"' + ")";
        } else if (endValue && startValue == '') {
          bokTermsGet[`${replacedText}_end`] = $(`#${replacedText}_end`).val();
          queryChild += queryChild ? `${query && !queryChild ? " and " : ""}` + " or (" + searchInfo.target_field[0] + ' ' + "<=" + ' "' + endValue + '"' + ")" : "(" + searchInfo.target_field[0] + ' ' + "<=" + ' "' + endValue + '"' + ")";
        } else if (startValue && endValue) {
          bokTermsGet[`${replacedText}_start`] = $(`#${replacedText}_start`).val();
          bokTermsGet[`${replacedText}_end`] = $(`#${replacedText}_end`).val();
          queryChild += queryChild ? " or ((" + searchInfo.target_field[0] + ' ' + ">=" + ' "' + startValue + '")' + " and (" + searchInfo.target_field[0] + ' ' + "<=" + ' "' + endValue + '"' + "))" :
            "((" + searchInfo.target_field[0] + ' ' + ">=" + ' "' + startValue + '")' + " and (" + searchInfo.target_field[0] + ' ' + "<=" + ' "' + endValue + '"' + "))";
        }
      }
      let queryFinal;
      if (queryChild) {
        queryFinal = `${query ? " and " : ""}` + queryChild;
      } else {
        return "";
      }
      return queryFinal;
    };
    //TODO: CreateElement
    // ========================
    function createTextInput(searchType, groupName, width) {
      let initialText = groupName.replace(/\s+/g, "_");
      const inputElement = $("<input>", {
        type: searchType,
        class: "kintoneplugin-input-text",
        "data-serach-type": searchType,
        id: initialText,
      });
      inputElement.css("width", width);

      if (result[initialText]) {
        inputElement.val(result[initialText]);
      }
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
      result[`${initialNumber}`] ? InputNumber.val(result[`${initialNumber}`]) : "";
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
      });
      // set css
      start.css("width", width);
      const end = $("<input>", {
        type: "number",
        class: "kintoneplugin-input-text",
        "data-search-type": searchType,
        id: `${NumberRange}_end`,
      });
      // set css
      end.css("width", width);
      result[`${NumberRange}_start`]
        ? start.val(result[`${NumberRange}_start`])
        : "";
      result[`${NumberRange}_end`] ? end.val(result[`${NumberRange}_end`]) : "";
      const separator = $("<span>⁓</span>").addClass("separatornumber");
      return wrapper.append(start, separator, end);
    }
    function createDateInput(searchType, groupName) {
      let dateInput = groupName.replace(/\s+/g, "_");
      const datePicker = new Kuc.DatePicker({
        requiredIcon: true,
        language: "auto",
        className: "options-class-date",
        id: dateInput,
        visible: true,
        disabled: false,
        value: result[`${dateInput}`] ? result[`${dateInput}`] : "",
      });
      datePicker.setAttribute("data-search-type", searchType);
      return datePicker;
    }
    function createDateRangeInput(searchType, groupName) {
      let dateRange = groupName.replace(/\s+/g, "_");
      const datePickerSatrt = new Kuc.DatePicker({
        requiredIcon: true,
        language: "auto",
        className: "options-class-date",
        id: `${dateRange}_start`,
        visible: true,
        disabled: false,
        value: result[`${dateRange}_start`] ? result[`${dateRange}_start`] : "",
      });
      datePickerSatrt.setAttribute("data-search-type", searchType);
      const datePickerEnd = new Kuc.DatePicker({
        requiredIcon: true,
        language: "auto",
        className: "options-class-date",
        id: `${dateRange}_end`,
        visible: true,
        disabled: false,
        value: result[`${dateRange}_end`] ? result[`${dateRange}_end`] : "",
      });
      datePickerEnd.setAttribute("data-search-type", searchType);
      result[`${dateRange}_start`]
        ? $(`#${dateRange}_start`).val(result[`${dateRange}_start`])
        : "";
      result[`${dateRange}_end`]
        ? $(`#${dateRange}_end`).val(result[`${dateRange}_end`])
        : "";
      const separator = $("<span>⁓</span>").addClass("separator-datepicker");
      const wrapper = $("<div></div>").addClass("wrapper-datepiker");
      wrapper.append(datePickerSatrt).append(separator).append(datePickerEnd);
      return wrapper;
    }
    // Create action buttons
    function createButton(text, callback) {
      return $("<button>")
        .text(text)
        .addClass("kintoneplugin-button-dialog-ok")
        .css({
          background: SETCOLOR.buttonColor,
          color: SETCOLOR.buttonTextColor,
        })
        .on("click", callback);
    }
    const searchButton = createButton("検索", () => {
      let searchInfoList = CONFIG.groupSetting;
      searchProcess(searchInfoList);
    });
    $(searchButton).addClass("btn-search");
    const clearButton = createButton("C", () => {
      let bokTermObj = {};
      CONFIG.groupSetting.forEach((searchItem) => {
        let getIdElement = searchItem.groupName.replace(/\s+/g, "_");
        const getId = $(`#${getIdElement}`);
        if (getId.hasClass("kintoneplugin-dropdown")) {
          const dropdownId = getId.attr("id");
          const labelValue = getId
            .closest(".search-item")
            .find(".custom-dropdownTitle")
            .text()
            .trim();
          if (dropdownId) {
            bokTermObj[dropdownId] = {
              value: "",
              active: labelValue,
            };
          }
        }
      });
      const url = new URL(window.location.href);
      // Get the base URL with only the 'view' parameter
      const baseUrl = `${url.origin}${url.pathname}`;
      const currentUrlBase = baseUrl;
      const mergedBokTerms = encodeURIComponent(JSON.stringify(bokTermObj));
      const updatedUrl = `${currentUrlBase}?view=${event.viewId}&bokTerms=${mergedBokTerms}`;
      window.location.href = updatedUrl;
    });
    const elementBtn = $('<div class="element-button"></div>').append(
      searchButton,
      clearButton
    );
    //TODO: Create Function-------------------------------------------------------------------------
    CONFIG.groupSetting.forEach((searchItem) => {
      let searchType = searchItem.searchType.value;
      const { groupName, nameMarker } = searchItem;
      let setSearchTarget = [];
      let Titlename;
      let types;
      let afterFilter = CONFIG.searchContent.filter(
        (searchItem) => searchItem.groupName == groupName
      );
      afterFilter.forEach((searchItemTarget) => {
        types = searchItemTarget.searchTarget.type;
        Titlename = nameMarker ? nameMarker : searchItemTarget.searchName;
        setSearchTarget.push(searchItemTarget.fieldForSearch != "-----" ? searchItemTarget.fieldForSearch : searchItemTarget.searchTarget.code);
      });
      let matchResult = searchItem.searchLength
        .replace(/\s/g, "")
        .match(/(\d+)(rem|px|%)/i);
      let setWidth = matchResult ? `${matchResult[1]}${matchResult[2]}` : "5rem";
      if (afterFilter.length >= 1) {
        searchItem["target_field"] = setSearchTarget;
        const elementInput = $("<div></div>").addClass("search-item").css({
          color: SETCOLOR.titleColor,
        });
        let inputElement;
        switch (types) {
          case "SINGLE_LINE_TEXT":
          case "MULTI_LINE_TEXT":
            if (searchType === "initial") {
              inputElement = createTextInput(searchType, groupName, setWidth);
            }else if (searchType === "patial") {
              inputElement = createTextInput(searchType, groupName, setWidth);
            }
            break;
          case "NUMBER":
          case "CALC":
            if (searchType === "exact") {
              inputElement = createTextNumberInput(searchType, groupName, setWidth);
            } else if (searchType === "range") {
              inputElement = createNumberRangeInput(searchType, groupName, setWidth);
            }
            break;
          case "DATE":
          case "DATE_TIME":
            if (searchType === "exact") {
              inputElement = createDateInput(searchType, groupName, setWidth);
              setTimeout(() => {
                $(inputElement).find(`input`).css({ width: setWidth });
              }, 0);
            } else if (searchType === "range") {
              inputElement = createDateRangeInput(
                searchType,
                groupName,
                searchItem
              );
              setTimeout(() => {
                $(inputElement).find(`input`).css({ width: setWidth });
              }, 0);
            }
            break;
          case "CHECK_BOX":
          case "DROP_DOWN":
          case "RADIO_BUTTON":
          case "CODE_MASRTER":
            if (searchType === "exact") {
              inputElement = createTextInput(searchType, groupName, setWidth);
            }
            break;
          default:
            inputElement = null;
        }
          const label = $("<label>").text(Titlename).addClass("label");
          elementInput.append(label);
        elementInput.append(inputElement);
        elementsAll.append(elementInput);
      }
    });
    elementsAll.append(elementBtn);
    spaceElement.append(elementsAll);
    // getURL();
  });
  kintone.events.on(
    [
      "app.record.edit.show",
      "app.record.create.show",
      "app.record.create.submit",
      "app.record.edit.submit.success",
      "app.record.detail.show",
    ],
    async (event) => {
      let record = event.record;
      let updateRecord = {};
      for (const searchItem of CONFIG.searchContent) {
        for (const item of CONFIG.groupSetting) {
          if (item.groupName == searchItem.groupName) {            
            if (
              item.searchType.value == "initial" ||
              item.searchType.value == "patial"
            ) {
              kintone.app.record.setFieldShown(
                searchItem.fieldForSearch,
                false
              );
              let targetValue = record[searchItem.searchTarget.code].value;
                let convertedValue = "";
                if (targetValue == "" || targetValue == undefined) {
                  convertedValue = "";
                } else {
                  switch (item.searchType.value) {
                    case "initial":
                      convertedValue = `_,${targetValue.split("").join(",")}`;
                      break;
                    case "patial":
                      convertedValue = `${targetValue.split("").join(",")}`;
                      break;
                    default:
                      break;
                  }
                }
                updateRecord[searchItem.fieldForSearch] = {
                  value: convertedValue,
                };
                
                if (
                  searchItem.fieldForSearch !== "-----"
                ) {
                  record[searchItem.fieldForSearch].value = convertedValue;
                }
            }
          }
        }
      }
      if (
        event.type == "app.record.create.submit" ||
        event.type == "app.record.edit.submit.success"
      ) {
        let body = {
          app: kintone.app.getId(),
          records: [
            {
              id: kintone.app.record.getId(),
              record: updateRecord,
            },
          ],
        };
        try {
          await kintone.api(
            kintone.api.url("/k/v1/records.json", true),
            "PUT",
            body
          );
        } catch (error) {
          console.error(error);
        }
      }
      //------------------------Get space in App LiveStock-------------------------//
      if (
        event.type == "app.record.edit.show" ||
        event.type == "app.record.edit.submit.success"
      ) {
        let GETSPACE = await kintone.api(
          "/k/v1/preview/app/form/layout.json",
          "GET",
          {
            app: kintone.app.getId(),
          }
        );
        let SPACE = GETSPACE.layout.reduce((setSpace, layoutFromApp) => {
          if (layoutFromApp.type === "GROUP") {
            layoutFromApp.layout.forEach((layoutItem) => {
              layoutItem.fields.forEach((field) => {
                if (field.type === "SPACER") {
                  setSpace.push({
                    type: "space",
                    value: field.elementId,
                  });
                }
              });
            });
          } else {
            layoutFromApp.fields.forEach((field) => {
              if (field.type === "SPACER") {
                setSpace.push({
                  type: "space",
                  value: field.elementId,
                });
              }
            });
          }
          return setSpace;
        }, []);
        let sortedSpaces = SPACE.sort((a, b) => {
          return a.value.localeCompare(b.value);
        });
        let storedRecords = JSON.parse(
          sessionStorage.getItem("kintoneRecords")
        );
        let storedDataSpace = JSON.parse(sessionStorage.getItem("dataspace"));
        if (storedDataSpace && storedDataSpace.length > 0) {
          storedDataSpace.forEach((item) => {
            sortedSpaces.forEach((space) => {
              let selectElement;
              if (item.spc === space.value) {
                let filteredRecords = storedRecords.filter(
                  (rec) => rec.type.value == item.kind
                );
                let blankElement = kintone.app.record.getSpaceElement(
                  space.value
                );
                if (blankElement) {
                  let label = $("<div>", {
                    class: "kintoneplugin-title",
                    html:
                      item.name +
                      (item.required
                        ? '<span class="kintoneplugin-require">*</span>'
                        : ""),
                  });
                  let divMain = $("<div>", { class: "custom-main" }).css({
                    display: "flex",
                    flexDirection: "column",
                  });
                  let containerDiv = $("<div>", {
                    class: "custom-container",
                  }).css({
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  });
                  let inputBox = $("<input>", {
                    type: "number",
                    class: "modern-input-box kintoneplugin-input-text",
                    min: "0",
                  }).css({
                    width: "50px",
                    hight: "50px",
                  });
                  let dropdownOuter = $("<div>", {
                    class: "kintoneplugin-select-outer",
                  }).css({
                    marginTop: "6px",
                  });
                  let dropdown = $("<div>", { class: "kintoneplugin-select" });
                  selectElement = $("<select>");
                  selectElement.append(
                    $("<option>").attr("value", "-----").text("-----")
                  );
                  // Populate dropdown with stored records
                  if (filteredRecords.length > 0) {
                    filteredRecords.forEach((record) => {
                      selectElement.append(
                        $("<option>")
                          .attr("value", record.name.value)
                          .attr("code", record.code.value)
                          .attr("types", record.type.value)
                          .text(record.name.value)
                      );
                    });
                  }
                  inputBox.on("input", function () {
                    let inputValue = $(this)
                      .val()
                      .replace(/[^0-9]/g, ""); // Keep only numbers
                    if (inputValue.startsWith("0") && inputValue.length > 1) {
                      inputValue = inputValue.replace(/^0+/, ""); // Remove leading zeros
                    }
                    if (filteredRecords.length > 0) {
                      let matchFound = false;
                      filteredRecords.forEach((record) => {
                        if (record.code.value === inputValue) {
                          let existingOption = selectElement.find(
                            `option[value="${record.name.value}"]`
                          );
                          let selectedType = existingOption.attr("types");
                          let selectedCode = existingOption.attr("code");
                          let selectedValue = existingOption.attr("value");
                          if (existingOption.length > 0) {
                            existingOption.prop("selected", true);
                            setField(selectedCode, selectedValue, selectedType);
                          } else {
                            let newOption = $("<option>")
                              .attr("value", record.name.value)
                              .text(record.name.value);
                            selectElement.append(newOption);
                            newOption.prop("selected", true);
                          }
                          matchFound = true;
                        }
                      });

                      if (!matchFound) {
                        let defaultOption = selectElement.find(
                          'option[value="-----"]'
                        );
                        if (defaultOption.length > 0) {
                          defaultOption.prop("selected", true);
                        } else {
                          let newDefaultOption = $("<option>")
                            .attr("value", "-----")
                            .text("-----");
                          selectElement.append(newDefaultOption);
                          newDefaultOption.prop("selected", true);
                        }
                      }
                    }
                  });
                  selectElement.on("change", function (e) {
                    const selectedOption = $(e.target).find("option:selected");
                    let nearestInput = $(this)
                      .closest(".custom-container")
                      .find(".kintoneplugin-input-text");
                    nearestInput.val("");
                    const selectedCode = selectedOption.attr("code");
                    const selectedValue = selectedOption.attr("value");
                    const selectedType = selectedOption.attr("types");
                    nearestInput.val(selectedCode);
                    setField(selectedCode, selectedValue, selectedType);
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
                    $(selectElement)
                      .find("option")
                      .each(function (optionIndex, optionElement) {
                        const codeValue = $(optionElement).attr("code");
                        const typeValue = $(optionElement).attr("types");
                        const optionValue = $(optionElement).val();
                        $.each(record, function (fieldKey, fieldValue) {
                          if (typeValue === fieldKey) {
                            const fieldValueContent = fieldValue.value;
                            if (fieldValueContent === optionValue) {
                              $(optionElement).prop("selected", true);
                              const correspondingInputBox = inputBox.eq(index);
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
    }
  );
})(jQuery, kintone.$PLUGIN_ID);
