jQuery.noConflict();
(async function ($, PLUGIN_ID) {
  let CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID).config;
  if (!CONFIG) return;

  CONFIG = JSON.parse(kintone.plugin.app.getConfig(PLUGIN_ID).config);
  async function setSessionStorageItems(configSettings) {
    for (const setting of configSettings) {
      try {
        if (setting.appId !== "") {
          let codeField = setting.codeField
          let nameField = setting.nameField
          const dataFromMaster = await window.RsComAPI.getRecords({
            app: setting.appId,
            query: setting.typeField,
          });
          const codeAndName = dataFromMaster.map((record) => ({
            code: record[codeField].value,
            name: record[nameField].value,
          }));


          const dataToStore = {
            AppId: setting.appId,
            ApiToken: setting.apiToken,
            codeAndName: codeAndName,
            condition: setting.typeField,
          };
          
            sessionStorage.setItem(
              `bokMst${setting.masterId}`,
              JSON.stringify(dataToStore)
            );
         
        } else {
          sessionStorage.setItem(
            `bokMst${setting.masterId}`,
            JSON.stringify([])
          );
        }
      } catch (error) {
        return error;
      }
    }
  }

  async function getCodeMasterData() {
    let CODEMASTER = [];

    for (const key of Array.from({ length: sessionStorage.length }, (_, i) =>
      sessionStorage.key(i)
    )) {
      const numberId = key.match(/\d+/);

      if (numberId) {
        const numericKey = numberId[0];
        const data = sessionStorage.getItem(key);
        const CodeMasterData = JSON.parse(data);
        CODEMASTER.push({ numericKey, ...CodeMasterData });
      }
    }
    return CODEMASTER;
  }

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
      app: kintone.app.getId(),
    });
    // get field form SCHEMA
    let DETFIELDlIST = cybozu.data.page.SCHEMA_DATA;
    await setSessionStorageItems(CONFIG.codeMasterSetting);
    const CODEMASTER = await getCodeMasterData();
    let SETCOLOR = CONFIG.colorSetting;
    let queryForDropdow = "";
    let bokTermsGet = {};
    let bokTermsObject;

    const records = await window.RsComAPI.getRecords({
      app: kintone.app.getId(),
    });

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
    let bokTermForExact = {};
    const urlObjForExact = new URL(window.location.href);
    const bokTermsForExact = urlObjForExact.searchParams.get("bokTerms");
    if (bokTermsForExact != null) {
      const decodedBokTermsForExact = decodeURIComponent(bokTermsForExact).replace(/(^\{|\}$)/g, "");
      const cleanBokTermsForExact = decodedBokTermsForExact.replace(/[^{}\[\]":,0-9a-zA-Z._-\s\u3000-\u303F\u3040-\u30FF\u4E00-\u9FFF\uFF00-\uFFEF]/g, "");
      const wrappedBokTermsForExact = `{${cleanBokTermsForExact}}`;
      bokTermForExact = JSON.parse(wrappedBokTermsForExact);
    }



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
      let query = await getValueConditionAndBuildQuery(searchInfoList, true);
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
      let url = currentUrlBase + `?view=${event.viewId}${queryEscape ? "&query=" + queryEscape : ""}&bokTerms=${bokTerms}`;

      window.location.href = url;
    };

    let getValueConditionAndBuildQuery = async function (
      searchInfoList,
      dropDownChange
    ) {
      let viewCond = await getConditionView(GETVIEWS, event.viewId);
      let query = event.viewId == 20 ? "" : viewCond ? `(${viewCond})` : "";
      let queryChild = "";
      let searchContent = CONFIG.searchContent;
      let mergedBokTermsObject = {};

      searchInfoList.forEach((searchInfo) => {
        let groupNameSlit = searchInfo.groupName.replace(/\s+/g, "_");
        if ($(`#${groupNameSlit}`).is("select")) {
          let selectedValue = $(`#${groupNameSlit} option:selected`).val();
          let dropdownId = groupNameSlit;
          let labelText = $(`#${groupNameSlit}`).closest('.search-item').find('label').text();
          if ($(`#${groupNameSlit}`).attr("searchName")) {
            labelText = $(`#${groupNameSlit}`).attr("searchName")
          }
          if (selectedValue) {
            mergedBokTermsObject = {
              ...mergedBokTermsObject,
              ...createBokTermsObject(selectedValue, dropdownId, labelText),
            };



            if (!dropDownChange) {
              if (
                searchInfo.groupName == groupNameSlit.replace(/_/g, " ") &&
                searchInfo.nameMarker &&
                searchInfo.searchType.value == "exact"
              ) {
                if (searchInfo.target_field.length > 1) {
                  searchInfo.target_field.forEach((fieldCode, index) => {
                    const isLastIndex =
                      index === searchInfo.target_field.length - 1;

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
              } else if (
                searchInfo.groupName == groupNameSlit.replace(/_/g, " ") &&
                searchInfo.nameMarker == "" &&
                searchInfo.searchType.value == "exact"
              ) {
                let getTargetField = searchContent.filter(
                  (item) => item.searchName == labelText
                );
                searchInfo["fieldType"] = getTargetField[0].searchTarget.type;
                query += `${query ? " and " : ""}(${getTargetField[0].searchTarget.code} in ("${selectedValue}"))`;
              }
            }
          } else {
            mergedBokTermsObject = {
              ...mergedBokTermsObject,
              ...createBokTermsObject("-----", dropdownId, labelText),
            };
          }
        } else {
          checkFieldForSearch = searchContent.filter(
            (item) => item.groupName == searchInfo.groupName
          );

          if (checkFieldForSearch && checkFieldForSearch[0]?.fieldForSearch) {
            searchInfo["fieldForSearch"] = checkFieldForSearch[0].fieldForSearch;
            searchInfo["fieldType"] = checkFieldForSearch[0].searchTarget.type;
          }

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
      let indexForSearch = 0;

      if ($(`#${replacedText}`).length) {
        indexForSearch = ($(`#${replacedText}`)).attr("indexforinitail");
        if ($(`#${replacedText}`).val()) {
          searchValue = transformString($(`#${replacedText}`).val());
        }
      }

      if (searchValue) {
        if (searchInfo.target_field.length >= 1 && searchInfo.nameMarker != "") {
          let active = `${$(`#${replacedText}`).attr("searchName")}`;
          bokTermsGet = { ...bokTermsGet, ...createBokTermsObject($(`#${replacedText}`).val(), replacedText, active) }
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
          } else {
            queryChild = `${query ? " and " : ""}(${searchInfo.target_field[0]} like "${searchValue}") `;
          }
        } else {
          let active = `${$(`#${replacedText}`).attr("searchName")}`;
          bokTermsGet = { ...bokTermsGet, ...createBokTermsObject($(`#${replacedText}`).val(), replacedText, active) }
          queryChild = `${query ? " and " : ""}(${searchInfo.target_field[indexForSearch]} like "${searchValue}")`;
        }
        return queryChild;
      } else {
        let active = `${$(`#${replacedText}`).attr("searchName")}`;
          bokTermsGet = { ...bokTermsGet, ...createBokTermsObject("", replacedText, active) }
      }
      return "";
    };

    let buildTextPartialQuery = function (searchInfo, query) {
      let replacedText = searchInfo.groupName.replace(/\s+/g, "_");
      let queryChild;
      let searchValue;
      let indexForSearch = 0;
      
      
      if ($(`#${replacedText}`).length) {
        indexForSearch = ($(`#${replacedText}`)).attr("indexforinitail");
        let getSearchCon = CONFIG.searchContent.filter((field) => field.groupName == searchInfo.groupName)
                                               .filter((subFilter) => subFilter.fieldForSearch == searchInfo.target_field[indexForSearch]);
        
        if ($(`#${replacedText}`).val() && getSearchCon.length > 0) {
          searchValue = transformStringPartial($(`#${replacedText}`).val());
        } else {
          searchValue = $(`#${replacedText}`).val();
        }
      }

      if (searchValue) {
        let getSearchConForCheck = [];
        if (searchInfo.target_field.length >= 1 && searchInfo.nameMarker != "") {
          let active = `${$(`#${replacedText}`).attr("searchName")}`;
          bokTermsGet = { ...bokTermsGet, ...createBokTermsObject($(`#${replacedText}`).val(), replacedText, active) }
          if (searchInfo.target_field.length > 1) {
            searchInfo.target_field.forEach((field, index) => {
              getSearchConForCheck = CONFIG.searchContent.filter((field) => field.groupName == searchInfo.groupName)
                                               .filter((subFilter) => subFilter.fieldForSearch == field);
              const isLastIndex = index === searchInfo.target_field.length - 1;
              if (queryChild) {
                if (isLastIndex) {
                  queryChild += `or (${field} like "${getSearchConForCheck.length > 0 ? searchValue : $(`#${replacedText}`).val()}"))`;
                } else {
                  queryChild += `or (${field} like "${getSearchConForCheck.length > 0 ? searchValue : $(`#${replacedText}`).val()}")`;
                }
              } else {
                queryChild = `${query ? " and " : ""}((${field} like "${getSearchConForCheck.length > 0 ? searchValue : $(`#${replacedText}`).val()}") `;
              }
            });
          } else {
            queryChild = `${query ? " and " : ""}(${searchInfo.target_field[0]} like "${searchValue}")`;
          }
        } else {
          let active = `${$(`#${replacedText}`).attr("searchName")}`;
          bokTermsGet = { ...bokTermsGet, ...createBokTermsObject($(`#${replacedText}`).val(), replacedText, active) }
          queryChild = `${query ? " and " : ""}(${searchInfo.target_field[indexForSearch]} like "${searchValue}")`;
        }

        return queryChild;
      } else {
        let active = `${$(`#${replacedText}`).attr("searchName")}`;
          bokTermsGet = { ...bokTermsGet, ...createBokTermsObject("", replacedText, active) }
      }
      return "";
    };

    let buildTextExactQuery = function (searchInfo, query) {
      let replacedText = searchInfo.groupName.replace(/\s+/g, "_");
      let queryChild = "";
      let searchValue;
      let getValFromAttribute = "";

      if ($(`#${replacedText}`).length) {
        searchValue = $(`#${replacedText}`).val();
        getValFromAttribute = $(`#${replacedText}`).attr("typefordropdown");

        if (!$(`#${replacedText}`).is("select")) {
          if (getValFromAttribute != "" && searchInfo.nameMarker == "") {
            if (searchValue) {
              if ($(`#${replacedText}`).attr("dataType") != "DATE" && $(`#${replacedText}`).attr("dataType") != "DATETIME" && $(`#${replacedText}`).attr("dataType") == undefined) {
                let active = `${$(`#${replacedText}`).attr("searchName")}`;
                bokTermsGet = { ...bokTermsGet, ...createBokTermsObject(searchValue, replacedText, active) }
                queryChild = `${query ? " and " : ""}(${getValFromAttribute} in ("${searchValue}"))`;
                return queryChild;
              } else {
                let valueForDateTime = ""
                if ($(`#${replacedText}`).attr("dataType") == "DATETIME") {
                  valueForDateTime = searchValue + "T15:00:00.00Z";
                } else {
                  valueForDateTime = searchValue;
                }
                let active = `${$(`#${replacedText}`).attr("searchName")}`;
                bokTermsGet = { ...bokTermsGet, ...createBokTermsObject(searchValue, replacedText, active) }
                queryChild = `${query ? " and " : ""}(${getValFromAttribute} = "${valueForDateTime}")`;
                return queryChild;
              }
            } else {
              let active = `${$(`#${replacedText}`).attr("searchName")}`;
                bokTermsGet = { ...bokTermsGet, ...createBokTermsObject("", replacedText, active) }
            }
          } else {
            if (searchValue) {
              bokTermsGet[replacedText] = searchValue;
              if ($(`#${replacedText}`).attr("dataType") != "DATE" && $(`#${replacedText}`).attr("dataType") != "DATETIME" && $(`#${replacedText}`).attr("dataType") == undefined) {
                if (searchInfo.target_field.length > 1) {
                  searchInfo.target_field.forEach((field, index) => {
                    const isLastIndex = index === searchInfo.target_field.length - 1;
                    if (queryChild) {
                      if (isLastIndex) {
                        queryChild += `or (${field} in ("${searchValue}")))`;
                      } else {
                        queryChild += `or (${field} in ("${searchValue}"))`;
                      } 
                    } else {
                      queryChild = `${query ? " and " : ""}((${field} in ("${searchValue}")) `;
                    }
                  });
                } else if ((searchInfo.target_field.length = 1)) {
                  queryChild = `${query ? " and " : ""}(${searchInfo.target_field[0]} in ("${searchValue}")`;
                }
                return queryChild;
              } else {
                let valueForDateTime = ""
                if ($(`#${replacedText}`).attr("dataType") == "DATETIME") {
                  valueForDateTime = searchValue + "T15:00:00.00Z";
                } else {
                  valueForDateTime = searchValue;
                }
                if (searchInfo.target_field.length > 1) {
                  searchInfo.target_field.forEach((field, index) => {
                    const isLastIndex = index === searchInfo.target_field.length - 1;
                    if (queryChild) {
                      if (isLastIndex) {
                        queryChild += `or (${field} = "${valueForDateTime}"))`;
                      } else {
                        queryChild += `or (${field} = "${valueForDateTime}")`;
                      }
                    } else {
                      queryChild = `${query ? " and " : ""}((${field} = "${valueForDateTime}") `;
                    }
                  });
                } else if ((searchInfo.target_field.length = 1)) {
                  queryChild = `${query ? " and " : ""}(${searchInfo.target_field[0]} = "${valueForDateTime}")`;
                }
                return queryChild;
              }
            }
          }
        }
      }
      if (searchInfo.fieldType !== "CHECK_BOX" && searchInfo.fieldType !== "DROP_DOWN" && searchInfo.fieldType !== "RADIO_BUTTON" && searchInfo.fieldType !== undefined) {
        if (searchInfo.fieldType === "DATE" || searchInfo.fieldType === "DATETIME") {
          if (searchValue) {
            let valueForDateTime = ""
            if (searchInfo.fieldType === "DATETIME") {
              valueForDateTime = searchValue + "T15:00:00.00Z";
            } else {
              valueForDateTime = searchValue;
            }
            bokTermsGet[replacedText] = searchValue;
            if (searchInfo.target_field.length > 1) {
              searchInfo.target_field.forEach((field, index) => {
                const isLastIndex = index === field.target_field.length - 1;
                if (queryChild) {
                  if (isLastIndex) {
                    queryChild += `or (${field} = "${valueForDateTime}"))`;
                  } else {
                    queryChild += `or (${field} = "${valueForDateTime}")`;
                  }
                } else {
                  queryChild = `${query ? " and " : ""}((${field} = "${valueForDateTime}") `;
                }
              });
            } else if ((searchInfo.target_field.length = 1)) {
              queryChild = `${query ? " and " : ""}(${searchInfo.target_field[0]} = "${valueForDateTime}")`;
            }
            return queryChild;
          }
        } else {
          if (searchValue) {
            bokTermsGet[replacedText] = searchValue
            if (searchInfo.target_field.length > 1) {
              searchInfo.target_field.forEach((field, index) => {
                const isLastIndex = index === searchInfo.target_field.length - 1;
                if (queryChild) {
                  if (isLastIndex) {
                    queryChild += ` or (${field} in ("${searchValue}")))`;
                  }
                  queryChild += ` or (${field} in ("${searchValue}"))`;
                } else {
                  queryChild = `${query ? " and " : ""}((${field} in ("${searchValue}"))`;
                }
              });
            } else if ((searchInfo.target_field.length = 1)) {
              queryChild = `${query ? " and " : ""}(${searchInfo.target_field[0]} in ("${searchValue}"))`;
            }
            return queryChild;
          } 
        }
      }

      return "";
    };

    let buildNumberRangeQuery = function (searchInfo, query) {
      let queryChild = "";
      let replacedText = searchInfo.groupName.replace(/\s+/g, "_");
      const startValue = $(`#${replacedText}_start`).val();
      const endValue = $(`#${replacedText}_end`).val();
      let getValFromAttribute = "";

      if (searchInfo.target_field.length >= 1 && searchInfo.nameMarker == "") {
        if (startValue && endValue == "") {
          let active = `${$(`#${replacedText}_start`).attr("searchName")}`;
          bokTermsGet = { ...bokTermsGet, ...createBokTermsObject(startValue, replacedText, active, "range", "") }
          getValFromAttribute = $(`#${replacedText}_start`).attr("typefordropdown");
          bokTermsGet[`${replacedText}_start`] = $(`#${replacedText}_start`).val();
          queryChild += queryChild ? `${query && !queryChild ? " and " : ""}` + " or (" + getValFromAttribute + " " + ">=" + ' "' + startValue + '"' + ")"
            : "(" + getValFromAttribute + " " + ">=" + ' "' + startValue + '"' + ")";
        } else if (endValue && startValue == "") {
          getValFromAttribute = $(`#${replacedText}_end`).attr("typefordropdown");
          let active = `${$(`#${replacedText}_start`).attr("searchName")}`;
          bokTermsGet = { ...bokTermsGet, ...createBokTermsObject("", replacedText, active, "range", endValue) }
          queryChild += queryChild ? `${query && !queryChild ? " and " : ""}` + " or (" + getValFromAttribute + " " + "<=" + ' "' + endValue + '"' + ")"
            : "(" + getValFromAttribute + " " + "<=" + ' "' + endValue + '"' + ")";
        } else if (startValue && endValue) {
          getValFromAttribute = $(`#${replacedText}_start`).attr("typefordropdown");
          let active = `${$(`#${replacedText}_start`).attr("searchName")}`;
          bokTermsGet = { ...bokTermsGet, ...createBokTermsObject(startValue, replacedText, active, "range", endValue) }
          queryChild += queryChild ? " or ((" + getValFromAttribute + " " + ">=" + ' "' + startValue + '")' + " and (" + getValFromAttribute + " " + "<=" + ' "' + endValue + '"' + "))"
            : "((" + getValFromAttribute + " " + ">=" + ' "' + startValue + '")' + " and (" + getValFromAttribute + " " + "<=" + ' "' + endValue + '"' + "))";
        } else {
          let active = `${$(`#${replacedText}_start`).attr("searchName")}`;
          bokTermsGet = { ...bokTermsGet, ...createBokTermsObject("", replacedText, active, "range", "") }
        }
      } else if (searchInfo.target_field.length >= 1 && searchInfo.nameMarker != "") {
        if (searchInfo.target_field.length > 1) {
          searchInfo.target_field.forEach((fieldCode, index) => {
            const isLastIndex = index === searchInfo.target_field.length - 1;

              if (startValue && endValue == "") {
                let active = `${$(`#${replacedText}_start`).attr("searchName")}`;
                bokTermsGet = { ...bokTermsGet, ...createBokTermsObject(startValue, replacedText, active, "range", "") }
                getValFromAttribute = $(`#${replacedText}_start`).attr("typefordropdown");
                bokTermsGet[`${replacedText}_start`] = $(`#${replacedText}_start`).val();
                if (isLastIndex) {
                  queryChild += queryChild ? `${query && !queryChild ? " and " : ""}` + " or (" + fieldCode + " " + ">=" + ' "' + startValue + '"' + "))"
                    : "(" + fieldCode + " " + ">=" + ' "' + startValue + '"' + ")";
                } else {
                  queryChild += queryChild ? `${query && !queryChild ? " and " : ""}` + " or (" + fieldCode + " " + ">=" + ' "' + startValue + '"' + ")"
                    : "(" + fieldCode + " " + ">=" + ' "' + startValue + '"' + ")";
                }
              } else if (endValue && startValue == "") {
                getValFromAttribute = $(`#${replacedText}_end`).attr("typefordropdown");
                let active = `${$(`#${replacedText}_start`).attr("searchName")}`;
                bokTermsGet = { ...bokTermsGet, ...createBokTermsObject("", replacedText, active, "range", endValue) }
                if (isLastIndex) {
                  queryChild += queryChild ? `${query && !queryChild ? " and " : ""}` + " or (" + fieldCode + " " + "<=" + ' "' + endValue + '"' + "))"
                    : "(" + fieldCode + " " + "<=" + ' "' + endValue + '"' + ")";
                  } else {
                  queryChild += queryChild ? `${query && !queryChild ? " and " : ""}` + " or (" + fieldCode + " " + "<=" + ' "' + endValue + '"' + ")"
                    : "(" + fieldCode + " " + "<=" + ' "' + endValue + '"' + ")";
                 }
              } else if (startValue && endValue) {
                getValFromAttribute = $(`#${replacedText}_start`).attr("typefordropdown");
                let active = `${$(`#${replacedText}_start`).attr("searchName")}`;
                bokTermsGet = { ...bokTermsGet, ...createBokTermsObject(startValue, replacedText, active, "range", endValue) }
                if (isLastIndex) {
                  queryChild += queryChild ? " or ((" + fieldCode + " " + ">=" + ' "' + startValue + '")' + " and (" + fieldCode + " " + "<=" + ' "' + endValue + '"' + ")))"
                  : "((" + fieldCode + " " + ">=" + ' "' + startValue + '")' + " and (" + fieldCode + " " + "<=" + ' "' + endValue + '"' + "))";
                } else {
                    queryChild += queryChild ? " or ((" + fieldCode + " " + ">=" + ' "' + startValue + '")' + " and (" + fieldCode + " " + "<=" + ' "' + endValue + '"' + "))"
                    : "((" + fieldCode + " " + ">=" + ' "' + startValue + '")' + " and (" + fieldCode + " " + "<=" + ' "' + endValue + '"' + "))";
                 }
              } else {
                let active = `${$(`#${replacedText}_start`).attr("searchName")}`;
                bokTermsGet = { ...bokTermsGet, ...createBokTermsObject("", replacedText, active, "range", "") }
              }
          });
        } else {
          queryChild = "((" + searchInfo.target_field[0] + " " + ">=" + ' "' + startValue + '")' + " and (" + searchInfo.target_field[0] + " " + "<=" + ' "' + endValue + '"' + "))";
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


    // Create dropdowns based on the configuration
    function createDropDowns(display, width) {
      let relatedContent = CONFIG.searchContent.filter((content) => content.groupName === display.groupName);
      // Only show content if `name_marker` is not empty
      if (display.nameMarker && relatedContent.length === 0) return;

      if (relatedContent.length > 1) {
        const dropDownTitle = $("<label>")
          .text(display.nameMarker ? display.nameMarker : relatedContent[0].searchName)
          .addClass("custom-dropdownTitle")
          .attr("forseach", display.groupName.replace(/\s+/g, "_"))
          .css({
            cursor: display.nameMarker == "" && relatedContent.length > 1 ? "pointer" : "default",
            color: SETCOLOR?.titleColor,
          })
          .on("click", function () {
            handleDropDownTitleClick(
              display,
              CONFIG,
              width,
              relatedContent,
              dropDownTitle,
              dropDown
            );
          });
        const dropDown = createExactDropDown(
          display,
          relatedContent[0].searchName,
          relatedContent[0],
          dropDownTitle
        );
        if (bokTermForExact[display.groupName.replace(/\s+/g, "_")] && relatedContent[0].searchName == bokTermForExact[display.groupName.replace(/\s+/g, "_")].active) {
          const optionExists = dropDown.find(`option[value="${bokTermForExact[display.groupName.replace(/\s+/g, "_")].value}"]`).length > 0;
          if (bokTermForExact[display.groupName.replace(/\s+/g, "_")].value == "-----") {
            dropDown.val("");
          } else {
            if (optionExists) {
              dropDown.val(bokTermForExact[display.groupName.replace(/\s+/g, "_")].value);
            } else {
              dropDown.append(
                $("<option>")
                  .text(bokTermForExact[display.groupName.replace(/\s+/g, "_")].value)
                  .val(bokTermForExact[display.groupName.replace(/\s+/g, "_")].value)
              );
              dropDown.val(bokTermForExact[display.groupName.replace(/\s+/g, "_")].value);
            }
  
          }
        }
        const DropdownAll = $("<div></div>")
          .addClass("search-item")
          .append(dropDownTitle, dropDown)
        elementsAll.append(DropdownAll);
      } else {
        let dropDown = "";
        const dropDownTitle = $("<label>")
        .text(display.nameMarker ? display.nameMarker : relatedContent[0].searchName)
        .addClass(display.nameMarker == "" ? "custom-dropdownTitle" : "label")
        .attr("forseach", display.groupName.replace(/\s+/g, "_"))
        .css({
          cursor: display.nameMarker == "" && relatedContent.length > 1 ? "pointer" : "default",
          color: SETCOLOR?.titleColor,
        })
        if (display.nameMarker == "" && relatedContent.length > 1) {
          dropDownTitle.on("click", function () {
            handleDropDownTitleClick(
              display,
              CONFIG,
              width,
              relatedContent,
              dropDownTitle,
              dropDown
            );
          });
        }
        dropDown = createDropDown(
         display,
         records,
         relatedContent[0],
         dropDownTitle
       );
       if (bokTermForExact[display.groupName.replace(/\s+/g, "_")] && relatedContent[0].searchName == bokTermForExact[display.groupName.replace(/\s+/g, "_")].active) {
        const optionExists = dropDown.find(`option[value="${bokTermForExact[display.groupName.replace(/\s+/g, "_")].value}"]`).length > 0;
        if (bokTermForExact[display.groupName.replace(/\s+/g, "_")].value == "-----") {
          dropDown.val("");
        } else {
          if (optionExists) {
            dropDown.val(bokTermForExact[display.groupName.replace(/\s+/g, "_")].value);
          } else {
            dropDown.append(
              $("<option>")
                .text(bokTermForExact[display.groupName.replace(/\s+/g, "_")].value)
                .val(bokTermForExact[display.groupName.replace(/\s+/g, "_")].value)
            );
            dropDown.val(bokTermForExact[display.groupName.replace(/\s+/g, "_")].value);
          }

        }
      }
        const DropdownAll = $("<div></div>")
          .addClass("search-item")
          .append(dropDownTitle, dropDown);
        elementsAll.append(DropdownAll);
      }
      
    }

    function handleDropDownTitleClick(
      display,
      CONFIG,
      width,
      relatedContent,
      dropDownTitle,
      dropDown
    ) {
      if (display.nameMarker === "") {
        const existingMenu = $(".custom-context-menu");
        if (existingMenu.length > 0) {
          existingMenu.remove();
        }
        // Filter items based on the group name
        const filteredItems = CONFIG.searchContent.filter((content) => content.groupName === display.groupName && !display.nameMarker);
        const customContextMenu = $("<div></div>")
          .addClass("custom-context-menu")
          .css({
            width: "150px",
            display: "flex",
            "flex-direction": "column",
            "align-items": "center",
            margin: "5px",
            padding: "10px",
            borderRadius: "5px",
            "background-color": "#f0f0f0",
            color: "#000",
            position: "absolute",
            zIndex: 1000,
          });

        // Position the pop-up to the left of the dropdown title
        const offset = dropDownTitle.offset();
        customContextMenu.css({
          top: offset.top + dropDownTitle.outerHeight() - 250,
          left: offset.left - customContextMenu.outerWidth() + 270,
        });

        // Dynamically create buttons using Kuc.Button for each item in the list
        filteredItems.forEach((item, index) => {
          const buttonLabel = item.searchName;
          const targetField = filteredItems[index].searchTarget;

          const hoverBtn = new Kuc.Button({
            text: buttonLabel,
            type: "normal",
            className: "class-btn-pop-up",
            id: targetField,
          });
          $(hoverBtn).css({
            margin: "5px 0",
            width: "100%",
          });

          $(hoverBtn).on("click", async () => {
            let selectedItem = filteredItems[index];
            let setWidth = "";
            dropDownTitle.text(selectedItem.searchName);
            let getWidth = CONFIG.groupSetting.filter((item) => item.groupName == selectedItem.groupName);
            let getSearchTypeFromGroup = getWidth[0].searchType.value;
            let matchResult = getWidth[0].searchLength
              .replace(/\s/g, "")
              .match(/(\d+)(rem|px|%)/i);
            setWidth = getWidth[0].searchLength != 0 ? `${matchResult[1]}${matchResult[2]}` : "5rem";


            let nameInputTitle;
            let codeMasterID = selectedItem.masterId;
            let typeInput = selectedItem.searchTarget.type;

            let groupNameForExact = selectedItem.groupName.replace(/\s+/g, "_");
            let dropdownId = `dropdown-from-${groupNameForExact}`;
            nameInputTitle = selectedItem.searchName;

            if (["CHECK_BOX", "DROP_DOWN", "RADIO_BUTTON"].includes(typeInput)) {
              $(".dropdown-from-" + groupNameForExact).remove();
              if ($(".dropdown-from-" + groupNameForExact).length != 0) {
                $(".dropdown-from-" + groupNameForExact).attr("id", selectedItem.groupName.replace(/\s+/g, "_"));
                $(".dropdown-from-" + groupNameForExact).attr("searchname", nameInputTitle);
                await updateDropDownOptions(
                  selectedItem,
                  filteredItems,
                  records,
                  dropdownId,
                  dropDown
                );
                // dropDownTitle.after(updateDropDown);
                $(".dropdown-from-" + groupNameForExact).show()
              } else {

                const dropDown = createExactDropDown(
                  selectedItem,
                  filteredItems[index].searchName,
                  filteredItems[index],
                  dropDownTitle
                );

                await updateDropDownOptions(
                  selectedItem,
                  filteredItems,
                  records,
                  dropdownId,
                  dropDown
                );
                dropDown.css("width", setWidth)
                dropDownTitle.after(dropDown);

              }

              if ($(".input-text-from-" + groupNameForExact)) {
                $(".input-text-from-" + groupNameForExact).attr("id", "");
                $(".input-text-from-" + groupNameForExact).val("");
                $(".input-text-from-" + groupNameForExact).hide();
              }

              if ($(".date-from-" + groupNameForExact)) {
                let selected = $(".date-from-" + groupNameForExact);
                $(selected).attr("id", "");
                $(selected).hide();
              }

              if ($(".input-number-from-" + groupNameForExact)) {
                $(".input-number-from-" + groupNameForExact).attr("id", "");
                $(".input-number-from-" + groupNameForExact).val("id", "");
                $(".input-number-from-" + groupNameForExact).hide();
              }

              // customContextMenu.remove();
            } else if (["SINGLE_LINE_TEXT", "MULTI_LINE_TEXT", "NUMBER"].includes(typeInput)) {
              if (codeMasterID !== "-----") {
                $(".dropdown-from-" + groupNameForExact).remove();
                if ($(".dropdown-from-" + groupNameForExact).length != 0) {
                  $(".dropdown-from-" + groupNameForExact).attr("id", selectedItem.groupName.replace(/\s+/g, "_"));
                  $(".dropdown-from-" + groupNameForExact).attr("searchname", nameInputTitle);
                  await updateDropDownOptions(
                    selectedItem,
                    filteredItems,
                    records,
                    dropdownId,
                    dropDowns
                  );
                  // dropDownTitle.after(updateDropDown);
                  $(".dropdown-from-" + groupNameForExact).show()
                } else {
                  const dropDowns = createExactDropDown(
                    getWidth[0],
                    filteredItems[index].searchName,
                    filteredItems[index],
                    dropDownTitle
                  );

                  await updateDropDownOptions(
                    selectedItem,
                    filteredItems,
                    records,
                    dropdownId,
                    dropDowns
                  );

                  dropDownTitle.after(dropDowns);

                }

                if ($(".input-text-from-" + groupNameForExact)) {
                  $(".input-text-from-" + groupNameForExact).attr("id", "");
                  $(".input-text-from-" + groupNameForExact).val("");
                  $(".input-text-from-" + groupNameForExact).hide();
                }

                if ($(".date-from-" + groupNameForExact)) {
                  let selected = $(".date-from-" + groupNameForExact);
                  $(selected).attr("id", "");
                  $(selected).hide();
                }

                if ($(".input-number-from-" + groupNameForExact)) {
                  $(".input-number-from-" + groupNameForExact).attr("id", "");
                  $(".input-number-from-" + groupNameForExact).val("id", "");
                  $(".input-number-from-" + groupNameForExact).hide();
                }
               

              } else if (typeInput == "SINGLE_LINE_TEXT") {
              nameInputTitle = selectedItem.searchName;
              $(".input-text-from-" + groupNameForExact).remove();
              if ($(".input-text-from-" + groupNameForExact).length != 0) {
                $(".input-text-from-" + groupNameForExact).attr("id", selectedItem.groupName.replace(/\s+/g, "_"));
                $(".input-text-from-" + groupNameForExact).attr("searchname", nameInputTitle);
                $(".input-text-from-" + groupNameForExact).attr("typefordropdown", selectedItem.searchTarget.code);
                $(".input-text-from-" + groupNameForExact).show();
              } else {
                
                const inputNumber = TextInput(selectedItem, selectedItem.searchTarget.code, setWidth, display, index);
                dropDownTitle.after(inputNumber);
              }

              if ($(".input-number-from-" + groupNameForExact)) {
                $(".input-number-from-" + groupNameForExact).attr("id", "");
                $(".input-number-from-" + groupNameForExact).val("");
                $(".input-number-from-" + groupNameForExact).hide()
              }

              if ($(".date-from-" + groupNameForExact)) {
                let selected = $(".date-from-" + groupNameForExact);
                $(selected).attr("id", "");
                $(selected).hide();
              }

              if ($(".dropdown-from-" + groupNameForExact)) {
                $(".dropdown-from-" + groupNameForExact).attr("id", "");
                $(".dropdown-from-" + groupNameForExact).val("");
                $(".dropdown-from-" + groupNameForExact).hide();
              }
            } else if (typeInput === "MULTI_LINE_TEXT") {
              $(".input-text-from-" + groupNameForExact).remove();
              $(".input-mutiple-from-" + groupNameForExact).remove();
              const inputNumber = TextInput(selectedItem, selectedItem.searchTarget.code, setWidth, display, index);
              dropDownTitle.after(inputNumber);
            } else if (typeInput === "NUMBER" && getSearchTypeFromGroup == "exact") {
              nameInputTitle = selectedItem.searchName;
              $(".input-number-from-" + groupNameForExact).remove();
              if ($(".input-number-from-" + groupNameForExact).length != 0) {
                $(".input-number-from-" + groupNameForExact).attr("id", selectedItem.groupName.replace(/\s+/g, "_"));
                $(".input-number-from-" + groupNameForExact).attr("searchname", nameInputTitle);
                $(".input-number-from-" + groupNameForExact).attr("typefordropdown", selectedItem.searchTarget.code);
                $(".input-number-from-" + groupNameForExact).show();
              } else {
                const inputNumber = createNumber(selectedItem, selectedItem.searchTarget.code, setWidth, display);
                dropDownTitle.after(inputNumber);
              }

              if ($(".date-from-" + groupNameForExact)) {
                let selected = $(".date-from-" + groupNameForExact);
                $(selected).attr("id", "");
                $(selected).hide();
              }

              if ($(".dropdown-from-" + groupNameForExact)) {
                $(".dropdown-from-" + groupNameForExact).attr("id", "");
                $(".dropdown-from-" + groupNameForExact).val("");
                $(".dropdown-from-" + groupNameForExact).hide();
              }

              if ($(".input-text-from-" + groupNameForExact)) {
                $(".input-text-from-" + groupNameForExact).attr("id", "");
                $(".input-text-from-" + groupNameForExact).val("");
                $(".input-text-from-" + groupNameForExact).hide();
              }
            }
            else if (typeInput === "NUMBER" && getSearchTypeFromGroup == "range") {
              nameInputTitle = selectedItem.searchName;
              $(".date-range-from-" + groupNameForExact).remove();
              $(".number-range-from-" + groupNameForExact).remove();
              if ($(".number-range-from-" + groupNameForExact).length != 0) {
                $(".number-range-from-" + groupNameForExact).attr("id", selectedItem.groupName.replace(/\s+/g, "_"));
                $(".number-range-from-" + groupNameForExact).attr("searchname", nameInputTitle);
                $(".number-range-from-" + groupNameForExact).attr("typefordropdown", selectedItem.searchTarget.code);
                $(".number-range-from-" + groupNameForExact).show();
              } else {
                const inputNumber = createNumberRange(selectedItem, selectedItem.searchTarget.code, setWidth, display);
                dropDownTitle.after(inputNumber);
              }
            }
            } else if (typeInput === "DATE" && getSearchTypeFromGroup != "range") {
              nameInputTitle = selectedItem.searchName;
              $(".date-from-" + groupNameForExact).remove();
              if ($(".date-from-" + groupNameForExact).length != 0) {
                let selected = $(".date-from-" + groupNameForExact);
                $(selected).show();
                $(selected).attr("id", selectedItem.groupName.replace(/\s+/g, "_"))
                $(selected).attr("searchname", nameInputTitle);
                $(selected).attr("typefordropdown", selectedItem.searchTarget.code)
              } else {
                const inputDate = createDate(selectedItem, selectedItem.searchTarget.code, display);
                setTimeout(() => {
                  $(inputDate).find(`input`).css({ width: setWidth});
                }, 0);
                dropDownTitle.after(inputDate);
              }

              if ($(".input-number-from-" + groupNameForExact)) {
                $(".input-number-from-" + groupNameForExact).attr("id", "");
                $(".input-number-from-" + groupNameForExact).val("");
                $(".input-number-from-" + groupNameForExact).hide()
              }

              if ($(".input-text-from-" + groupNameForExact)) {
                $(".input-text-from-" + groupNameForExact).attr("id", "");
                $(".input-text-from-" + groupNameForExact).hide();
              }

              if ($(".dropdown-from-" + groupNameForExact)) {
                $(".dropdown-from-" + groupNameForExact).attr("id", "");
                $(".dropdown-from-" + groupNameForExact).hide();
              }
            } else if (typeInput === "DATE" && getSearchTypeFromGroup == "range") {
              nameInputTitle = selectedItem.searchName;
              $(".date-range-from-" + groupNameForExact).remove();
              $(".number-range-from-" + groupNameForExact).remove();
              if ($(".date-range-from-" + groupNameForExact).length != 0) {
                let selected = $(".date-range-from-" + groupNameForExact);
                $(selected).show();
                $(selected).attr("id", selectedItem.groupName.replace(/\s+/g, "_"))
                $(selected).attr("searchname", nameInputTitle);
                $(selected).attr("typefordropdown", selectedItem.searchTarget.code)
              } else {
                const inputDateRange = createDateRange(selectedItem, selectedItem.searchTarget.code, display);
                setTimeout(() => {
                  $(inputDateRange).find(`input`).css({ width: setWidth});
                }, 0);
                dropDownTitle.after(inputDateRange);
              }
            }

            customContextMenu.remove();
          });
          customContextMenu.append(hoverBtn);

        });
        elementsAll.append(customContextMenu);

        $(document).on("click", function (event) {
          if (!customContextMenu.is(event.target) && customContextMenu.has(event.target).length === 0 && !dropDownTitle.is(event.target)) {
            customContextMenu.remove();
            $(document).off("click");
          }
        });

      }
    }
    // create element input for pop-op
    function TextInput(display, fieldCode, width, status, index) {
      let initialText = display.groupName.replace(/\s+/g, "_");
      if (status == true) {
        initialText = display.groupName.replace(/\s+/g, "_");
      }

      const inputElement = $("<input>", {
        type: "text",
        class: "kintoneplugin-input-text-custome input-text-from-" + initialText,
        id: initialText,
        typeForDropdown: fieldCode,
        indexForInitail: index,
        searchName: display.searchName,
        value: bokTermForExact[`${initialText}`] && bokTermForExact[`${initialText}`].active == display.searchName ? bokTermForExact[`${initialText}`].value : ""
      });

      inputElement.css("width", width);
      return inputElement;
    }

    function createNumber(display, fieldCode, width, status) {
      let initialNumber
      let groupName
      if (status === true) {
        initialNumber = display.groupName.replace(/\s+/g, "_");
      } else {
        groupName = display.groupName;
        initialNumber = groupName.replace(/\s+/g, "_");
      }
      const InputNumber = $("<input>", {
        type: "number",
        class: "kintoneplugin-input-text-custome input-number-from-" + initialNumber,
        id: initialNumber,
        typeForDropdown: fieldCode,
        searchName: display.searchName,
        value: bokTermForExact[`${initialNumber}`] && bokTermForExact[`${initialNumber}`].active == display.searchName ? bokTermForExact[`${initialNumber}`].value : ""
      });
      InputNumber.css("width", width);

      return InputNumber;
    }

    function createDate(display, fieldCode, setWidth, type, status) {
      let dateInput
      let groupName
      if (status === true) {
        dateInput = display.groupName.replace(/\s+/g, "_");

      } else {
        groupName = display.groupName.replace(/\s+/g, "_");
        dateInput = groupName.replace(/\s+/g, "_");
      }

      const datePicker = new Kuc.DatePicker({
        requiredIcon: true,
        language: "auto",
        className: "options-class-date date-from-" + dateInput,
        id: dateInput,
        visible: true,
        disabled: false,
        typeForDropdown: fieldCode,
        value: bokTermForExact[`${dateInput}`] && bokTermForExact[`${dateInput}`].active == display.searchName ? bokTermForExact[`${dateInput}`].value : ""
      });

      datePicker.setAttribute("typeForDropdown", fieldCode);
      datePicker.setAttribute("dataType", type);
      datePicker.setAttribute("searchName", display.searchName);

      return datePicker;
    }
    // new
    function createNumberRange(display, fieldCode, width, type, status) {
      let initialNumber
      if (status === true) {
        initialNumber = display.groupName.replace(/\s+/g, "_");
      } else {
        initialNumber = display.groupName.replace(/\s+/g, "_");
      }
      let NumberRange = initialNumber;
      const wrapper = $(`<div id="${NumberRange}" class="wrapperd-number number-range-from-${initialNumber}"></div>`);
      const start = $("<input>", {
        type: "number",
        class: "kintoneplugin-input-text-custome number-range-from-" + initialNumber,
        typeForDropdown: fieldCode,
        // "data-search-type": type,
        id: `${NumberRange}_start`,
        searchName: display.searchName,
      });

      // set css
      start.css("width", width);
      const end = $("<input>", {
        type: "number",
        class: "kintoneplugin-input-text-custome number-range-from-" + initialNumber,
        typeForDropdown: fieldCode,
        // "data-search-type": type,
        id: `${NumberRange}_end`,
        searchName: display.searchName,
      });

      // set css
      end.css("width", width);

      start.val(bokTermForExact[`${NumberRange}`] && bokTermForExact[`${NumberRange}`].active == display.searchName ? bokTermForExact[`${NumberRange}`].valueStart : "")
      end.val(bokTermForExact[`${NumberRange}`] && bokTermForExact[`${NumberRange}`].active == display.searchName ? bokTermForExact[`${NumberRange}`].valueEnd : "")
      const separator = $("<span>⁓</span>").addClass("separatornumber");

      return wrapper.append(start, separator, end);
    }

    function createDateRange(display, fieldCode, width, type, status) {
      let initialNumber
      // let groupName
      if (status === true) {
        initialNumber = display.groupName.replace(/\s+/g, "_");
      } else {
        initialNumber = display.groupName.replace(/\s+/g, "_");
      }
      
      let dateRange = initialNumber;
      const datePickerSatrt = new Kuc.DatePicker({
        requiredIcon: true,
        language: "auto",
        className: "options-class-date",
        id: `${dateRange}_start`,
        typeforDropdown: fieldCode,
        searchName: display.searchName,
        visible: true,
        disabled: false,
        value: bokTermForExact[`${dateRange}`] && bokTermForExact[`${dateRange}`].active == display.searchName ? bokTermForExact[`${dateRange}`].valueStart : "",
      });



      datePickerSatrt.setAttribute("typeforDropdown", fieldCode);
      datePickerSatrt.setAttribute("searchName", display.searchName);

      const datePickerEnd = new Kuc.DatePicker({
        requiredIcon: true,
        language: "auto",
        className: "options-class-date",
        id: `${dateRange}_end`,
        typeforDropdown: fieldCode,
        searchName: display.searchName,
        visible: true,
        disabled: false,
        value: bokTermForExact[`${dateRange}`] && bokTermForExact[`${dateRange}`].active == display.searchName ? bokTermForExact[`${dateRange}`].valueEnd : "",
      });

      datePickerEnd.setAttribute("typeforDropdown", fieldCode);
      datePickerEnd.setAttribute("searchName", display.searchName);

      const separator = $("<span>⁓</span>").addClass("separator-datepicker");
      const wrapper = $("<div></div>").addClass("wrapper-datepiker date-range-from-" + initialNumber).attr("id", dateRange);
      wrapper.append(datePickerSatrt).append(separator).append(datePickerEnd);
      return wrapper;
    }

    // Create dropdown element
    function createDropDown(display, records, initialContent, dropDownTitle) {
      let width = display.searchLength;
      const NameDropdown = display.groupName.replace(/\s+/g, "_");
      const dropDown = $("<select>")
        .addClass("kintoneplugin-dropdown-find")
        .attr("id", `${NameDropdown}`)
        .css({ width: width});
      dropDown.append($("<option>").text("-----").val(""));
      let filteredRecords = CONFIG.searchContent.filter((item) => item.groupName === display.groupName);

      if (display.nameMarker) {
        if (filteredRecords[0]?.masterId !== "-----") {
          let checkValue = [];
          filteredRecords.forEach((item) => {
            $.each(CODEMASTER, (index, data) => {
              if (item.masterId === data.numericKey) {
                let valueData = data.codeAndName;
                if (!valueData) return;
                let valueCheck = Array.isArray(valueData) ? valueData : [valueData];
                $.each(valueCheck, (index, value) => {
                  const existsData = checkValue.some((entry) => entry.code === value.code);
                  if (!existsData) {
                    checkValue.push({ code: value.code, name: value.name });
                    const option = $("<option>")
                      .text(value.name)
                      .addClass("option")
                      .attr("value", value.code)
                      .attr("fieldCode", item.searchTarget.code);
                    dropDown.append(option);
                  }
                });
              }
            });
          });
        } else {
          let checkValue = [];
          $.each(filteredRecords, (index, item) => {
            $.each(DETFIELDlIST, (index, data) => {
              let fieldList = data.fieldList;
              $.each(fieldList, (index, value) => {
                if (item.searchTarget.code !== value.var) return;
                let dataValue = value.properties?.options;
                if (!dataValue) return;
                $.each(dataValue, (index, options) => {
                  let optionValue = options?.label;
                  let valuesCheck = Array.isArray(optionValue) ? optionValue : [optionValue];
                  $.each(valuesCheck, (index, list) => {
                    if (!checkValue.includes(list)) {
                      checkValue.push(list);
                      const option = $("<option>")
                        .text(list)
                        .addClass("option")
                        .attr("value", list)
                        .attr("fieldCode", item.searchTarget.code);
                      dropDown.append(option);
                    }
                  });
                });
              });
            });
          });
        }
      } else {
        if (filteredRecords[0]?.masterId !== "-----") {
          let checkValue = [];
          dropDownTitle.text(initialContent.searchName);
          $.each(CODEMASTER, (index, value) => {
            if (initialContent.masterId === value.numericKey) {
              let valueData = value.codeAndName;
              if (!valueData) return;
              let valueCheck = Array.isArray(valueData) ? valueData : [valueData];
              $.each(valueCheck, (index, data) => {
                const existsData = checkValue.some((entry) => entry.code === data.code);
                if (!existsData) {
                  checkValue.push({ code: data.code, name: data.name });
                  const initialOption = $("<option>")
                    .text(data.name)
                    .addClass("option")
                    .attr("value", data.code)
                    .attr("fieldCode", initialContent.searchTarget.code);
                  dropDown.append(initialOption);
                }
              });
            }
          });
        } else {
          dropDownTitle.text(initialContent.searchName);
          let checkValue = [];
          $.each(DETFIELDlIST, (index, data) => {
            let fieldList = data.fieldList;
            $.each(fieldList, (index, value) => {
              if (initialContent.searchTarget.code !== value.var) return;
              let dataValue = value.properties?.options;
              if (!dataValue) return;
              $.each(dataValue, (index, options) => {
                let optionValue = options?.label;
                let valuesCheck = Array.isArray(optionValue) ? optionValue : [optionValue];
                $.each(valuesCheck, (index, item) => {
                  if (!checkValue.includes(item)) {
                    checkValue.push(item);
                    const initialOption = $("<option>")
                      .text(item)
                      .addClass("option")
                      .attr("value", item)
                      .attr("fieldCode", initialContent.searchTarget.code);
                    dropDown.append(initialOption);
                  }
                });
              });
            });
          });
        }
      }
      dropDown.on("change", (e) => {
        const selectedValue = dropDown.val();
        const selectedOption = dropDown.find("option:selected");
        const fieldCode = selectedOption.attr("fieldCode");
        const getDropdownId = dropDown.attr("id");
        const dropdownId = getDropdownId.replace(/_/g, " ");
        const labelValue = dropDown
          .closest(".search-item")
          .find(".custom-dropdownTitle")
          .text()
          .trim();
        queryDropdown(selectedValue, fieldCode, dropdownId, labelValue);
      });

      return dropDown;
    }

    function createExactDropDown(display, records, initialContent, dropDownTitle) {
      let setWidth;
      if (display.searchLength) {
        let matchResult = display?.searchLength
        .replace(/\s/g, "")
        .match(/(\d+)(rem|px|%)/i);
      setWidth = display.searchLength != 0 ? `${matchResult[1]}${matchResult[2]}` : "5rem";
        
      }
      const NameDropdown = display.groupName.replace(/\s+/g, "_");
      const dropDown = $("<select>")
        .addClass("kintoneplugin-dropdown-find dropdown-from-" + NameDropdown)
        .attr("id", `${NameDropdown}`)
        .attr("searchName", `${records}`)
        .css({ width: setWidth});
      dropDown.append($("<option>").text("-----").val(""));
      let filteredRecords = CONFIG.searchContent.filter((item) => item.groupName === display.groupName);

      if (display.nameMarker) {
        if (filteredRecords[0]?.masterId !== "-----") {
          let checkValue = [];
          filteredRecords.forEach((item) => {
            $.each(CODEMASTER, (index, data) => {
              if (item.masterId === data.numericKey) {
                let valueData = data.codeAndName;
                if (!valueData) return;
                let valueCheck = Array.isArray(valueData) ? valueData : [valueData];
                $.each(valueCheck, (index, value) => {
                  const existsData = checkValue.some((entry) => entry.code === value.code);
                  if (!existsData) {
                    checkValue.push({ code: value.code, name: value.name });
                    const option = $("<option>")
                      .text(value.name)
                      .addClass("option")
                      .attr("value", value.code)
                      .attr("fieldCode", item.searchTarget.code);
                    dropDown.append(option);
                  }
                });
              }
            });
          });
        } else {
          let checkValue = [];
          $.each(filteredRecords, (index, item) => {
            $.each(DETFIELDlIST, (index, data) => {
              let fieldList = data.fieldList;
              $.each(fieldList, (index, value) => {
                if (item.searchTarget.code !== value.var) return;
                let dataValue = value.properties?.options;
                if (!dataValue) return;
                $.each(dataValue, (index, options) => {
                  let optionValue = options?.label;
                  let valuesCheck = Array.isArray(optionValue) ? optionValue : [optionValue];
                  $.each(valuesCheck, (index, list) => {
                    if (!checkValue.includes(list)) {
                      checkValue.push(list);
                      const option = $("<option>")
                        .text(list)
                        .addClass("option")
                        .attr("value", list)
                        .attr("fieldCode", item.searchTarget.code);
                      dropDown.append(option);
                    }
                  });
                });
              });
            });
          });
        }
      } else {
        $(dropDownTitle).text(initialContent.searchName);
        if (initialContent.masterId !== "-----") {
          let checkValue = [];
          $.each(CODEMASTER, (index, value) => {
            if (initialContent.masterId === value.numericKey) {
              let valueData = value.codeAndName;
              if (!valueData) return;
              let valueCheck = Array.isArray(valueData) ? valueData : [valueData];
              $.each(valueCheck, (index, data) => {
                const existsData = checkValue.some((entry) => entry.code === data.code);
                if (!existsData) {
                  checkValue.push({ code: data.code, name: data.name });
                  const initialOption = $("<option>")
                    .text(data.name)
                    .addClass("option")
                    .attr("value", data.code)
                    .attr("fieldCode", initialContent.searchTarget.code);
                  dropDown.append(initialOption);
                }
              });
            }
          });
        } else {
          $(dropDownTitle).text(initialContent.searchName);
          let checkValue = [];
          $.each(DETFIELDlIST, (index, data) => {
            let fieldList = data.fieldList;
            $.each(fieldList, (index, value) => {
              if (initialContent.searchTarget.code !== value.var) return;
              let dataValue = value.properties?.options;
              if (!dataValue) return;
              $.each(dataValue, (index, options) => {
                let optionValue = options?.label;
                let valuesCheck = Array.isArray(optionValue) ? optionValue : [optionValue];
                $.each(valuesCheck, (index, item) => {
                  if (!checkValue.includes(item)) {
                    checkValue.push(item);
                    const initialOption = $("<option>")
                      .text(item)
                      .addClass("option")
                      .attr("value", item)
                      .attr("fieldCode", initialContent.searchTarget.code);
                    dropDown.append(initialOption);
                  }
                });
              });
            });
          });
        }
      }
      dropDown.on("change", (e) => {
        const selectedValue = dropDown.val();
        const selectedOption = dropDown.find("option:selected");
        const fieldCode = selectedOption.attr("fieldCode");
        const getDropdownId = dropDown.attr("id");
        const dropdownId = getDropdownId.replace(/_/g, " ");
        const labelValue = dropDown
          .closest(".search-item")
          .find(".custom-dropdownTitle")
          .text()
          .trim();
        queryDropdown(selectedValue, fieldCode, dropdownId, labelValue);
      });

      return dropDown;
    }

    // Update dropdown options
    function updateDropDownOptions(
      selectedItem,
      filteredItems,
      records,
      dropDownTitle,
      groupName,
      status
    ) {

      if (status == "active") {
        const dropDown = dropDownTitle;
        dropDown.empty();
        dropDown.append($("<option>").text("-----").val(""));
        const selectedContent = filteredItems.filter((content) => content.groupName === groupName);
        const matchingContent = selectedContent.find((content) => content.searchName === selectedItem);
        if (matchingContent) {
          if (matchingContent.masterId !== "-----") {
            let checkValue = [];
            $.each(CODEMASTER, (index, value) => {
              if (matchingContent.masterId === value.numericKey) {
                let valueData = value.codeAndName;
                if (!valueData) return;
                let valueCheck = Array.isArray(valueData) ? valueData : [valueData];
                $.each(valueCheck, (index, data) => {
                  const existsData = checkValue.some((entry) => entry.code === data.code);
                  if (!existsData) {
                    checkValue.push({ code: data.code, name: data.name });
                    const selectedOption = $("<option>")
                      .text(data.name)
                      .addClass("option")
                      .attr("value", data.code)
                      .attr("fieldCode", matchingContent.searchTarget.code);
                    dropDown.append(selectedOption);
                  }
                });
              }
            });
          } else {
            let checkValue = [];
            $.each(DETFIELDlIST, (index, data) => {
              let fieldList = data.fieldList;
              $.each(fieldList, (index, value) => {
                if (matchingContent.searchTarget.code !== value.var) return;
                let dataValue = value.properties?.options;
                if (!dataValue) return;
                $.each(dataValue, (index, options) => {
                  let optionValue = options?.label;
                  let valuesCheck = Array.isArray(optionValue) ? optionValue : [optionValue];
                  $.each(valuesCheck, (index, item) => {
                    if (!checkValue.includes(item)) {
                      checkValue.push(item);
                      const selectedOption = $("<option>")
                        .text(item)
                        .addClass("option")
                        .attr("value", item)
                        .attr("fieldCode", matchingContent.searchTarget.code);
                      dropDown.append(selectedOption);
                    }
                  });
                });
              });
            });
          }
        }
      } else {
        let dropDown;
        dropDown = $(`.${dropDownTitle}`)
        if ($(`.${dropDownTitle}`).is("select")) {
          dropDown = $(`.${dropDownTitle}`)
        }
        dropDown.empty();
        dropDown.append($("<option>").text("-----").val(""));
        const selectedContent = filteredItems.find((content) => content.searchTarget === selectedItem.searchTarget);
        if (selectedContent.masterId !== "-----") {
          let checkValue = [];
          $.each(CODEMASTER, (index, data) => {
            if (selectedContent.masterId === data.numericKey) {
              let valueData = data.codeAndName;
              if (!valueData) return;
              let valueCheck = Array.isArray(valueData) ? valueData : [valueData];
              $.each(valueCheck, (index, value) => {
                const existsData = checkValue.some((entry) => entry.code === value.code);
                if (!existsData) {
                  checkValue.push({ code: value.code, name: value.name });
                  const selectedOption = $("<option>")
                    .text(value.name)
                    .addClass("option")
                    .attr("value", value.code)
                    .attr("fieldCode", selectedContent.searchTarget.code);
                  dropDown.append(selectedOption);
                }
              });
            }
          });
        } else {
          let checkValue = [];
          $.each(DETFIELDlIST, (index, data) => {
            let fieldList = data.fieldList;
            $.each(fieldList, (index, value) => {
              if (selectedItem.searchTarget.code !== value.var) return;
              let dataValue = value.properties?.options;
              if (!dataValue) return;
              $.each(dataValue, (index, options) => {
                let optionValue = options?.label;
                let valuesCheck = Array.isArray(optionValue) ? optionValue : [optionValue];
                $.each(valuesCheck, (index, item) => {
                  if (!checkValue.includes(item)) {
                    checkValue.push(item);
                    const selectedOption = $("<option>")
                      .text(item)
                      .addClass("option")
                      .attr("value", item)
                      .attr("fieldCode", selectedItem.searchTarget.code);
                    dropDown.append(selectedOption);
                  }
                });
              });
            });
          });
        }
      }
    }

    function createBokTermsObject(selectedValue, dropdownId, labelValue, type = "", searchValue2) {
      if (type == "range") {
        return {
          [dropdownId]: {
            valueStart: selectedValue,
            valueEnd: searchValue2,
            active: labelValue,
          },
        }
      } else {
        return {
          [dropdownId]: {
            value: selectedValue,
            active: labelValue,
          },
        }
      }
    }

    async function queryDropdown(
      selectedValue,
      fieldCode,
      dropdownId,
      labelValue
    ) {

      let query;
      let searchInfoList = CONFIG.groupSetting;

      let urlObjDropdown = new URL(window.location.href);
      let getQueryFromUrl = urlObjDropdown.searchParams.get("query");
      let changeToArray;
      if (getQueryFromUrl) {
        changeToArray = getQueryFromUrl.split(/ and /);
      }

      let queryInput = await getValueConditionAndBuildQuery(
        searchInfoList,
        false
      );

      let joinObject = { ...bokTermsGet, ...bokTermsObject };
      const url = new URL(window.location.href);

      // Get the base URL with only the 'view' parameter
      const baseUrl = `${url.origin}${url.pathname}`;
      const currentUrlBase = baseUrl;
      const bokTermsString = JSON.stringify(joinObject);
      const bokTerms = encodeURIComponent(bokTermsString);

      if (queryInput) {
        query = `${query ? " and" : ""}${queryInput}`;
      } else {
        query = "";
      }

      let querySuccess = encodeURIComponent(query);

      const QueryUrl = `${currentUrlBase}?view=${event.viewId}&query=${querySuccess}&bokTerms=${bokTerms}`;
      const urlObj = new URL(window.location.href);
      const bokTerm = urlObj.searchParams.get("bokTerms");
      if (bokTerm == null) {
        window.location.href = QueryUrl;
      } else {
        const decodedBokTerms = decodeURIComponent(bokTerm).replace(/(^\{|\}$)/g, "");
        const cleanBokTerms = decodedBokTerms.replace(/[^{}\[\]":,0-9a-zA-Z._-\s]/g, "");
        const wrappedBokTerms = `{${cleanBokTerms}}`;
        let bokTermObj;
        try {
          bokTermObj = JSON.parse(wrappedBokTerms);
        } catch (error) {
          bokTermObj = {}; // initialize as an empty object in case of error
        }
        // Update the bokTermObj only if the dropdownId exists
        if (dropdownId in bokTermObj) {
          bokTermObj[dropdownId].value = selectedValue;
          bokTermObj[dropdownId].active = labelValue;
        } else {
          bokTermObj[dropdownId] = {
            value: selectedValue,
            active: labelValue,
          };
        }
        querySuccess = encodeURIComponent(query);
        const updatedUrl = `${currentUrlBase}?view=${event.viewId}&query=${querySuccess}&bokTerms=${bokTerms}`;
        window.location.href = updatedUrl;
      }
    }

    async function getURL() {
      const urlObj = new URL(window.location.href);
      const bokTerms = urlObj.searchParams.get("bokTerms");
      if (bokTerms != null) {
        const decodedBokTerms = decodeURIComponent(bokTerms).replace(/(^\{|\}$)/g, "");
        const cleanBokTerms = decodedBokTerms.replace(/[^{}\[\]":,0-9a-zA-Z._-\s\u3000-\u303F\u3040-\u30FF\u4E00-\u9FFF\uFF00-\uFFEF]/g, "");
        const wrappedBokTerms = `{${cleanBokTerms}}`;
        let bokTerm;
        try {
          bokTerm = JSON.parse(wrappedBokTerms);
        } catch (error) {
          return; // Exit if there's an error parsing
        }

        Object.entries(bokTerm).forEach(([key, bokTermsObj]) => {
          CONFIG.groupSetting.forEach((searchItem) => {
            if (searchItem.groupName === key.replace(/_/g, " ")) {
              CONFIG.searchContent.forEach((Item) => {
                if (searchItem.nameMarker == '') {
                  if (searchItem.searchType.value == "exact" ||
                     searchItem.searchType.value == "range" ||
                     searchItem.searchType.value == "patial" ||
                     searchItem.searchType.value == "initial") {
                    if (searchItem.groupName == Item.groupName) {
                      if (Item.searchName == bokTermsObj.active) {
                        const trimmedActive = bokTermsObj.active ? bokTermsObj.active.trim() : null;
                        let getAllofSearchItem = document.querySelectorAll(".search-item");
                        let getIdElements;
                        getAllofSearchItem.forEach((element) => {
                          const dropdownTitle = element.querySelector(".custom-dropdownTitle")
                          if (key == dropdownTitle?.getAttribute("forseach")) {
                            getIdElements = dropdownTitle
                            labelForCheck = dropdownTitle.getAttribute("forseach")
                          }
                        })
                        if (trimmedActive != null) {
                          let valueLabel = $(getIdElements).text()
                          $(getIdElements).text(trimmedActive);
                          if (Item.searchTarget.type == "NUMBER") {
                            if (Item.masterId !== "-----") {
                              if (valueLabel != trimmedActive) {
                                if (Item.groupName == searchItem.groupName) {
                                  $(getIdElements).next().hide();
                                  let filteredRecords = CONFIG.groupSetting.filter((item) => item.groupName === searchItem.groupName);
                                  let filteredSearchContent = CONFIG.searchContent.filter((item) => item.groupName === searchItem.groupName);
                                  let filtered = filteredSearchContent.filter((item) => item.searchName === trimmedActive)
                                  let element = createExactDropDown(filteredRecords[0], filtered[0].searchName, filtered[0], getIdElements)
                                  $(getIdElements).after(element)
                                  let getId = $(getIdElements).next()
                                  const optionExists = getId.find(`option[value="${bokTermsObj.value}"]`).length > 0;
                                  if (bokTermsObj.value == "-----") {
                                    getId.val("");
                                  } else {
                                    if (optionExists) {
                                      getId.val(bokTermsObj.value);
                                    } else {
                                      getId.append(
                                        $("<option>")
                                          .text(bokTermsObj.value)
                                          .val(bokTermsObj.value)
                                      );
                                      getId.val(bokTermsObj.value);
                                    }
                                  }
                                }
                              }
                              
                            } else {
                              if (valueLabel != trimmedActive) {
                                if (Item.groupName == searchItem.groupName) {
                                  if (searchItem.searchType.value == "range") {
                                    let width = searchItem.searchLength ? searchItem.searchLength : "5rem";
                                    $(getIdElements).next().hide();
                                    let elementNumber = createNumberRange(Item, Item.searchTarget.code, width, " ", true)
                                    $(getIdElements).after(elementNumber);
                                  } else {
                                    let width = searchItem.searchLength ? searchItem.searchLength : "5rem";
                                    $(getIdElements).next().hide();
                                    let elementNumber = createNumber(Item, Item.searchTarget.code, width, true);
                                    elementNumber.val(bokTermsObj.value);
                                    $(getIdElements).after(elementNumber);
                                    }
                                  }
                                }
                              }
                          } else if (Item.searchTarget.type == "DATE") {
                            if (valueLabel != trimmedActive) {
                              let width = searchItem.searchLength ? searchItem.searchLength : "5rem";
                              if (searchItem.searchType.value == "range") {
                                $(getIdElements).next().hide();
                                  let elementDate = createDateRange(Item, Item.searchTarget.code, "", "", true)
                                  setTimeout(() => {
                                    $(elementDate).find(`input`).css({ width: width });
                                  }, 0);
                                  $(getIdElements).after(elementDate)
                              } else {
                                  $(getIdElements).next().hide();
                                  let elementDate = createDate(Item, Item.searchTarget.code, "", "", true)
                                  elementDate.setAttribute("value", bokTermsObj.value);
                                  setTimeout(() => {
                                    $(elementDate).find(`input`).css({ width: width});
                                  }, 0);
                                  $(getIdElements).after(elementDate)
                              }
                            }  
                          } else if (Item.searchTarget.type == "SINGLE_LINE_TEXT" || Item.searchTarget.type == "MULTI_LINE_TEXT") {
                            if (Item.masterId !== "-----") {
                              if (valueLabel != trimmedActive) {
                                if (Item.groupName == searchItem.groupName) {
                                  $(getIdElements).next().hide();
                                  let filteredRecords = CONFIG.groupSetting.filter((item) => item.groupName === searchItem.groupName);
                                  let filteredSearchContent = CONFIG.searchContent.filter((item) => item.groupName === searchItem.groupName);
                                  let filtered = filteredSearchContent.filter((item) => item.searchName === trimmedActive)
                                  let element = createExactDropDown(filteredRecords[0], filtered[0].searchName, filtered[0], getIdElements)
                                  $(getIdElements).after(element)
                                  let getId = $(getIdElements).next()
                                  const optionExists = getId.find(`option[value="${bokTermsObj.value}"]`).length > 0;
                                  if (bokTermsObj.value == "-----") {
                                    getId.val("");
                                  } else {
                                    if (optionExists) {
                                      getId.val(bokTermsObj.value);
                                    } else {
                                      getId.append(
                                        $("<option>")
                                          .text(bokTermsObj.value)
                                          .val(bokTermsObj.value)
                                      );
                                      getId.val(bokTermsObj.value);
                                    }
                                  }
                                }
                              }
                            } else {
                              if (valueLabel != trimmedActive) {
                                let getIndex = "";
                                if (searchItem.searchType.value == "patial" ||
                                  searchItem.searchType.value == "initial"
                                ) {
                                  let getGroup = CONFIG.groupSetting.filter((item) => item.groupName == Item.groupName)
                                  getIndex = getGroup[0].target_field.indexOf(Item.fieldForSearch);
                                }
                               
                                if (Item.groupName == searchItem.groupName) {
                                  let width = searchItem.searchLength ? searchItem.searchLength : "5rem";
                                  $(getIdElements).next().hide();
                                  let elementText = TextInput(Item, Item.searchTarget.code, width, true, getIndex);
                                  elementText.val(bokTermsObj.value)
                                  $(getIdElements).after(elementText)
                                }
                              }
                            }
                          } else {
                            if (valueLabel != trimmedActive) {
                              $(getIdElements).next().hide();
                              let filteredRecords = CONFIG.groupSetting.filter((item) => item.groupName === searchItem.groupName);
                              let filteredSearchContent = CONFIG.searchContent.filter((item) => item.groupName === searchItem.groupName);
                              let filtered = filteredSearchContent.filter((item) => item.searchName === trimmedActive)
                              let element = createExactDropDown(filteredRecords[0], filtered[0].searchName, filtered[0], getIdElements)
                              $(getIdElements).after(element)
                              let getId = $(getIdElements).next()
                              const optionExists = getId.find(`option[value="${bokTermsObj.value}"]`).length > 0;
                              if (bokTermsObj.value == "-----") {
                                getId.val("");
                              } else {
                                if (optionExists) {
                                  getId.val(bokTermsObj.value);
                                } else {
                                  getId.append(
                                    $("<option>")
                                      .text(bokTermsObj.value)
                                      .val(bokTermsObj.value)
                                  );
                                  getId.val(bokTermsObj.value);
                                }

                              }
                            }
                          }
                        }
                      }
                    }
                  }
                } else {
                  let getIdElement = searchItem.groupName.replace(/\s+/g, "_");
                  const getId = $(`#${getIdElement}`);
                  if (getId.hasClass("kintoneplugin-dropdown-find")) {
                    const optionExists = getId.find(`option[value="${bokTermsObj.value}"]`).length > 0;
                    if (bokTermsObj.value == "-----") {
                      getId.val("");
                    } else {
                      if (optionExists) {
                        getId.val(bokTermsObj.value);
                      } else {
                        getId.append(
                          $("<option>")
                            .text(bokTermsObj.value)
                            .val(bokTermsObj.value)
                        );
                        getId.val(bokTermsObj.value);
                      }

                    }
                  }
                }
              })
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
        class: "kintoneplugin-input-text-custome input-text-from-" + initialText,
        "data-serach-type": searchType,
        id: initialText,
      });

      inputElement.css("width", width);

      if (result[initialText]) {
        inputElement.val(result[initialText]);
      }

      return inputElement;
    }

    function createTextNumberInput(searchType, groupName, setWidth) {
      let initialNumber = groupName.replace(/\s+/g, "_");
      const InputNumber = $("<input>", {
        type: "number",
        class: "kintoneplugin-input-text-custome",
        "data-search-type": searchType,
        id: initialNumber,
      });

      InputNumber.css("width", setWidth);
      result[`${initialNumber}`]
        ? InputNumber.val(result[`${initialNumber}`])
        : "";

      return InputNumber;
    }

    function createNumberRangeInput(searchType, groupName, width) {
      let NumberRange = groupName.replace(/\s+/g, "_");
      const wrapper = $('<div class="wrapperd-number"></div>');
      const start = $("<input>", {
        type: "number",
        class: "kintoneplugin-input-text-custome",
        "data-search-type": searchType,
        id: `${NumberRange}_start`,
      });

      // set css
      start.css("width", width);
      const end = $("<input>", {
        type: "number",
        class: "kintoneplugin-input-text-custome",
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

    function createDateInput(searchType, groupName, type) {
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
      datePicker.setAttribute("dataType", type);
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
      result[`${dateRange}_start`] ? $(`#${dateRange}_start`).val(result[`${dateRange}_start`]) : "";
      result[`${dateRange}_end`] ? $(`#${dateRange}_end`).val(result[`${dateRange}_end`]) : "";

      const separator = $("<span>⁓</span>").addClass("separator-datepicker");
      const wrapper = $("<div></div>").addClass("wrapper-datepiker");
      wrapper.append(datePickerSatrt).append(separator).append(datePickerEnd);
      return wrapper;
    }

    // Create action buttons
    function createButton(text, callback) {
      return $("<button>")
        .text(text)
        .addClass("kintoneplugin-button-dialog-ok-custome")
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
      $('.search-item').each(function () {
        const $searchItemDiv = $(this);
        const $label = $searchItemDiv.find('label.custom-dropdownTitle');
        if ($label.length) {
          const labelValue = $label.text().trim();
          let $nextElement = $label.next();
          let dropdownId = $nextElement.attr('id')
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
      let CheckCodeMaster;
      let afterFilter = CONFIG.searchContent.filter((searchItem) => searchItem.groupName == groupName);
      if (afterFilter.length > 0) {
        types = afterFilter[0].searchTarget.type;
        CheckCodeMaster = afterFilter[0].masterId;
        Titlename = nameMarker ? nameMarker : afterFilter[0].searchName;
        searchItem["searchName"] = Titlename;
        searchItem["fieldCodeForExact"] = afterFilter[0].searchTarget.code;
        afterFilter.forEach((searchItemTarget) => {
          setSearchTarget.push(searchItemTarget.fieldForSearch != "-----" ? searchItemTarget.fieldForSearch : searchItemTarget.searchTarget.code);
        });
      }

      let matchResult = searchItem.searchLength
        .replace(/\s/g, "")
        .match(/(\d+)(rem|px|%)/i);
      let setWidth = matchResult ? `${matchResult[1]}${matchResult[2]}` : "5rem";

      if (afterFilter.length >= 1) {
        searchItem["target_field"] = setSearchTarget;
        const elementInput = $("<div></div>").addClass("search-item").css({ color: SETCOLOR.titleColor });
        let inputElement;
        const label = $("<label>")
          .text(Titlename)
          .addClass(nameMarker === "" ? "custom-dropdownTitle" : "label")
          .attr("forseach", searchItem.groupName.replace(/\s+/g, "_"));
        

        if ((nameMarker === "") && (afterFilter[0]?.groupName === groupName && afterFilter.length > 1)) {
          label.css({ cursor: nameMarker ? "default" : "pointer" })
            .on("click", function () {
              handleDropDownTitleClick(
                searchItem,
                CONFIG,
                setWidth,
                afterFilter,
                label,
                dropDown
              );
            });

          const dropDown = createExactDropDown(
            searchItem,
            afterFilter[0].searchName,
            afterFilter[0],
            label
          );
        }
        elementInput.append(label);

        switch (types) {
          case "SINGLE_LINE_TEXT":
            if (searchType === "exact") {
              if (CheckCodeMaster !== "-----" && (afterFilter[0]?.groupName === groupName && afterFilter.length >= 1)) {
                createDropDowns(searchItem, setWidth);
              } else {
                inputElement = TextInput(searchItem, searchItem.fieldCodeForExact, setWidth);
                elementInput.append(inputElement);
                elementsAll.append(elementInput);
              }
            } else if (searchType === "initial" || searchType === "patial") {
              inputElement = TextInput(searchItem, searchItem.fieldCodeForExact, setWidth, "", 0);
              elementInput.append(inputElement);
              elementsAll.append(elementInput);
            }
            break;

          case "NUMBER":
          case "CALC":
            if (searchType === "range") {
              if ((afterFilter[0]?.groupName === groupName && afterFilter.length >= 1)) {
                inputElement = createNumberRange(searchItem, searchItem.fieldCodeForExact, setWidth, types);
                elementInput.append(inputElement);
                elementsAll.append(elementInput);
              } else {
                inputElement = createNumberRangeInput(searchType, groupName, setWidth);
                elementInput.append(inputElement);
                elementsAll.append(elementInput);
              }
            } else if (searchType === "exact") {
              if (CheckCodeMaster !== "-----" && (afterFilter[0]?.groupName === groupName && afterFilter.length >= 1)) {
                createDropDowns(searchItem, setWidth);
              } else {
                inputElement = createNumber(searchItem, searchItem.fieldCodeForExact, setWidth);
                elementInput.append(inputElement);
                elementsAll.append(elementInput);
              }
            } else {
              inputElement = createTextNumberInput(searchType, groupName, setWidth);
              elementInput.append(inputElement);
              elementsAll.append(elementInput);
            }
            break;

          case "MULTI_LINE_TEXT":
            if (afterFilter[0]?.groupName === groupName && afterFilter.length > 1) {
              createDropDowns(searchItem, setWidth);
            } else if (searchType === "initial" || searchType === "patial") {
              inputElement = TextInput(searchItem, searchItem.fieldCodeForExact, setWidth,"", 0);
              elementInput.append(inputElement);
              elementsAll.append(elementInput);
            }
            break;

          case "DATE":
          case "DATETIME":
            if (searchType === "exact") {
              if (searchItem.nameMarker == "" && (searchItem.target_field.length >= 1 && afterFilter.length >= 1)) {
                inputElement = createDate(searchItem, searchItem.fieldCodeForExact, setWidth, types);
                setTimeout(() => {
                  $(inputElement).find(`input`).css({ width: setWidth});
                }, 0);
                elementInput.append(inputElement);
                elementsAll.append(elementInput);
              } else {
                inputElement = createDateInput(searchType, groupName, types);
                setTimeout(() => {
                  $(inputElement).find(`input`).css({ width: setWidth});
                }, 0);
                elementInput.append(inputElement);
                elementsAll.append(elementInput);
              }
            } else if (searchType === "range") {
              if ((afterFilter[0]?.groupName === groupName && afterFilter.length >= 1)) {
                inputElement = createDateRange(searchItem, searchItem.fieldCodeForExact, setWidth, types);
                setTimeout(() => {
                  $(inputElement).find(`input`).css({ width: setWidth});
                }, 0);
                elementInput.append(inputElement);
                elementsAll.append(elementInput);
              } else {
                inputElement = createDateRangeInput(searchType, groupName, searchItem);
                setTimeout(() => {
                  $(inputElement).find(`input`).css({ width: setWidth});
                }, 0);
                elementInput.append(inputElement);
                elementsAll.append(elementInput);
              }
            }
            break;

          case "CHECK_BOX":
          case "DROP_DOWN":
          case "RADIO_BUTTON":
            if (searchType === "exact") {
              createDropDowns(searchItem, setWidth);
            }
            break;

          default:
            inputElement = null;
        }
      }
    });
    elementsAll.append(elementBtn);
    spaceElement.append(elementsAll);
    getURL();
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
            if (item.searchType.value == "initial" || item.searchType.value == "patial") {
              kintone.app.record.setFieldShown(searchItem.fieldForSearch, false);
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

              if (searchItem.fieldForSearch !== "-----") {
                record[searchItem.fieldForSearch].value = convertedValue;
              }
            }
          }
        }
      }

      if (event.type == "app.record.create.submit" || event.type == "app.record.edit.submit.success") {
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
      if (event.type == "app.record.edit.show" || event.type == "app.record.edit.submit.success") {
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
                    html: item.name + (item.required ? '<span class="kintoneplugin-require">*</span>' : ""),
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
                    class: "modern-input-box kintoneplugin-input-text-custome",
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
                      .find(".kintoneplugin-input-text-custome");
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