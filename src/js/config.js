jQuery.noConflict();
(async function ($, Swal10, PLUGIN_ID) {
	"use strict";
	let CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);
	let HASUPDATED = true;
	let GETVERSION = [];

	// get field from kintone app.
	let GETFIELD = await kintone.api("/k/v1/preview/app/form/fields", "GET", {
		app: kintone.app.getId()
	});

	// get layout for get space from kintone app.
	let GETSPACE = await kintone.api("/k/v1/preview/app/form/layout.json", "GET", {
		app: kintone.app.getId()
	});

	// sort field.
	let FIELDFROMAPP = Object.values(GETFIELD.properties).sort((a, b) => {
		return a.code.localeCompare(b.code);
	});

	// get space.
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

	// sort space
	let SORTSPACE = SPACE.sort((a, b) => {
		return a.value.localeCompare(b.value);
	});

	//function set value to config setting.
	async function setValueConfig() {
		const fieldType = ["SINGLE_LINE_TEXT", "MULTI_LINE_TEXT", "NUMBER", "CALC", "CHECK_BOX", "RADIO_BUTTON", "DROP_DOWN", "DATE", "DATETIME"];
		console.log('FIELDFROMAPP', FIELDFROMAPP);
		FIELDFROMAPP.forEach((items) => {
			if (fieldType.includes(items.type)) {
				$("select#search_target").append(
					$("<option>").attr("value", items.code).attr("type", items.type).text(`${items.label}(${items.code}) `)
				);
				if (items.type == "SINGLE_LINE_TEXT" || items.type == "MULTI_LINE_TEXT") {
					$("select#field_for_search").append(
						$("<option>").attr("value", items.code).text(`${items.label}(${items.code})  `)
					);
				}
			}
			$("select#search_target").on('change', (e) => {
				console.log(e.target.type);
			})

		});

		//set space to dropdown spaceForPromptTemplate and spaceForButton.
		// SORTSPACE.forEach(spacer => {
		// 	$("select[name=\"field_dropdown_column_spaceForPromptTemplate\"]").append(
		// 		$("<option>").attr("value", spacer.value).text(`${spacer.value} (${spacer.value})`)
		// 	);
		// 	$("select[name=\"field_dropdown_column_spaceButton\"]").append(
		// 		$("<option>").attr("value", spacer.value).text(`${spacer.value} (${spacer.value})`)
		// 	);
		// });
	}

	// function get data from table.
	async function getData() {
		// let selectPlatForm = $(".platForm").val()
		// let modelVersion = selectPlatForm == "Chat_GPT" ? $("#modelVersionChatGPT").val() : $("#modelVersionAzure").val();
		// let resourceName = "";
		// let deploymentID = "";
		// let apiVersion = "";

		// if (selectPlatForm == "Azure_OpenAI") {
		// 	resourceName = $("#resourceName").val();
		// 	deploymentID = $("#deploymentID").val();
		// 	apiVersion = $("#apiVersion").val();
		// }

		// let getDataSettings = {
		// 	versionFromAI: GETVERSION,
		// 	platForm: selectPlatForm,
		// 	modelVersion: modelVersion,
		// 	apiKey: $("#apiKey").val(),
		// 	maxToken: $("#maxToken").val(),
		// 	resourceName: resourceName,
		// 	deploymentID: deploymentID,
		// 	apiVersion: apiVersion
		// };

		//get value from space for prompt template and button.
		let groupSetting = $("#kintoneplugin-setting-tspace > tr:gt(0)").map(function () {
			let nameMarker = $(this).find("#name_marker").val();
			let groupName = $(this).find("#group_name").val();
			let searchLength = $(this).find("#search_length").val();
			let searchType = $(this).find("#search_type").val();
			return { nameMarker, groupName, searchLength, searchType };
		}).get();
		console.log('groupSetting', groupSetting);

		let codeMasterSetting = $("#kintoneplugin-setting-code-master > tr:gt(0)").map(function () {
			let masterId = $(this).find("#master_id").val();
			let appId = $(this).find("#app_id").val();
			let apiToken = $(this).find("#api_token").val();
			let codeField = $(this).find("#code_field").val();
			let nameField = $(this).find("#name_field").val();
			let typeField = $(this).find("#type_field").val();
			return { masterId, appId, apiToken, codeField, nameField, typeField };
		}).get();
		console.log('codeMasterSetting', codeMasterSetting);

		let searchContent = $("#kintoneplugin-setting-prompt-template > tr:gt(0)").map(function () {
			let groupName = $(this).find("#group_name_ref").val();
			let searchName = $(this).find("#search_name").val();
			let masterId = $(this).find("#master_id_ref").val();
			let searchTarget = $(this).find("#search_target").val();
			let fieldForSearch = $(this).find("#field_for_search").val();
			return { groupName, searchName, masterId, searchTarget, fieldForSearch };
		}).get();
		console.log('searchContent', searchContent);

		// //get value from setting prompt template.
		// let settingPromptTemplate = $("#kintoneplugin-setting-prompt-template > tr:gt(0)").map(function () {
		// 	let spacePromptTemplate = "-----";
		// 	let spaceButton = "-----";
		// 	let status = $(this).find("#checkbox").prop("checked");
		// 	if (status == true) {
		// 		spacePromptTemplate = $(this).find("#spacePromptTemplate").val();
		// 	} else {
		// 		spaceButton = $(this).find("#spaceButtons").val();
		// 	}
		// 	let settingName = $(this).find("#settingName").val();
		// 	let fieldResult = $(this).find("#fieldResult").val();
		// 	let slide = $(this).find("#container-table-settingPromptTemplate").css("display");
		// 	let systemInstruction = $(this).find(".systemRole").val();
		// 	let prompt = $(this).find(".promptContent").val();
		// 	return { status, settingName, fieldResult, slide, spacePromptTemplate, spaceButton, systemInstruction, prompt };
		// }).get();
		// getDataSettings.spaceSetting = spaceSetting;
		// getDataSettings.settingPromptTemplate = settingPromptTemplate;
		return {
			groupSetting,
			codeMasterSetting,
			searchContent
		};
	}

	//function validation of button save.
	async function validationSave(getData) {
		let checkError = false;
		let duplicateRows = new Set();
		let errorTexts = [];
		let duplicateTracker = {
			spacePromptTemplate: {},
			fieldResult: {},
			spaceButton: {},
			settingName: {}
		};

		// remove validation-error before validation
		$('.fieldResult,.settingName,.storeFields,.promptContent,.systemRole').removeClass('validation-error');

		// Get option values of dropdown spacePromptTemplate and spaceButton
		let getOptions = (selector) => $(selector).find("option")
			.filter((index, option) => option.text !== "-----").map((index, option) => option.value).get();

		// Get all option values including hidden options, excluding "-----"
		let getAllOptionsIncludingHidden = (selector) => $(selector).find("option")
			.filter((index, option) => option.text !== "-----").map((index, option) => option.value).get();

		// Get values
		let spacePromptTemplateOptions = getOptions("#spacePromptTemplate");
		let spaceButtonOptions = getAllOptionsIncludingHidden("#spaceButtons");

		// Check the button update click
		if (HASUPDATED == false) {
			errorTexts.push(`<div style='padding-left: 10px;'>保存する前に「更新」ボタンをクリックしてください。</div>`);
			checkError = true;
		} else {
			if (getData.spaceSetting.length !== spaceButtonOptions.length) {
				errorTexts.push(`<div style='padding-left: 10px;'>保存する前に「更新」ボタンをクリックしてください。</div>`);
				checkError = true;
			} else {
				let hasError = false;  // Define hasError before the loop
				for (let i = 0; i < getData.spaceSetting.length; i++) {
					let setting = getData.spaceSetting[i];
					if (setting.spaceForPromptTemplate !== "-----") {
						let spaceForPromptTemplate = setting.spaceForPromptTemplate;
						if (!spacePromptTemplateOptions.includes(spaceForPromptTemplate)) {
							hasError = true;
							break;
						}
					}
					if (!spaceButtonOptions.includes(setting.spaceForButton)) {
						hasError = true;
						break;
					}
				}
				if (hasError == true) {
					errorTexts.push(`<div style='padding-left: 10px;'>保存する前に「更新」ボタンをクリックしてください。</div>`);
					checkError = true;
				}
			}
		}

		// Step 1: Validate empty values
		let errorTitle = ""
		if (checkError == false) {
			for (let i = 0; i < getData.settingPromptTemplate.length; i++) {
				let { status, settingName, prompt, fieldResult, spacePromptTemplate, spaceButton } = getData.settingPromptTemplate[i];
				let currentRow = $(`#kintoneplugin-setting-prompt-template > tr:eq(${i + 1})`);
				let displayTitleNameErrorText = "";

				if (settingName === "") {
					displayTitleNameErrorText += `<div style='padding-left: 10px;'>${i + 1}行目： 設定名が未入力です。</div>`;
					currentRow.find(".settingName").addClass("validation-error");
				}
				if (status == true) {
					if (spacePromptTemplate === "-----") {
						displayTitleNameErrorText += `<div style='padding-left: 10px;'>${i + 1}行目： プロンプトテンプレート用のスペースが未入力です。</div>`;
						currentRow.find(".spacePromptTemplate").addClass("validation-error");
					}
				} else {
					if (spaceButton === "-----") {
						displayTitleNameErrorText += `<div style='padding-left: 10px;'>${i + 1}行目： ボタン用のスペースが未入力です。</div>`;
						currentRow.find(".spaceButton").addClass("validation-error");
					}
				}
				if (prompt === "") {
					displayTitleNameErrorText += `<div style='padding-left: 10px;'>${i + 1}行目：プロンプトが未入力です</div>`;
					currentRow.find(".promptContent").addClass("validation-error");
				}
				if (fieldResult === "-----") {
					displayTitleNameErrorText += `<div style='padding-left: 10px;'>${i + 1}行目：結果格納用フィールドが未入力です。</div>`;
					currentRow.find(".fieldResult").addClass("validation-error");
				}
				if (displayTitleNameErrorText) {
					errorTexts.push(`<div style='text-align: left;'>${displayTitleNameErrorText}</div>`);
				}
			}
			errorTitle = "プロンプトテンプレートの設定";
		}

		// If there are errors in empty values, display them and return false
		if (errorTexts.length > 0) {
			let errors = errorTexts.join("");
			let customClass = $("<div></div>")
				.text(errorTitle)
				.css("font-size", "25px");
			await Swal10.fire({
				title: customClass.prop("outerHTML"),
				icon: "error",
				html: errors,
				confirmButtonColor: "#3498db",
			});
			return false;
		}

		// Step 2: Validate duplicate values if no empty values were found
		errorTexts = []; // Clear the error texts for the next step
		for (let i = 0; i < getData.settingPromptTemplate.length; i++) {
			let { status, settingName, fieldResult, spacePromptTemplate, spaceButton, prompt, systemInstruction } = getData.settingPromptTemplate[i];
			let currentRow = $(`#kintoneplugin-setting-prompt-template > tr:eq(${i + 1})`);
			let displayTitleNameErrorText = "";

			// Validate settingName duplicates
			if (duplicateTracker.settingName[settingName]) {
				let duplicateRow = duplicateTracker.settingName[settingName];
				duplicateRows.add(duplicateRow);
				displayTitleNameErrorText += `<div style='padding-left: 10px;'>${duplicateRow}行目で設定された「設定名」は${i + 1}行目で設定された「設定名」と一致します。</div>`;
				currentRow.find(".settingName").addClass("validation-error");
				$(`#kintoneplugin-setting-prompt-template > tr:eq(${duplicateRow})`).find(".settingName").addClass("validation-error");
			} else {
				duplicateTracker.settingName[settingName] = i + 1;
			}

			// Validate other fields duplicates
			if (status === true) {
				displayTitleNameErrorText += checkDuplicate('spacePromptTemplate', spacePromptTemplate, fieldResult, currentRow, duplicateTracker, duplicateRows, i, prompt, systemInstruction);
			} else {
				displayTitleNameErrorText += checkDuplicate('spaceButton', spaceButton, fieldResult, currentRow, duplicateTracker, duplicateRows, i, prompt, systemInstruction);
			}
			if (displayTitleNameErrorText) {
				errorTexts.push(`<div style='text-align: left;'>${displayTitleNameErrorText}</div>`);
			}
		}

		duplicateRows.forEach(row => {
			$(`#kintoneplugin-setting-prompt-template > tr:eq(${row + 1})`).addClass("validation-error");
		});

		if (errorTexts.length > 0) {
			let errors = errorTexts.join("");
			let customClass = $("<div></div>")
				.text(errorTitle)
				.css("font-size", "25px");
			await Swal10.fire({
				title: customClass.prop("outerHTML"),
				icon: "error",
				html: errors,
				confirmButtonColor: "#3498db",
			});
			return false;
		}
		return true;

		// Check duplicate value function.
		function checkDuplicate(fieldType, fieldSpace, fieldResult, currentRow, duplicateTracker, duplicateRows, i, prompt, systemInstruction) {
			let displayTitleNameErrorText = "";

			// Check if space for prompt template or space for button is duplicate
			if (duplicateTracker[fieldType][fieldSpace]) {
				let duplicateRow = duplicateTracker[fieldType][fieldSpace];
				duplicateRows.add(duplicateRow);
				let previousIndex = duplicateTracker[fieldType][fieldSpace] - 1;
				let previousFieldResult = getData.settingPromptTemplate[previousIndex].fieldResult;

				// Check if field result is duplicate value
				if (fieldResult === previousFieldResult) {
					displayTitleNameErrorText += `<div style='padding-left: 10px;'>${duplicateRow} 行目で設定された「結果格納用フィールド」は ${i + 1} 行目で設定された「結果格納用フィールド」と一致します。</div>`;
					currentRow.find(".fieldResult").addClass("validation-error");
					$(`#kintoneplugin-setting-prompt-template > tr:eq(${duplicateRow})`).find(".fieldResult").addClass("validation-error");
				}
			} else {
				duplicateTracker[fieldType][fieldSpace] = i + 1;
			}

			// Check if store field is duplicate with field result or field information
			for (let m = 0; m < getData.spaceSetting.length; m++) {
				let rowSpaceSetting = $(`#kintoneplugin-setting-tspace > tr:eq(${m + 1})`);
				let storeField = getData.spaceSetting[m].storeField;
				if (storeField !== "-----") {
					if (storeField === fieldResult) {
						displayTitleNameErrorText += `<div style='padding-left: 10px;'>${m + 1} 行目で設定された「ストアフィールド」は ${i + 1} 行目で設定された「結果格納用フィールド」と一致します。</div>`;
						rowSpaceSetting.find(".storeFields").addClass("validation-error");
						$(`#kintoneplugin-setting-prompt-template > tr:eq(${i + 1})`).find(".fieldResult").addClass("validation-error");
					}

					if (prompt !== "") {
						let promptPlaceholders = [];
						let regex = /{%([^%]+)%}/g;
						let match;
						while ((match = regex.exec(prompt)) !== null) {
							promptPlaceholders.push(match[1]);
						}
						if (promptPlaceholders.includes(storeField)) {
							displayTitleNameErrorText += `<div style='padding-left: 10px;'>${m + 1} 行目で設定された「ストアフィールド」は ${i + 1} 行目で設定された「プロンプト内容」と一致します。</div>`;
							rowSpaceSetting.find(".storeFields").addClass("validation-error");
							$(`#kintoneplugin-setting-prompt-template > tr:eq(${i + 1})`).find(".promptContent").addClass("validation-error");
						}
					}

					if (systemInstruction !== "") {
						let instructionPlaceholders = [];
						let regex = /{%([^%]+)%}/g;
						let match;
						while ((match = regex.exec(systemInstruction)) !== null) {
							instructionPlaceholders.push(match[1]);
						}
						if (instructionPlaceholders.includes(storeField)) {
							displayTitleNameErrorText += `<div style='padding-left: 10px;'>${m + 1} 行目で設定された「ストアフィールド」は ${i + 1} 行目で設定された「システム指示」と一致します。</div>`;
							rowSpaceSetting.find(".storeFields").addClass("validation-error");
							$(`#kintoneplugin-setting-prompt-template > tr:eq(${i + 1})`).find(".systemRole").addClass("validation-error");
						}
					}
				}
			}
			return displayTitleNameErrorText;
		}
	}

	// setInitialValue function
	async function setInitialValue(status, setInitial) {
		let getConfig = {};
		if (status == "setInitial") {
			if (Object.keys(CONFIG).length === 0) {
				$("#kintoneplugin-setting-prompt-template tr:first-child").after(
					$("#kintoneplugin-setting-prompt-template tr:first-child").clone(true).removeAttr("hidden")
				);
				$("#kintoneplugin-setting-code-master tr:first-child").after(
					$("#kintoneplugin-setting-code-master tr:first-child").clone(true).removeAttr("hidden")
				);
				let newRow = $("#kintoneplugin-setting-tspace tr:first-child").clone(true).removeAttr("hidden");
				$("#kintoneplugin-setting-tspace tr:first-child").after(newRow);
				newRow.find('#labelForButton').val(' 生成');
				newRow.find('#labelForPromptTemplate').val('プロンプトテンプレート');

				$(".azureComponent").hide();
				HASUPDATED = false;
				checkRow();
				return
			} else {
				getConfig = JSON.parse(CONFIG.config);
			}
		} else {
			// Clear all rows except the first row of table space for prompt template and button and table setting prompt template.
			$("#kintoneplugin-setting-tspace > tr:not(:first)").remove();
			$("#kintoneplugin-setting-prompt-template > tr:not(:first)").remove();
			$("#spaceButtons").empty().append($('<option>').text('-----').val('-----'));
			$("#spacePromptTemplate").empty().append($('<option>').text('-----').val('-----'));
			HASUPDATED = false;
			getConfig = setInitial;
		}

		let appendedValues = new Set();
		getConfig.spaceSetting.forEach((space) => {
			let rowForClone = $("#kintoneplugin-setting-tspace tr:first-child").clone(true).removeAttr("hidden");
			$("#kintoneplugin-setting-tspace tr:last-child").after(rowForClone);
			rowForClone.find("#labelForPromptTemplate").val(space.labelForPromptTemplate);
			rowForClone.find("#labelForButton").val(space.labelForButton);
			for (let i = 0; i < SORTSPACE.length; i++) {
				let spacer = SORTSPACE[i];
				if (spacer.value == space.spaceForPromptTemplate || space.spaceForPromptTemplate == "-----") {
					if (space.spaceForPromptTemplate == "-----") {
						rowForClone.find("#storeFields").prop("disabled", true);
						rowForClone.find("#spaceForPromptTemplate").val(space.spaceForPromptTemplate);
						rowForClone.find("#storeFields").val("-----");
					} else {
						rowForClone.find("#storeFields").prop("disabled", false);
						rowForClone.find("#spaceForPromptTemplate").val(space.spaceForPromptTemplate);
						if (space.spaceForPromptTemplate !== "-----") {
							$('select[name="field_dropdown_column_space_for_prompt"]').append(
								$('<option>').attr("value", space.spaceForPromptTemplate).text(`${space.spaceForPromptTemplate} (${space.spaceForPromptTemplate})`)
							);
						}
						for (let j = 0; j < FIELDFROMAPP.length; j++) {
							let items = FIELDFROMAPP[j];
							if (items.code == space.storeField) {
								rowForClone.find("#storeFields").val(space.storeField);
								break;
							} else {
								rowForClone.find("#storeFields").val("-----");
							}
						}
					}
					break;
				} else {
					rowForClone.find("#spaceForPromptTemplate").val("-----");
					rowForClone.find("#storeFields").val("-----");
					rowForClone.find("#storeFields").prop("disabled", true);
				}
			}
			// Handle the spaceForButton check
			for (let k = 0; k < SORTSPACE.length; k++) {
				let spacer = SORTSPACE[k];
				if (spacer.value == space.spaceForButton) {
					rowForClone.find("#spaceForButton").val(space.spaceForButton);
					if (space.spaceForButton !== "-----") {
						let optionElement = $('<option>').attr("value", space.spaceForButton).text(`${space.spaceForButton} (${space.spaceForButton})`);
						if (!appendedValues.has(space.spaceForButton)) {
							appendedValues.add(space.spaceForButton);
						} else {
							optionElement.attr("hidden", true);
						}
						$('select[name="field_dropdown_column_space_button"]').append(optionElement);
					}
					break;
				} else {
					rowForClone.find("#spaceForButton").val("-----");
				}
			}
		});

		getConfig.settingPromptTemplate.forEach((field) => {
			let rowForClone = $("#kintoneplugin-setting-prompt-template tr:first-child").clone(true).removeAttr("hidden");
			$("#kintoneplugin-setting-prompt-template tr:last-child").after(rowForClone);
			rowForClone.find("#settingName").val(field.settingName);
			rowForClone.find(".systemRole").val(field.systemInstruction);
			rowForClone.find(".promptContent").val(field.prompt);
			for (let i = 0; i < FIELDFROMAPP.length; i++) {
				let items = FIELDFROMAPP[i];
				if (field.fieldResult.includes(items.code)) {
					rowForClone.find("#fieldResult").val(field.fieldResult);
					break;  // Exit the loop if a match is found
				} else {
					rowForClone.find("#fieldResult").val("-----");
				}
			}

			for (let i = 0; i < getConfig.spaceSetting.length; i++) {
				let space = getConfig.spaceSetting[i];
				let matchFound = false;

				if (space.spaceForPromptTemplate == field.spacePromptTemplate) {
					rowForClone.find("#spacePromptTemplate").val(field.spacePromptTemplate);
					matchFound = true;
				} else {
					rowForClone.find("#spacePromptTemplate").val("-----");
				}

				if (space.spaceForButton == field.spaceButton) {
					rowForClone.find("#spaceButtons").val(field.spaceButton);
					matchFound = true;
				} else {
					rowForClone.find("#spaceButtons").val("-----");
				}
				if (matchFound) {
					break;
				}
			}

			if (field.slide == "none") {
				rowForClone.find("#container-table-settingPromptTemplate").css("display", field.slide);
				rowForClone.find("#navbar-show-content").show();
				rowForClone.find("#navbar-show-content label").text(field.settingName);
			}
			if (field.status == true) {
				rowForClone.find("#checkbox").prop("checked", true);
				rowForClone.find(".spacePromptTemplate").show();
				rowForClone.find(".space_Button").hide();
			} else {
				rowForClone.find("#checkbox").prop("checked", false);
				rowForClone.find(".spacePromptTemplate").hide();
				rowForClone.find(".space_Button").show();
			}
		})

		$("#resourceName").val(getConfig.resourceName);
		$("#deploymentID").val(getConfig.deploymentID);
		$("#apiVersion").val(getConfig.apiVersion);
		$("#apiKey").val(getConfig.apiKey);
		$(".maxToken").val(getConfig.maxToken);

		if (getConfig.platForm == "Chat_GPT") {
			$(".platForm").val(getConfig.platForm);
			if (getConfig.versionFromAI.length !== 0) {
				getConfig.versionFromAI.forEach(modelVersion => {
					$('select[name="field_dropdown_column_model_version_chatGPT"]').append(
						$('<option>').attr("value", modelVersion).text(modelVersion)
					);
				});
			}
			$("#modelVersionChatGPT").val(getConfig.modelVersion);
			$(".modelVersion-ChatGPT").show();
			$(".azureComponent").hide();
			$(".system-role").hide();
		} else if (getConfig.platForm == "Azure_OpenAI") {
			$(".platForm").val(getConfig.platForm);
			$(".modelVersion-ChatGPT").hide();
			$(".azureComponent").show();
			$(".system-role").show();
		} else {
			$(".platForm").val("Chat_GPT");
			if (getConfig.versionFromAI.length !== 0) {
				getConfig.versionFromAI.forEach(modelVersion => {
					$('select[name="field_dropdown_column_model_version_chatGPT"]').append(
						$('<option>').attr("value", modelVersion).text(modelVersion)
					);
				});
			}
			$(".modelVersion-ChatGPT").show();
			$(".modelVersion-Azure").hide();
			$(".azureComponent").hide();
			$(".system-role").hide();
		}
		checkRow();
	}

	// check row function.
	function checkRow() {
		const tablesId = [
			"#kintoneplugin-setting-code-master",
			"#kintoneplugin-setting-tspace",
			"#kintoneplugin-setting-prompt-template"
		];
		$.each(tablesId, function (index, id) {
			let rows = $(id + " > tr");
			if (rows.length <= 2) {
				rows.find(".removeRow").hide();
			} else {
				rows.find(".removeRow").show();
			}
		});
	}

	//function start when open the plugin.
	$(document).ready(async function () {
		window.RsComAPI.showSpinner();
		await setValueConfig();
		await setInitialValue('setInitial');
		window.RsComAPI.hideSpinner();

		$('#kintoneplugin-setting-body tbody, #kintoneplugin-setting-code-master, #kintoneplugin-setting-tspace').sortable({
			handle: '.drag-icon',  // Restrict dragging to the drag icon (bars)
			items: 'tr:not([hidden])', // Ensure only visible rows can be dragged
			cursor: 'move',
			placeholder: 'ui-state-highlight',
			axis: 'y'
		});

		// button save.
		$('#button_save').on('click', async function () {
			let createConfig = await getData();
			let validation = await validationSave(createConfig);
			if (validation === false) {
				return;
			} else {
				$('.fieldResult, .settingName, .storeFields, .promptContent, .systemRole, .spacePromptTemplate, .spaceButton').removeClass('validation-error');
				let config = JSON.stringify(createConfig);
				kintone.plugin.app.setConfig({ config }, () => {
					window.location.href = `../../flow?app=${kintone.app.getId()}#section=settings`;
				});
			};
		});

		// button-update.
		$("#button-update").click(async function () {
			let getValueUpdated = await getData();
			console.log(getValueUpdated);
			let valueValidation = await validationUpdate(getValueUpdated);
			// let valueValidation = true;
			let dataLost = false;
			if (valueValidation == true) {
				return Swal10.fire({
					position: 'center',
					icon: 'error',
					text: 'Some thing went wrong!',
					showConfirmButton: true,
				});
			} else {
				// Clear validation-error.
				// $('.spaceForPromptTemplate, .storeFields, .spaceForButton').removeClass('validation-error');

				// Clear value in row 0 of table space for prompt template and button and set to default value.
				let firstRow = $('#kintoneplugin-setting-prompt-template tr:eq(0)');
				firstRow.find(`select#group_name_ref`).empty().append($('<option>').text('-----').val('-----'));
				firstRow.find('select#master_id_ref').empty().append($('<option>').text('-----').val('-----'));

				// set data to row 0 of table space for prompt template and button.
				getValueUpdated.groupSetting.forEach((item) => {
					if (item.spaceForPromptTemplate !== "-----") {
						firstRow.find('select#group_name_ref').append(
							$('<option>').attr("value", item.spaceForPromptTemplate).text(`${item.spaceForPromptTemplate} (${item.spaceForPromptTemplate})`)
						);
					}

					firstRow.find('select#master_id_ref').append(
						$('<option>').attr("value", item.spaceForButton).text(`${item.spaceForButton} (${item.spaceForButton})`)
					);
				});

				// Select all table rows except the first one.
				$('#kintoneplugin-setting-prompt-template > tr:gt(0)').each(function () {
					let row = $(this); // Store the current row in a jQuery object.

					// Get the selected values from the dropdowns space for button and space for prompt template.
					let selectedGroupName = row.find('select#group_name_ref').val();
					let selectedMasterId = row.find('select#master_id_ref').val();

					// Clear the value and set to default value.
					row.find('select#group_name_ref').empty().append($('<option>').val('-----').text("-----"));
					row.find('select#master_id_ref').empty().append($('<option>').val('-----').text("-----"));
					let appendedValues = new Set();
					getValueUpdated.groupSetting.forEach((item) => {
						if (item.groupName) {
							row.find('select#group_name_ref').append(
								$('<option>').attr("value", item.groupName).text(`${item.groupName}`)
							);
						}

					});

					getValueUpdated.codeMasterSetting.forEach((item) => {
						if (item.masterId) {
							row.find('select#master_id_ref').append(
								$('<option>').attr("value", item.masterId).text(`${item.masterId}`)
							);
						}

					});

					// Check to see if not same value is set "-----".
					if (row.find('select#group_name_ref option[value="' + selectedGroupName + '"]').length == 0) {
						selectedGroupName = "-----";
						dataLost = true;
					}
					if (row.find('select#master_id_ref option[value="' + selectedMasterId + '"]').length == 0) {
						selectedMasterId = "-----";
						dataLost = true;
					}

					// Set to the value selected.
					row.find('select#group_name_ref').val(selectedGroupName);
					row.find('select#master_id_ref').val(selectedMasterId);
				});
				Swal10.fire({
					position: 'center',
					icon: 'success',
					text: 'プラグイン設定が更新されました。',
					showConfirmButton: true,
				});
				HASUPDATED = true;
			}
		});

		// button-load data.
		$("#load_data").click(async function () {
			window.RsComAPI.showSpinner();
			console.log($("#kintoneplugin-setting-code-master > tr:gt(0)"))
			let allResponse = [];
			for (let row of $("#kintoneplugin-setting-code-master > tr:gt(0)")) {
				let appId = $(row).find('#app_id').val();
				let apiToken = $(row).find('#api_token').val();
				let body = { app: appId };

				if (!appId) continue;  // Skip if appId is not present

				if (apiToken) body.token = apiToken;

				let checkData = allResponse.filter(item => item.appId == appId);
				console.log('checkData', checkData);

				let response = [];
				if (checkData.length <= 0) {
					response = await window.RsComAPI.getRecords(body);
					allResponse.push({ appId, response });
				} else {
					console.log('get old');
					response = checkData[0].response;
				}

				$(row).find('select#type_field').empty().append($('<option>').val('-----').text("-----"));
				$(row).find('select#code_field').empty().append($('<option>').val('-----').text("-----"));
				$(row).find('select#name_field').empty().append($('<option>').val('-----').text("-----"));
				for (const item of response) {
					console.log(item);
					if (($(row).find('select#type_field option[value="' + item.type.value + '"]')).length <= 0) {
						$(row).find('select#type_field').append(
							$('<option>').attr("value", item.type.value).text(`${item.type.value}`)
						);
					}
					// $(row).find('select#code_field').append(
					// 	$('<option>').attr("value", item.code.value).text(`${item.code.value}`)
					// );
					// $(row).find('select#name_field').append(
					// 	$('<option>').attr("value", item.name.value).text(`${item.name.value}`)
					// );
				}
				$(row).find('select#type_field').on('change', async (e) => {
					console.log(e.target.value);
					if (e.target.value !== '-----') {
						$(row).find('select#code_field').prop('disabled', false).parent().removeClass('disabled-select');
						$(row).find('select#name_field').prop('disabled', false).parent().removeClass('disabled-select');
						let selectedType = e.target.value;

						let filteredCode = response
							.filter(item => item.type.value === selectedType) // Keep items matching the selected type
							.map(item => item.code.value) // Map to code values
							.filter(code => code != null) // Filter out null and undefined values
							.map(Number) // Convert string values to numbers for accurate sorting
							.sort((a, b) => a - b); // Sort in ascending order
						console.log('filteredCode', filteredCode);
						$(row).find('select#code_field').empty().append($('<option>').val('-----').text("-----"));
						for (const code of filteredCode) {
							$(row).find('select#code_field').append(
								$('<option>').attr("value", code).text(`${code}`)
							);
						}

						let filteredName = response
							.filter(item => item.type.value === selectedType) // Keep items matching the selected type
							.map(item => item.name.value) // Map to name values
							.filter(name => name != null) // Filter out null and undefined values
							.sort((a, b) => a.localeCompare(b)); // Sort in alphabetical order
						$(row).find('select#name_field').empty().append($('<option>').val('-----').text("-----"));
						for (const name of filteredName) {
							$(row).find('select#name_field').append(
								$('<option>').attr("value", name).text(`${name}`)
							);
						}
					} else {
						$(row).find('select#code_field').empty().append($('<option>').val('-----').text("-----")).prop('disabled', true).parent().addClass('disabled-select');
						$(row).find('select#name_field').empty().append($('<option>').val('-----').text("-----")).prop('disabled', true).parent().addClass('disabled-select');
						// $(row).find('select#code_field').prop('disabled', true).parent().addClass('disabled-select');
						// $(row).find('select#name_field').prop('disabled', true).parent().addClass('disabled-select');
					}
				})
				console.log('response', response);
			}
			window.RsComAPI.hideSpinner();
		});

		$("#recreate-button").click(async function (e) {
			e.preventDefault();
			window.RsComAPI.showSpinner();
			let latestValue = await getData();
			console.log('latestValue', latestValue);
			let records = await window.RsComAPI.getRecords({ app: kintone.app.getId() });
			console.log('records', records);
			for (let row of $("#kintoneplugin-setting-prompt-template > tr:gt(0)")) {
				let groupName = $(row).find('select#group_name_ref').val();
				let targetField = $(row).find('select#search_target').val();
				let fieldForSearch = $(row).find('select#field_for_search').val();
				if (!fieldForSearch) continue;
				let getGroupData = latestValue.groupSetting.filter(item => item.groupName == groupName);
				console.log('groupSetting', getGroupData);
				let updateRecords = [];

				for (let record of records) {
					let targetValue = record[targetField].value;
					let convertedValue = "";

					switch (getGroupData[0].searchType) {
						case "text_initial":
						case "multi_text_initial":
							convertedValue = `_,${targetValue.split('').join(',')}`
							console.log('convertedValue', convertedValue);
							break;

						case "text_patial":
						case "multi_text_patial":
							convertedValue = `${targetValue.split('').join(',')}`
							break;

						case "text_exact":
							convertedValue = `_,${targetValue.split('').join(',')},_`
							break;

						default:
							break;
					}
					// if (getGroupData[0].searchType == "text_initial") {
					// 	convertedValue = `_,${targetValue.split('').join(',')}`
					// 	console.log('convertedValue', convertedValue);
					// }
					record[fieldForSearch].value = convertedValue;
					updateRecords.push({
						id: record.$id.value,
						record: {
							[fieldForSearch]: {
								value: convertedValue
							}
						}
					});

				}
				let body = {
					app: kintone.app.getId(),
					records: updateRecords
				}
				console.log('body', body);
				try {
					await kintone.api(kintone.api.url('/k/v1/records.json', true), 'PUT', body);
				} catch (error) {
					console.log(error);
				}

				console.log('update records:', records);

			}
			window.RsComAPI.hideSpinner();
		});

		$("#resourceName, #deploymentID, #apiVersion, #apiKey, #platForm, #maxToken").on("change", function () {
			HASUPDATED = false;
		});

		// validate update function.
		async function validationUpdate(setUpdate) {
			let hasError = false;
			//group setting table
			$('#kintoneplugin-setting-tspace > tr:gt(0)').each(function () {
				let groupName = $(this).find('#group_name');
				let searchType = $(this).find('#search_type');
				if (searchType.val() == "-----"){
					// errorTexts.push(`<div style='padding-left: 10px;'>「��索対象フィールド」が未選択です。</div>`);
          $(searchType).parent().addClass('validation-error');
					hasError = true;
				}else {
					$(searchType).parent().removeClass('validation-error');
					hasError = false;
				}

				if (!groupName.val()){
					// errorTexts.push(`<div style='padding-left: 10px;'>「��索対象フィールド」が未選択です。</div>`);
          $(groupName).addClass('validation-error');
					hasError = true;
				}else {
					$(groupName).removeClass('validation-error');
					hasError = false;
				}
			});

			//code master table
			$('#kintoneplugin-setting-code-master > tr:gt(0)').each(function () {
				
			});
			$('#kintoneplugin-setting-prompt-template > tr:gt(0)').each(function () {

			});
			return hasError;
		}

		// get version of chat gpt from api 
		async function validateApiKey(apiKey, errorTexts) {
			let url = 'https://api.openai.com/v1/models';
			let headers = {
				'Authorization': `Bearer ${apiKey}`
			};
			try {
				let response = await fetch(url, { headers });
				let data = await response.json();
				if (data.error) {
					errorTexts.push(`<div style='padding-left: 10px;'>無効なAPIキーです。</div>`);
					$(`.apiKey`).addClass('validation-error');
				} else {
					let transformedModelIds = data.data.map(model => {
						let parts = model.id.split('-');
						if (parts.length > 2) {
							return parts.slice(0, 2).join('-');
						}
						return model.id;
					});
					let filterGptModelIds = Array.from(new Set(transformedModelIds.filter(id => id.startsWith('gpt'))));
					let valueFromFilter = Array.from(new Set(filterGptModelIds.filter(id => {
						return id.localeCompare('gpt-4o', undefined, { numeric: true }) >= 0;
					})));

					if (valueFromFilter.length > 0) {
						let selectedVersionChatGPT = $('select[name="field_dropdown_column_model_version_chatGPT"]').val();
						$('select[name="field_dropdown_column_model_version_chatGPT"]').empty().append(
							$('<option>').attr("value", "gpt-3.5-turbo").text("gpt-3.5-turbo"),
							$('<option>').attr("value", "gpt-4").text("gpt-4")
						);
						GETVERSION = valueFromFilter;
						valueFromFilter.forEach(modelVersion => {
							$('select[name="field_dropdown_column_model_version_chatGPT"]').append(
								$('<option>').attr("value", modelVersion).text(modelVersion)
							);
						});

						if ($('select[name="field_dropdown_column_model_version_chatGPT"] option[value="' + selectedVersionChatGPT + '"]').length == 0) {
							selectedVersionChatGPT = "-----";
						}
						$('select[name="field_dropdown_column_model_version_chatGPT"]').val(selectedVersionChatGPT);
					}
				}
			} catch (error) {
				errorTexts.push(`<div style='padding-left: 10px;'>${error}</div>`);
				$(`.apiKey`).addClass('validation-error');
			}
		}

		$(".cancel").on('click', async function () {
			Swal10.fire({
				position: "center",
				icon: "info",
				text: "プラグインの設定を終了しますか？",
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
					window.location.href = "../../" + kintone.app.getId() + "/plugin/";
				}
			});
		});

		//slide up function
		function slideUp() {
			let settingNameValue = $(this).closest("tr").find("#settingName").val();
			$(this).closest("tr").find("#container-table-settingPromptTemplate").slideUp();
			$(this).closest("tr").find("#navbar-show-content").show();
			$(this).closest("tr").find("#navbar-show-content label").text(settingNameValue);
			$(this).closest("tr").find(".slide-up").hide();
		};



		//add new row function
		$(".addRow").on('click', function () {
			// let closestTable = $(this).closest("table");
			// if (closestTable.is("#kintoneplugin-setting-space")) {
			//     let clonedRow = $(this).closest("tr").after($("#kintoneplugin-setting-tspace tr:first-child").clone(true).removeAttr("hidden")).next();
			//     clonedRow.find('#labelForButton').val('生成');
			//     clonedRow.find('#labelForPromptTemplate').val('プロンプトテンプレート');
			//     checkRow("#kintoneplugin-setting-tspace");
			// } else if (closestTable.is("#kintoneplugin-setting-body")) {
			//     slideUp.call(this);
			//     $(this).closest("tr").after($("#kintoneplugin-setting-prompt-template tr:first-child").clone(true).removeAttr("hidden"));
			//     checkRow("#kintoneplugin-setting-prompt-template");
			// };
			let closestTable = $(this).closest("table");
			let closestTbody = $(this).closest("tbody");
			let clonedRow = closestTbody.find("tr").first().clone(true).removeAttr("hidden");
			if (closestTable.is("#kintoneplugin-setting-body")) slideUp.call(this);

			// Insert the cloned row after the current clicked row
			$(this).closest("tr").after(clonedRow);
			checkRow();
		});

		//remove row function
		$(".removeRow").on('click', function () {
			$(this).closest("tr").remove();
			checkRow();
		});

		//slide down button
		$(".slide-down").on('click', function () {
			$(this).closest('tr').find(" #container-table-settingPromptTemplate").slideDown();
			$(this).closest('tr').find("#navbar-show-content").hide();
			$(this).closest('tr').find("#checkbox-slide-up").show();
			$(this).closest('tr').find(".slide-up").show();
		});

		//slide up button
		$('.slide-up').click(function () {
			slideUp.call(this);
		});

		//check box
		$(".status-setting").on('click', function () {
			let elementCheckbox = $(this).find('input[type="checkbox"]');
			let isChecked = elementCheckbox.prop("checked");
			if (isChecked) {
				elementCheckbox.prop("checked", false);
				elementCheckbox.attr("value", "false");
				elementCheckbox.closest('tr').find(".spacePromptTemplate").hide();
				elementCheckbox.closest('tr').find(".space_Button").show();
			} else {
				elementCheckbox.prop("checked", true);
				elementCheckbox.attr("value", "true");
				elementCheckbox.closest('tr').find(".spacePromptTemplate").show();
				elementCheckbox.closest('tr').find(".space_Button").hide();
			}
		});

		// when spaceForPromptTemplate is has change it's will be disabled store field
		$(".spaceForPromptTemplate").change(function () {
			let valueChange = $(this).find('#spaceForPromptTemplate').val();
			if (valueChange == "-----") {
				$(this).closest('tr').find('select[name="field_dropdown_column_fieldResult"]').val('-----');
				$(this).closest('tr').find("#storeFields").val('-----').prop("disabled", true);
				$(this).closest('tr').find('.storeFields').removeClass('validation-error');

			} else {
				$(this).closest('tr').find("#storeFields").prop("disabled", false);
			}
		});

		$(document).on('contextmenu', 'textarea.systemRole, textarea.promptContent', function (e) {
			e.preventDefault();
			let clickedTextarea = $(this);
			const oldContextMenu = $('#custom-context-menu');
			if (oldContextMenu.length) {
				oldContextMenu.remove();
			}

			let customContextMenu = $('<div>').attr('id', 'custom-context-menu')
				.css({
					left: e.pageX + 'px',
					top: e.pageY + 'px',
				});

			FIELDFROMAPP.forEach((field) => {
				if (field.type == "SINGLE_LINE_TEXT" || field.type == "MULTI_LINE_TEXT") {
					const hoverBtn = $('<button>')
						.text(`${field.label}(${field.code})`)
						.attr("value", field.code);
					customContextMenu.append(hoverBtn);
					hoverBtn.on('click', async function () {
						let clickedValue = $(this).attr('value');
						if (clickedTextarea.hasClass("systemRole") || clickedTextarea.hasClass("promptContent")) {
							let currentRow = clickedTextarea.closest('tr');
							currentRow.find('.promptContent').removeClass('validation-error');
							currentRow.find('.systemRole').removeClass('validation-error');
							let cursorPosition = clickedTextarea.prop("selectionStart");
							let selectedValuePlaceholder = `{%${clickedValue}%}`;
							let newValue = clickedTextarea.val().slice(0, cursorPosition) + selectedValuePlaceholder + clickedTextarea.val().slice(cursorPosition);
							clickedTextarea.val(newValue);
							let newCursorPosition = cursorPosition + selectedValuePlaceholder.length;
							clickedTextarea.prop("selectionStart", newCursorPosition).prop("selectionEnd", newCursorPosition);
						}
					});
				}
			});
			$('body').append(customContextMenu);

			$(document).on('click.customContextMenu', function (elements) {
				if (!customContextMenu.is(elements.target) && customContextMenu.has(elements.target).length === 0) {
					customContextMenu.remove();
					$(document).off('click.customContextMenu');
				}
			});
			customContextMenu.on('mouseleave', function () {
				customContextMenu.remove();
			});
		});

		// control input box maxToken
		$('.maxToken').on('input', function () {
			this.value = this.value.replace(/[^0-9]/g, '');
			if (this.value.startsWith('0') && this.value.length > 1) {
				this.value = this.value.replace(/^0+/, '');
			}
		});

		//toggle version(chat gpt or azure)
		$(".platForm").change(function () {
			let selectedValue = $(this).val();
			if (selectedValue == "Chat_GPT") {
				$('.modelVersion-ChatGPT').show();
				$('.system-role').hide();
				$('.azureComponent').hide();
				$('.azureComponent input').val('');
				$('.system-role textarea').val('');
			} else {
				$('.modelVersion-ChatGPT').hide();
				$('.system-role').show();
				$('.azureComponent').show();
			}
		});

		//remove class validation-error from AI setting
		$(".resourceName, .deploymentID, .apiVersion, .apiKey, .maxToken").change(function () {
			$(this).removeClass('validation-error');
		});

		//remove class validation-error from space for prompt template and button
		$(".spaceForPromptTemplate").change(function () {
			$(this).closest('tr').find('.spaceForPromptTemplate').removeClass('validation-error');
		}); $(".storeFields").change(function () {
			$(this).closest('tr').find('.storeFields').removeClass('validation-error');
		}); $(".spaceForButton").change(function () {
			$(this).closest('tr').find('.spaceForButton').removeClass('validation-error');
		}); $(".labelForPromptTemplate").change(function () {
			$(this).closest('tr').find('.labelForPromptTemplate').removeClass('validation-error');
		}); $(".labelForButton").change(function () {
			$(this).closest('tr').find('.labelForButton').removeClass('validation-error');
		});

		//remove class validation-error from setting prompt template
		$(".settingName").change(function () {
			$(this).closest('tr').find('.settingName').removeClass('validation-error');
		}); $(".spacePromptTemplate").change(function () {
			$(this).closest('tr').find('.spacePromptTemplate').removeClass('validation-error');
		}); $(".spaceButton").change(function () {
			$(this).closest('tr').find('.spaceButton').removeClass('validation-error');
		}); $(".fieldResult").change(function () {
			$(this).closest('tr').find('.fieldResult').removeClass('validation-error');
		}); $(".promptContent").change(function () {
			$(this).closest('tr').find('.promptContent').removeClass('validation-error');
		}); $(".systemRole").change(function () {
			$(this).closest('tr').find('.systemRole').removeClass('validation-error');
		});

		// when storeFields has change
		$(".storeFields").change(function () {
			HASUPDATED = false;
		});

		// when spaceForPromptTemplate is has changed
		$(".spaceForPromptTemplate").change(function () {
			HASUPDATED = false;
		});

		$(".labelForPromptTemplate").change(function () {
			HASUPDATED = false;
		});

		$(".labelForButton").change(function () {
			HASUPDATED = false;
		});

		// Export function
		$("#Export").on('click', async function () {
			Swal10.fire({
				customClass: {
					confirmButton: 'custom-confirm-button',
					cancelButton: 'custom-cancel-button'
				},
				position: "center",
				icon: "info",
				text: "設定情報を書き出ししますか？",
				confirmButtonColor: "#3498db",
				showCancelButton: true,
				cancelButtonColor: "#f7f9fa",
				confirmButtonText: "はい",
				cancelButtonText: "いいえ",
			}).then((result) => {
				if (result.isConfirmed) {
					let dataImport = getData();
					let blob = new Blob([JSON.stringify(dataImport)], { type: 'application/json' });
					let url = URL.createObjectURL(blob);
					let date = new Date();
					let year = date.getFullYear();
					let month = ('0' + (date.getMonth() + 1)).slice(-2);
					let day = ('0' + date.getDate()).slice(-2);
					let hours = ('0' + date.getHours()).slice(-2);
					let minutes = ('0' + date.getMinutes()).slice(-2);
					let formattedDateTime = `${year}-${month}-${day} ${hours}-${minutes}.json`;
					let elementDownload = $('<a>')
						.attr('href', url)
						.attr('download', formattedDateTime)
						.appendTo('body');
					elementDownload[0].click();
					elementDownload.remove();
				};
			});
		});

		// Import function
		$("#Import").on('click', function () {
			$("#fileInput").click();
		});
		$("#fileInput").on('change', function (event) {
			let file = event.target.files[0];
			if (file) {
				let reader = new FileReader();
				reader.onload = async (e) => {
					let fileContent = e.target.result;
					let dataImport;
					try {
						dataImport = JSON.parse(fileContent);
					} catch (error) {
						let customClass = $("<div></div>")
							.html(`設定情報を読み込むためのファイル形式はJSON形式になります。<br>  拡張子をご確認ください。`)
							.css("font-size", "14px");
						await Swal10.fire({
							icon: "error",
							html: customClass.prop("outerHTML"),
							confirmButtonColor: "#3498db",
						});

						$("#fileInput").val('');
						return;
					}

					let checkCompareConfig = await compareConfigStructures(dataImport);
					if (!checkCompareConfig) {
						$("#fileInput").val('');
						return;
					} else {
						await setInitialValue('import', dataImport);
						Swal10.fire({
							position: 'center',
							icon: 'success',
							text: '設定情報の読み込みに成功しました。',
							showConfirmButton: true,
						});
						$("#fileInput").val('');
					}
				};
				reader.readAsText(file);
			} else {
				Swal10.fire({
					position: "center",
					text: "インポートするファイルを選択してください。",
					confirmButtonColor: "#3498db",
					confirmButtonText: "OK",
				});
				$("#fileInput").val('');
			}
		});

		// function check structure and data import
		async function compareConfigStructures(dataImport) {
			let errorTexts = [];
			let configStructure = {
				platForm: 'string',
				modelVersion: 'string',
				apiKey: 'string',
				resourceName: 'string',
				deploymentID: 'string',
				apiVersion: 'string',
				maxToken: 'string',
				versionFromAI: 'array',
				spaceSetting: [
					{
						spaceForPromptTemplate: 'string',
						spaceForButton: 'string',
						storeField: 'string',
						labelForPromptTemplate: 'string',
						labelForButton: 'string',
					}
				],
				settingPromptTemplate: [
					{
						status: 'boolean',
						settingName: 'string',
						fieldResult: 'string',
						slide: 'string',
						spacePromptTemplate: 'string',
						spaceButton: 'string',
						systemInstruction: 'string',
						prompt: 'string'
					}
				]
			};

			function checkType(configStructure, dataImport) {
				if (Array.isArray(configStructure)) {
					if (!Array.isArray(dataImport)) {
						errorTexts.push("設定情報の読み込みしたデータは配列ではありません。");
						return false;
					}
					for (let item of dataImport) {
						if (!checkType(configStructure[0], item)) {
							errorTexts.push("配列要素の型が一致しません。");
							return false;
						}
					}
					return true;
				}

				if (typeof configStructure === 'object' && !Array.isArray(configStructure)) {
					if (typeof dataImport !== 'object' || Array.isArray(dataImport)) {
						errorTexts.push("設定情報の読み込みしたデータはオブジェクトではありません。");
						return false;
					}
					for (let key in configStructure) {
						if (!(key in dataImport)) {
							errorTexts.push(`${key} キーが見つかりません。`);
							return false;
						}
						if (!checkType(configStructure[key], dataImport[key])) {
							return false;
						}
					}
					for (let key in dataImport) {
						if (!(key in configStructure)) {
							return false;
						}
					}
					return true;
				}
				return true;
			}

			function checkRequiredFields(dataImport) {
				let settingPromptTemplateFields = ['status', 'settingName', 'fieldResult', 'slide', 'spacePromptTemplate', 'systemInstruction', 'prompt'];

				if (dataImport.spaceSetting.length === 0) {
					errorTexts.push(" spaceSettingが未入力です。");
					return false;
				}

				if (dataImport.settingPromptTemplate.length === 0) {
					errorTexts.push(" settingPromptTemplateが未入力です。");
					return false;
				}

				for (let template of dataImport.settingPromptTemplate) {
					for (let field of settingPromptTemplateFields) {
						if (field === 'status' && typeof template[field] !== 'boolean') {
							errorTexts.push(`settingPromptTemplateのstatusはブール型であるべきです。`);
							return false;
						}
					}
				}
				return true;
			}

			function checkAllCases(dataImport) {
				// Check if the object is empty
				if (Object.keys(dataImport).length === 0) {
					errorTexts.push(" オブジェクトが未入力です。");
					return false;
				}

				// Specific checks for required keys and data types
				if (!checkType(configStructure, dataImport)) {
					return false;
				}

				// Specific checks for required fields and non-empty arrays/objects
				if (!checkRequiredFields(dataImport)) {
					return false;
				}
				return true;
			}

			let isValid = checkAllCases(dataImport);
			if (!isValid) {
				let customClass = $("<div></div>")
					.text("設定情報の読み込みに失敗しました。")
					.css("font-size", "18px");

				let errors = errorTexts.join("<br>");
				let customClassText = $("<div></div>")
					.html(errors) // Use .html() to correctly handle the <br> tags
					.css("font-size", "14px");

				await Swal10.fire({
					icon: "error",
					title: customClass.prop("outerHTML"), // Get the outerHTML of the jQuery element
					html: customClassText.prop("outerHTML"),
					confirmButtonColor: "#3498db",
				});
				return false;
			}
			return true;
		}
	});
})(jQuery, Sweetalert2_10.noConflict(true), kintone.$PLUGIN_ID);



