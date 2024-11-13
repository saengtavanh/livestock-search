jQuery.noConflict();
(async function ($, Swal10, PLUGIN_ID) {
	"use strict";
	let CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);
	let HASUPDATED = true;
	let HASLOADDATA = true;

	// Color picker dialog function
	const defaultColorPickerConfig = {
		opacity: false,
		doRender: false,
		buildCallback: function ($elm) {
			$elm.addClass('kintone-ui');

			const colorInstance = this.color;
			const colorPicker = this;

			$elm.prepend('<div class="cp-panel">' +
				'<div><label>R</label> <input type="number" max="255" min="0" class="cp-r" /></div>' +
				'<div><label>G</label> <input type="number" max="255" min="0" class="cp-g" /></div>' +
				'<div><label>B</label> <input type="number" max="255" min="0" class="cp-b" /></div>' +
				'<hr>' +
				'<div><label>H</label> <input type="number" max="360" min="0" class="cp-h" /></div>' +
				'<div><label>S</label> <input type="number" max="100" min="0" class="cp-s" /></div>' +
				'<div><label>V</label> <input type="number" max="100" min="0" class="cp-v" /></div>' +
				'</div>').on('change', 'input', function (e) {
					const value = this.value,
						className = this.className,
						type = className.split('-')[1],
						color = {};

					color[type] = value;
					colorInstance.setColor(type === 'HEX' ? value : color,
						type === 'HEX' ? 'HEX' : /(?:r|g|b)/.test(type) ? 'rgb' : 'hsv');
					colorPicker.render();
				});

			const buttons = $elm.append('<div class="cp-disp">' +
				'<button type="button" id="cp-submit">OK</button>' +
				'<button type="button" id="cp-cancel">Cancel</button>' +
				'</div>');

			buttons.on('click', '#cp-submit', (e) => {
				const colorCode = '#' + colorPicker.color.colors.HEX;

				$elm.css('border-bottom-color', colorCode);
				$elm.attr('value', colorCode);

				const $el = colorPicker.$trigger.parent('div').find('input[type="text"]');
				$el.val(colorCode);
				$el.css('color', colorCode);

				colorPicker.$trigger.css('border-bottom-color', colorCode);
				colorPicker.toggle(false);
			});

			buttons.on('click', '#cp-cancel', (e) => {
				colorPicker.toggle(false);
			});
		},
		renderCallback: function ($elm, toggled) {
			const colors = this.color.colors.RND;
			const colorCode = '#' + this.color.colors.HEX;

			const modes = {
				r: colors.rgb.r,
				g: colors.rgb.g,
				b: colors.rgb.b,
				h: colors.hsv.h,
				s: colors.hsv.s,
				v: colors.hsv.v,
				HEX: colorCode
			};

			$('input', '.cp-panel').each(function () {
				this.value = modes[this.className.substr(3)];
			});

			this.$trigger = $elm;
		},
		positionCallback: function ($elm) {
			this.color.setColor($elm.attr('value'));
		}
	};

	// get field from kintone app.
	let GETFIELD = await kintone.api("/k/v1/preview/app/form/fields", "GET", {
		app: kintone.app.getId()
	});

	// sort field.
	let FIELDFROMAPP = Object.values(GETFIELD.properties).sort((a, b) => {
		return a.code.localeCompare(b.code);
	});

	//function set value to config setting.
	async function setValueConfig() {
		return new Promise((resolve) => {
			const fieldType = ["SINGLE_LINE_TEXT", "MULTI_LINE_TEXT", "NUMBER", "CALC", "CHECK_BOX", "RADIO_BUTTON", "DROP_DOWN", "DATE", "DATETIME"];
			FIELDFROMAPP.forEach((items) => {
				if (fieldType.includes(items.type)) {
					$("select#search_target").append(
						$("<option>").attr("value", items.code).attr("type", items.type).text(`${items.label}(${items.code}) `)
					);
					if (items.type === "SINGLE_LINE_TEXT" || items.type === "MULTI_LINE_TEXT") {
						$("select#field_for_search").append(
							$("<option>").attr("value", items.code).text(`${items.label}(${items.code}) `)
						);
					}
				}
			});
			resolve();
		});
	}

	// function get data from table.
	async function getData() {
		//get value from space for prompt template and button.
		let groupSetting = $("#kintoneplugin-setting-tspace > tr:gt(0)").map(function () {
			let nameMarker = $(this).find("#name_marker").val();
			let groupName = $(this).find("#group_name").val();
			let searchLength = $(this).find("#search_length").val();
			let searchType = $(this).find("#search_type").val();
			return { nameMarker, groupName, searchLength, searchType };
		}).get();

		let codeMasterSetting = $("#kintoneplugin-setting-code-master > tr:gt(0)").map(function () {
			let masterId = $(this).find("#master_id").val();
			let appId = $(this).find("#app_id").val();
			let apiToken = $(this).find("#api_token").val();
			let codeField = $(this).find("#code_field").val();
			let nameField = $(this).find("#name_field").val();
			let typeField = $(this).find("#type_field").val();
			return { masterId, appId, apiToken, codeField, nameField, typeField };
		}).get();

		let searchContent = $("#kintoneplugin-setting-prompt-template > tr:gt(0)").map(function () {
			let groupName = $(this).find("#group_name_ref").val();
			let searchName = $(this).find("#search_name").val();
			let masterId = $(this).find("#master_id_ref").val();
			let searchTarget = $(this).find("#search_target").val();
			let fieldForSearch = $(this).find("#field_for_search").val();
			return { groupName, searchName, masterId, searchTarget, fieldForSearch };
		}).get();

		let colorSetting = {
			titleColor: $("#title-color").val(),
			buttonColor: $("#button-color").val(),
			buttonTextColor: $("#button-text-color").val(),
		}
		return {
			groupSetting,
			codeMasterSetting,
			searchContent,
			colorSetting
		};
	}

	async function setValueToTable(getConfig) {
		getConfig.groupSetting.forEach((item) => {
			let rowForClone = $("#kintoneplugin-setting-tspace tr:first-child").clone(true).removeAttr("hidden");
			$("#kintoneplugin-setting-tspace tr:last-child").after(rowForClone);
			rowForClone.find("#name_marker").val(item.nameMarker);
			rowForClone.find("#group_name").val(item.groupName);
			rowForClone.find("#search_length").val(item.searchLength);
			rowForClone.find("#search_type").val(item.searchType);

		})

		let allResponse = [];
		for (const item of getConfig.codeMasterSetting) {
			let rowForClone = $("#kintoneplugin-setting-code-master tr:first-child").clone(true).removeAttr("hidden");
			$("#kintoneplugin-setting-code-master tr:last-child").after(rowForClone);
			let appId = item.appId;
			if (!appId) continue;
			let apiToken = item.apiToken;
			let body = { app: appId };
			if (apiToken) body.token = apiToken;
			let checkData = allResponse.filter(item => item.appId == appId);
			let response = [];
			let selectedCode = item.codeField;
			let selectedName = item.nameField;
			try {
				if (checkData.length <= 0) {
					response = await kintone.api("/k/v1/preview/app/form/fields", "GET", {
						app: appId
					}).then(res => { return res.properties });
					allResponse.push({ appId, response });
				} else {
					response = checkData[0].response;
				}

				$(rowForClone).find('select#code_field').empty().append($('<option>').val('-----').text("-----"));
				$(rowForClone).find('select#name_field').empty().append($('<option>').val('-----').text("-----"));
				$(rowForClone).find('select#code_field').append(
					$('<option>').attr("value", response.code.code).text(`${response.code.code}`)
				);
				$(rowForClone).find('select#name_field').append(
					$('<option>').attr("value", response.name.code).text(`${response.name.code}`)
				);
				// Check to see if not same value is set "-----".
				if ($(rowForClone).find('select#code_field option[value="' + selectedCode + '"]').length == 0) {
					selectedCode = "-----";
				}
				if ($(rowForClone).find('select#name_field option[value="' + selectedName + '"]').length == 0) {
					selectedName = "-----";
				}

				// Set to the value selected.
				$(rowForClone).find('select#code_field').val(selectedCode);
				$(rowForClone).find('select#name_field').val(selectedName);
				$(rowForClone).find("#master_id").val(item.masterId);
				$(rowForClone).find("#app_id").val(item.appId);
				$(rowForClone).find("#api_token").val(item.apiToken);
				$(rowForClone).find("#type_field").val(item.typeField);
			} catch (error) {
				throw new Error("Cannot find code master app");
			}
		}
		await updateData("initial");

		getConfig.searchContent.forEach((item) => {
			let rowForClone = $("#kintoneplugin-setting-prompt-template tr:first-child").clone(true).removeAttr("hidden");
			$("#kintoneplugin-setting-prompt-template tr:last-child").after(rowForClone);
			rowForClone.find("#group_name_ref").val(item.groupName);
			rowForClone.find("#search_name").val(item.searchName);
			// rowForClone.find("#master_id_ref").val(item.masterId);
			rowForClone.find("#search_target").val(item.searchTarget);
			rowForClone.find("#field_for_search").val(item.fieldForSearch);

			if ($(rowForClone).find('select#master_id_ref option[value="' + item.masterId + '"]').length == 0) {
				rowForClone.find("#master_id_ref").val("-----");
			} else {
				rowForClone.find("#master_id_ref").val(item.masterId);
			}

		})

		//set color
		$("#title-color").val(getConfig.colorSetting.titleColor).css("color", getConfig.colorSetting.titleColor);
		$("#button-color").val(getConfig.colorSetting.buttonColor).css("color", getConfig.colorSetting.buttonColor);
		$("#button-text-color").val(getConfig.colorSetting.buttonTextColor).css("color", getConfig.colorSetting.buttonTextColor);
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
				$("#kintoneplugin-setting-tspace tr:first-child").after(
					$("#kintoneplugin-setting-tspace tr:first-child").clone(true).removeAttr("hidden")
				)
				HASUPDATED = false;
				checkRow();
				return;
			} else {
				getConfig = JSON.parse(CONFIG.config);
				await setValueToTable(getConfig);
			}
		} else {
			// Clear all rows except the first row of table space for prompt template and button and table setting prompt template.
			$("#kintoneplugin-setting-tspace > tr:not(:first)").remove();
			$("#kintoneplugin-setting-code-master > tr:not(:first)").remove();
			$("#kintoneplugin-setting-prompt-template > tr:not(:first)").remove();
			HASUPDATED = false;
			getConfig = setInitial;

			await setValueToTable(getConfig);
		}
		checkRow();
		checkRecreateButton();
		checkMasterId();
	}

	//check recreate button function
	function checkRecreateButton() {
		$('#kintoneplugin-setting-prompt-template > tr:gt(0)').each(function (index) {
			let fieldForSearch = $(this).find('#field_for_search');
			if (fieldForSearch.val() == "-----") {
				$(this).find('#recreate-button').hide();
			} else {
				$(this).find('#recreate-button').show();
			}
		});
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

	async function updateData(condition) {
		if (HASLOADDATA === false) return Swal10.fire({
			position: 'center',
			icon: 'warning',
			text: "please click load data button",
			showConfirmButton: true,
		})
		let getValueUpdated = await getData();
		let hassError = await validation("update", getValueUpdated);
		if (!hassError) {

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
			$('#kintoneplugin-setting-prompt-template > tr').each(function () {
				let row = $(this); // Store the current row in a jQuery object.
				// Get the selected values from the dropdowns space for button and space for prompt template.
				let selectedGroupName = row.find('select#group_name_ref').val();
				let selectedMasterId = row.find('select#master_id_ref').val();

				// Clear the value and set to default value.
				row.find('select#group_name_ref').empty().append($('<option>').val('-----').text("-----"));
				row.find('select#master_id_ref').empty().append($('<option>').val('-----').text("-----"));
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
				}
				if (row.find('select#master_id_ref option[value="' + selectedMasterId + '"]').length == 0) {
					selectedMasterId = "-----";
				}

				// Set to the value selected.
				row.find('select#group_name_ref').val(selectedGroupName);
				row.find('select#master_id_ref').val(selectedMasterId);
			});
			HASUPDATED = true;
			if (condition == "initial" || condition == "import") return;
			Swal10.fire({
				position: 'center',
				icon: 'success',
				text: 'Update data successfully',
				showConfirmButton: true,
			});

		}
	}

	// validate update function.
	async function validation(condition, data) {
		let hasError = false;
		let errorMessage = "";
		//group setting table
		let groupSettingTable = $('#kintoneplugin-setting-tspace > tr:gt(0)').toArray();
		let groupNameArray = [];
		let masterIdArray = [];
		let fieldForSearchArray = [];
		for (const [index, element] of groupSettingTable.entries()) {
			let groupName = $(element).find('#group_name');
			let searchType = $(element).find('#search_type');
			if (searchType.val() == "-----") {
				errorMessage += `<p>Please select Search type on Group setting row: ${index + 1}</p>`;
				$(searchType).parent().addClass('validation-error');
				hasError = true;
			} else {
				$(searchType).parent().removeClass('validation-error');
			}

			if (!groupName.val()) {
				errorMessage += `<p>Please enter Group name on Group setting row: ${index + 1}</p>`;
				$(groupName).addClass('validation-error');
				hasError = true;
			} else {
				if (!groupNameArray.includes(groupName.val().trim())) {
					$(groupName).removeClass('validation-error');
					groupNameArray.push(groupName.val());
				} else {
					$(groupName).addClass('validation-error');
					errorMessage += `<p>The group "${groupName.val()}" already exists.</p>`;
					hasError = true;
				}
			}
		}

		const codeMasterTable = $('#kintoneplugin-setting-code-master > tr:gt(0)').toArray();
		//code master table
		for (const [index, element] of codeMasterTable.entries()) {
			let appId = $(element).find('#app_id');
			let masterId = $(element).find('#master_id');
			let condition = $(element).find('#type_field');
			let code = $(element).find('#code_field');
			let name = $(element).find('#name_field');
			if (!masterId.val()) {
				// errorMessage += `<p>Please enter Master ID on Code master difinition row: ${index + 1}</p>`;
				// $(masterId).addClass('validation-error');
				// hasError = true;
			} else {
				// $(masterId).removeClass('validation-error');
				if (!masterIdArray.includes(masterId.val().trim())) {
					$(masterId).removeClass('validation-error');
					masterIdArray.push(masterId.val());
				} else {
					$(masterId).addClass('validation-error');
					errorMessage += `<p>Master ID "${masterId.val()}" already exists.</p>`;
					hasError = true;
				}
			}

			// if (!appId.val()) {
			// 	errorMessage += `<p>Please enter App ID on Code master difinition row: ${index + 1}</p>`;
			// 	$(appId).addClass('validation-error');
			// 	hasError = true;
			// } else {
			// 	$(appId).removeClass('validation-error');
			// }

			// if (!condition.val()) {
			// 	errorMessage += `<p>Please enter Condition on Code master difinition row: ${index + 1}</p>`;
			// 	$(condition).addClass('validation-error');
			// 	hasError = true;
			// } else {
			// 	$(condition).removeClass('validation-error');
			// }

			// if (code.val() == "-----") {
			// 	errorMessage += `<p>Please select Code on Code master difinition row: ${index + 1}</p>`;
			// 	$(code).parent().addClass('validation-error');
			// 	hasError = true;
			// } else {
			// 	$(code).parent().removeClass('validation-error');
			// }

			// if (name.val() == "-----") {
			// 	errorMessage += `<p>Please select Name on Code master difinition row: ${index + 1}</p>`;
			// 	$(name).parent().addClass('validation-error');
			// 	hasError = true;
			// } else {
			// 	$(name).parent().removeClass('validation-error');
			// }


		}
		if (condition == "save" || condition == "export") {
			const searchContentTable = $('#kintoneplugin-setting-prompt-template > tr:gt(0)').toArray();
			let searchNameArray = [];
			for (const [index, element] of searchContentTable.entries()) {

				let groupName = $(element).find('#group_name_ref');
				let searchName = $(element).find('#search_name');
				let targetFields = $(element).find('#search_target');
				let fieldForSearch = $(element).find('#field_for_search');
				let masterId = $(element).find('#master_id_ref');
				let currentGroup = data.groupSetting.filter(item => item.groupName == groupName.val());

				// if (groupName.val() == "-----") {
				// 	errorMessage += `<p>Please select Group name on Search content row: ${index + 1}</p>`;
				// 	$(groupName).parent().addClass('validation-error');
				// 	hasError = true;
				// } else {
				// 	$(groupName).parent().removeClass('validation-error');
				// }

				if (!searchName.val()) {
					errorMessage += `<p>Please enter Search name on Search content row: ${index + 1}</p>`;
					$(searchName).addClass('validation-error');
					hasError = true;
				} else {
					// $(searchName).removeClass('validation-error');
					if (!searchNameArray.includes(searchName.val().trim())) {
						$(searchName).removeClass('validation-error');
						searchNameArray.push(searchName.val());
					} else {
						$(searchName).addClass('validation-error');
						errorMessage += `<p>Search name "${searchName.val()}" already exists.</p>`;
						hasError = true;
					}
				}

				if (targetFields.val() == "-----") {
					errorMessage += `<p>Please select Search target field on Search content row: ${index + 1}</p>`;
					$(targetFields).parent().addClass('validation-error');
					hasError = true;
				} else {
					let fieldType = $(element).find('#search_target option:selected').attr('type');
					$(targetFields).parent().removeClass('validation-error');

					if (masterId.val() != "-----"){
						if (fieldType == "SINGLE_LINE_TEXT" || fieldType == "MULTI_LINE_TEXT" || fieldType == "NUMBER"){
							$(targetFields).parent().removeClass('validation-error');
						}else {
							errorMessage += `<p>Field "${targetFields.val()}" is not type text.</p>`;
							$(targetFields).parent().addClass('validation-error');
							hasError = true;
						}
						
					}else {
						if (currentGroup.length > 0 && (currentGroup[0].searchType == "number_range" || currentGroup[0].searchType == "number_exact")) {
							if (fieldType == "NUMBER" || fieldType == "CALC") {
								$(targetFields).parent().removeClass('validation-error');
							} else {
								errorMessage += `<p>Field "${targetFields.val()}" is not number type.</p>`;
								$(targetFields).parent().addClass('validation-error');
								hasError = true;
							}
						} else if (currentGroup.length > 0 && (
							currentGroup[0].searchType == "text_initial" ||
							currentGroup[0].searchType == "text_patial" ||
							currentGroup[0].searchType == "text_exact" ||
							currentGroup[0].searchType == "multi_text_initial" ||
							currentGroup[0].searchType == "multi_text_patial"
						)) {
							if (fieldType == "SINGLE_LINE_TEXT" || fieldType == "MULTI_LINE_TEXT") {
								$(targetFields).parent().removeClass('validation-error');
							} else {
								errorMessage += `<p>Field "${targetFields.val()}" is not type text.</p>`;
								$(targetFields).parent().addClass('validation-error');
								hasError = true;
							}
						} else if (currentGroup.length > 0 && (
							currentGroup[0].searchType == "date_exact" ||
							currentGroup[0].searchType == "date_range"
						)) {
							if (fieldType == "DATE" || fieldType == "DATETIME") {
								$(targetFields).parent().removeClass('validation-error');
							} else {
								errorMessage += `<p>Field "${targetFields.val()}" is not type date.</p>`;
								$(targetFields).parent().addClass('validation-error');
								hasError = true;
							}
						} else if (currentGroup.length > 0 && (
							currentGroup[0].searchType == "dropdown_exact"
						))  {
							if (fieldType == "CHECK_BOX" || fieldType == "RADIO_BUTTON" || fieldType == "DROP_DOWN") {
								$(targetFields).parent().removeClass('validation-error');
							} else {
								errorMessage += `<p>Field "${targetFields.val()}" is not support for this type.</p>`;
								$(targetFields).parent().addClass('validation-error');
								hasError = true;
							}
						}
					}
				}

				if (fieldForSearch.val() != "-----") {
					switch (currentGroup.length > 0 && currentGroup[0].searchType) {
						case "number_exact":
						case "number_range":
						case "date_exact":
						case "date_range":
						case "dropdown_exact":
							$(fieldForSearch).parent().addClass('validation-error');
							hasError = true;
							errorMessage += `<p>Search type "${currentGroup[0].searchType} is can not select field for search"</p>`;
							break;

						default:
							$(fieldForSearch).parent().removeClass('validation-error');
							if (!fieldForSearchArray.includes(fieldForSearch.val().trim())) {
								$(fieldForSearch).parent().removeClass('validation-error');
								fieldForSearchArray.push(fieldForSearch.val());
							} else {
								$(fieldForSearch).parent().addClass('validation-error');
								errorMessage += `<p>Field "${fieldForSearch.val()}" already exists.</p>`;
								hasError = true;
							}
							break;
					}
				} else {
					$(fieldForSearch).parent().removeClass('validation-error');
					if (currentGroup.length > 0 && (currentGroup[0].searchType == "text_initial" || currentGroup[0].searchType == "multi_text_initial")) {
						errorMessage += `<p>Please select Field for search on Search content row: ${index + 1}</p>`;
						$(fieldForSearch).parent().addClass('validation-error');
						hasError = true;
					}
				}

			}
		}

		if (hasError) Swal10.fire({
			position: 'center',
			icon: 'error',
			html: errorMessage,
			showConfirmButton: true,
		});
		return hasError;
	}

	async function checkMasterId() {
		let data = await getData();
		const searchContentTable = $('#kintoneplugin-setting-prompt-template > tr:gt(0)').toArray();
		for (const [index, element] of searchContentTable.entries()) {
			let groupName = $(element).find('#group_name_ref');
			if (groupName.val() != "-----") {
				let currentGroup = data.groupSetting.filter(item => item.groupName == groupName.val());
				if (currentGroup[0].searchType == "dropdown_exact") {
					$(element).find('select#master_id_ref').prop('disabled', false).parent().removeClass('disabled-select');
				} else {
					$(element).find('select#master_id_ref').val('-----').prop('disabled', true).parent().addClass('disabled-select');
				}
			} else {
				$(element).find('select#master_id_ref').prop('disabled', true).parent().addClass('disabled-select');
			}

		}
	}

	//function start when open the plugin.
	$(document).ready(function () {
		window.RsComAPI.showSpinner();
		setValueConfig().then(() => {
			return setInitialValue('setInitial');
		}).then(() => {
			window.RsComAPI.hideSpinner();
		});
		// Color Picker
		const colorPickerTitle = $('#font-color-picker-title-icon').colorPicker(defaultColorPickerConfig);
		const colorPickerButton = $('#bg-color-picker-button-icon').colorPicker(defaultColorPickerConfig);
		const colorPickerButtonText = $('#font-color-picker-button-text-icon').colorPicker(defaultColorPickerConfig);

		$(document).keyup((event) => {
			const TAB_KEY_CODE = 9;
			const ENTER_KEY_CODE = 13;
			const ESC_KEY_CODE = 27;
			if (event.keyCode === TAB_KEY_CODE || event.keyCode === ENTER_KEY_CODE || event.keyCode === ESC_KEY_CODE) {
				colorPickerTitle.colorPicker.toggle(false);
				colorPickerButton.colorPicker.toggle(false);
				colorPickerButtonText.colorPicker.toggle(false);
			}
		});

		// Set color when input text change
		$("#title-color").change(function () {
			$(this).css('color', $(this).val());
		});
		$("#button-color").change(function () {
			$(this).css('color', $(this).val());
		});
		$("#button-text-color").change(function () {
			$(this).css('color', $(this).val());
		});

		$('#kintoneplugin-setting-body tbody, #kintoneplugin-setting-code-master, #kintoneplugin-setting-tspace').sortable({
			handle: '.drag-icon',  // Restrict dragging to the drag icon (bars)
			items: 'tr:not([hidden])', // Ensure only visible rows can be dragged
			cursor: 'move',
			placeholder: 'ui-state-highlight',
			axis: 'y'
		});

		// button save.
		$('#button_save').on('click', async function () {
			if (HASUPDATED === false) return Swal10.fire({
				position: 'center',
				icon: 'warning',
				text: "please click update button",
				showConfirmButton: true,
			})
			let createConfig = await getData();
			let hasError = await validation("save", createConfig);
			if (hasError) return;
			let config = JSON.stringify(createConfig);
			kintone.plugin.app.setConfig({ config }, () => {
				window.location.href = `../../flow?app=${kintone.app.getId()}#section=settings`;
			});
		});

		// button-update.
		$("#button-update").click(async () => { await updateData() });

		// button-load data.
		$("#load_data").click(async function () {
			window.RsComAPI.showSpinner();
			let allResponse = [];
			let codeMasterTable = $("#kintoneplugin-setting-code-master > tr:gt(0)");
			let hasError = await validateLoadData(codeMasterTable);
			if (!hasError) {
				try {
					for (let row of codeMasterTable) {
						let appId = $(row).find('#app_id').val();
						let apiToken = $(row).find('#api_token').val();
						let body = { app: appId };
						let selectedCode = $(row).find('select#code_field').val();
						let selectedName = $(row).find('select#name_field').val();
						if (!appId) continue;  // Skip if appId is not present
						if (apiToken) body.token = apiToken;
						let checkData = allResponse.filter(item => item.appId == appId);
						let response = [];
						try {
							if (checkData.length <= 0) {
								response = await kintone.api("/k/v1/preview/app/form/fields", "GET", {
									app: appId
								}).then(res => { return res.properties });
								allResponse.push({ appId, response });
							} else {
								response = checkData[0].response;
							}

							$(row).find('select#code_field').empty().append($('<option>').val('-----').text("-----"));
							$(row).find('select#name_field').empty().append($('<option>').val('-----').text("-----"));
							$(row).find('select#code_field').append(
								$('<option>').attr("value", response.code.code).text(`${response.code.code}`)
							);
							$(row).find('select#name_field').append(
								$('<option>').attr("value", response.name.code).text(`${response.name.code}`)
							);
							// Check to see if not same value is set "-----".
							if ($(row).find('select#code_field option[value="' + selectedCode + '"]').length == 0) {
								selectedCode = "-----";
							}
							if ($(row).find('select#name_field option[value="' + selectedName + '"]').length == 0) {
								selectedName = "-----";
							}

							// Set to the value selected.
							$(row).find('select#code_field').val(selectedCode);
							$(row).find('select#name_field').val(selectedName);
						} catch (error) {
							throw new Error("Cannot find code master app");
						}
					}
					Swal10.fire({
						position: 'center',
						icon: 'success',
						text: "Load data successfully",
						showConfirmButton: true,
					})
					HASLOADDATA = true;
				} catch (error) {
					HASLOADDATA = false;
					window.RsComAPI.hideSpinner();
					Swal10.fire({
						position: 'center',
						icon: 'error',
						text: error,
						showConfirmButton: true,
					})
				}
			}

			window.RsComAPI.hideSpinner();
		});

		$("button#recreate-button").on('click', async function () {
			let data = await getData();
			let currentRow = $(this).closest('tr');
			let targetField = $(currentRow).find('select#search_target').val();
			let groupName = $(currentRow).find('select#group_name_ref').val();
			//check group name and target field
			if (groupName == "-----" && targetField == "-----") {
				$(currentRow).find('select#group_name_ref').parent().addClass('validation-error');
				$(currentRow).find('select#search_target').parent().addClass('validation-error');
				return Swal10.fire({
					position: 'center',
					icon: 'error',
					text: "please select group name and target field",
					showConfirmButton: true,
				})
			} else {
				$(currentRow).find('select#group_name_ref').parent().removeClass('validation-error');
				$(currentRow).find('select#search_target').parent().removeClass('validation-error');
			}

			//check group name 
			if (groupName == "-----") {
				$(currentRow).find('select#group_name_ref').parent().addClass('validation-error');
				return Swal10.fire({
					position: 'center',
					icon: 'error',
					text: "please select group name",
					showConfirmButton: true,
				})
			} else {
				$(currentRow).find('select#group_name_ref').parent().removeClass('validation-error');
				let currentGroup = data.groupSetting.filter(item => item.groupName == groupName);
				let searchType = currentGroup[0].searchType;
				if (searchType != "text_initial" && searchType != "text_patial" && searchType != "text_exact"&& searchType != "multi_text_initial" && searchType != "multi_text_patial"){
					return Swal10.fire({
				    position: 'center',
				    icon: 'error',
				    text: "this group name does not support recreation",
				    showConfirmButton: true,
				  })
				}
			}

			//check target field
			if (targetField == "-----") {
				$(currentRow).find('select#search_target').parent().addClass('validation-error');
				return Swal10.fire({
					position: 'center',
					icon: 'error',
					text: "please select target field",
					showConfirmButton: true,
				})
			} else {
				$(currentRow).find('select#search_target').parent().removeClass('validation-error');
				let fieldType = $(currentRow).find('select#search_target option:selected').attr('type');
				if (fieldType == "SINGLE_LINE_TEXT" || fieldType == "MULTI_LINE_TEXT") {
					$(currentRow).find('select#search_target').parent().removeClass('validation-error');
				} else {
					$(currentRow).find('select#search_target').parent().addClass('validation-error');
					return Swal10.fire({
						position: 'center',
						icon: 'error',
						text: "Recreation is not supported by the target field type",
						showConfirmButton: true,
					})
				}
			}

			window.RsComAPI.showSpinner();
			let fieldForSearch = $(currentRow).find('select#field_for_search').val();
			let latestValue = await getData();
			let records = await window.RsComAPI.getRecords({ app: kintone.app.getId() });

			let getGroupData = latestValue.groupSetting.filter(item => item.groupName == groupName);

			let updateRecords = [];
			for (let record of records) {
				let targetValue = record[targetField].value;
				if (targetValue == "" || targetField == undefined) continue;
				let convertedValue = "";

				switch (getGroupData[0].searchType) {
					case "text_initial":
					case "multi_text_initial":
						convertedValue = `_,${targetValue.split('').join(',')}`
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
			try {
				await kintone.api(kintone.api.url('/k/v1/records.json', true), 'PUT', body);
				Swal10.fire({
					position: 'center',
					icon: 'success',
					text: 'Recreate successfully',
					showConfirmButton: true,
				});
			} catch (error) {
				Swal10.fire({
					position: 'center',
					icon: 'error',
					text: error.message,
					showConfirmButton: true,
				});
			}
			window.RsComAPI.hideSpinner();
		});

		//hide and show recreate button
		$("select#field_for_search").on('change', (e) => {
			let currentRow = $(e.target).closest('tr');
			if (e.target.value == "-----") {
				$(currentRow).find('button#recreate-button').hide();
			} else {
				$(currentRow).find('button#recreate-button').show();
			}
		})

		$("#name_marker, #group_name, #search_length").on("input", function () {
			HASUPDATED = false;
		});

		//input ASCII format only
		$("#master_id").on("input", function () {
			HASUPDATED = false;
			$(this).val($(this).val().replace(/[^ -~]/g, ''));
		});

		$("#search_type").on("change", function () {
			HASUPDATED = false;
		});
		$("#group_name_ref").on("change", function () {
			checkMasterId();
		});

		$("input#app_id").on("input", function () {
			$(this).val($(this).val().replace(/[^0-9]/g, ''));
			// HASLOADDATA = false;
		});

		$("input#group_name, input#search_length").on("input", function () {
			$(this).val($(this).val().replace(/[^a-zA-Z0-9\s]/g, ''));
		});

		// get version of chat gpt from api 
		async function validateLoadData(codeMasterTable) {
			let hasError = false;
			for (let row of codeMasterTable) {
				let appId = $(row).find('#app_id').val();
				if (!appId) {
					// $(row).find('#app_id').addClass('validation-error');
					Swal10.fire({
						position: "center",
						icon: "warning",
						text: "App ID has not been entered",
						showConfirmButton: true,
					});
					hasError = true;
				} 
				// else {
				// 	$(row).find('#app_id').removeClass('validation-error');
				// }
			}
			return hasError;
		}

		$(".cancel").on('click', async function () {
			Swal10.fire({
				position: "center",
				icon: "info",
				text: "Do you want to exit the plugin configuration?",
				confirmButtonColor: "#3498db",
				showCancelButton: true,
				cancelButtonColor: "#f7f9fa",
				confirmButtonText: "OK",
				cancelButtonText: "Cancel",
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
			let closestTable = $(this).closest("table");
			let closestTbody = $(this).closest("tbody");
			let clonedRow = closestTbody.find("tr").first().clone(true).removeAttr("hidden");
			if (closestTable.is("#kintoneplugin-setting-body")) slideUp.call(this);

			// Insert the cloned row after the current clicked row
			$(this).closest("tr").after(clonedRow);
			checkRow();
			checkRecreateButton();
			checkMasterId();
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


		// Export function
		$("#Export").on('click', async function () {
			Swal10.fire({
				customClass: {
					confirmButton: 'custom-confirm-button',
					cancelButton: 'custom-cancel-button'
				},
				position: "center",
				icon: "info",
				text: "Do you want to export configuration information?",
				confirmButtonColor: "#3498db",
				showCancelButton: true,
				cancelButtonColor: "#f7f9fa",
				confirmButtonText: "Yes",
				cancelButtonText: "Cancel",
			}).then(async (result) => {
				if (result.isConfirmed) {
					let hasError = await validation("export", await getData());
					if (hasError) return;
					let data = await getData();
					let blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
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
							.html(`The file format for reading configuration information is JSON format<br>  Please check the file format extension.`)
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
							text: 'Configuration information was successfully imported',
							showConfirmButton: true,
						});
						$("#fileInput").val('');
					}
				};
				reader.readAsText(file);
			} else {
				Swal10.fire({
					position: "center",
					text: "Select the file you want to import",
					confirmButtonColor: "#3498db",
					confirmButtonText: "OK",
				});
				$("#fileInput").val('');
			}
		});

		// function check structure and data import
		async function compareConfigStructures(dataImport) {
			if (dataImport.groupSetting && dataImport.groupSetting.length <= 0) return false;
			if (dataImport.codeMasterSetting && dataImport.codeMasterSetting.length <= 0) return false;
			if (dataImport.searchContent && dataImport.searchContent.length <= 0) return false;
			if (dataImport.colorSetting && dataImport.colorSetting.length <= 0) return false;
			let errorTexts = [];
			let configStructure = {
				groupSetting: [
					{
						nameMarker: "string",
						groupName: "string",
						searchLength: "string",
						searchType: "string"
					}
				],
				codeMasterSetting: [
					{
						masterId: "string",
						appId: "string",
						apiToken: "string",
						codeField: "string",
						nameField: "string",
						typeField: "string"
					}
				],
				searchContent: [
					{
						groupName: "string",
						searchName: "string",
						masterId: "string",
						searchTarget: "string",
						fieldForSearch: "string"
					}
				],
				colorSetting: {
					buttonColor: "string",
					buttonTextColor: "string",
					titleColor: "string",
				}
			}

			function checkType(configStructure, dataImport) {
				if (Array.isArray(configStructure)) {
					if (!Array.isArray(dataImport)) {
						errorTexts.push("The data loaded with configuration information is not an array");
						return false;
					}
					for (let item of dataImport) {
						if (!checkType(configStructure[0], item)) {
							errorTexts.push("Array element type mismatch");
							return false;
						}
					}
					return true;
				}

				if (typeof configStructure === 'object' && !Array.isArray(configStructure)) {
					if (typeof dataImport !== 'object' || Array.isArray(dataImport)) {
						// errorTexts.push("The data loaded with configuration information is not an object");
						return false;
					}
					for (let key in configStructure) {
						if (!(key in dataImport)) {
							// errorTexts.push(`${key} Key not found.`);
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

			function checkAllCases(dataImport) {
				// Check if the object is empty
				if (Object.keys(dataImport).length === 0) {
					// errorTexts.push(" オブジェクトが未入力です。");
					return false;
				}

				// Specific checks for required keys and data types
				if (!checkType(configStructure, dataImport)) {
					return false;
				}

				return true;
			}

			let isValid = checkAllCases(dataImport);
			if (!isValid) {
				let customClass = $("<div></div>")
					.text("Failed to load configuration information")
					.css("font-size", "18px");

				let errors = errorTexts.join("<br>");
				let customClassText = $("<div></div>")
					.html(errors) // Use .html() to correctly handle the <br> tags
					.css("font-size", "14px");

				// await Swal10.fire({
				// 	icon: "error",
				// 	title: customClass.prop("outerHTML"), // Get the outerHTML of the jQuery element
				// 	html: customClassText.prop("outerHTML"),
				// 	confirmButtonColor: "#3498db",
				// });
				await Swal10.fire({
					icon: "error",
					html: customClass.prop("outerHTML"),
					confirmButtonColor: "#3498db",
				});
				return false;
			}
			return true;
		}
	});
})(jQuery, Sweetalert2_10.noConflict(true), kintone.$PLUGIN_ID);


