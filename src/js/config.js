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
			// $("select#search_target").on('change', (e) => {
			// 	console.log(e.target.type);
			// })

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
		return {
			groupSetting,
			codeMasterSetting,
			searchContent
		};
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
				console.log('config', getConfig);
				getConfig.groupSetting.forEach((item) => {
					let rowForClone = $("#kintoneplugin-setting-tspace tr:first-child").clone(true).removeAttr("hidden");
					$("#kintoneplugin-setting-tspace tr:last-child").after(rowForClone);
					rowForClone.find("#name_marker").val(item.nameMarker);
					rowForClone.find("#group_name").val(item.groupName);
					rowForClone.find("#search_length").val(item.searchLength);
					rowForClone.find("#search_type").val(item.searchType);
					
				})

				getConfig.codeMasterSetting.forEach((item) => {
					let rowForClone = $("#kintoneplugin-setting-code-master tr:first-child").clone(true).removeAttr("hidden");
					$("#kintoneplugin-setting-code-master tr:last-child").after(rowForClone);
					rowForClone.find("#master_id").val(item.masterId);
					rowForClone.find("#app_id").val(item.appId);
					rowForClone.find("#api_token").val(item.apiToken);
					rowForClone.find("#type_field").val(item.typeField);
					rowForClone.find("#code_field").val(item.codeField);
					rowForClone.find("#name_field").val(item.nameField);
					
				})
				await updateData("initial");

				getConfig.searchContent.forEach((item) => {
					let rowForClone = $("#kintoneplugin-setting-prompt-template tr:first-child").clone(true).removeAttr("hidden");
					$("#kintoneplugin-setting-prompt-template tr:last-child").after(rowForClone);
					rowForClone.find("#group_name_ref").val(item.groupName);
					rowForClone.find("#search_name").val(item.searchName);
					rowForClone.find("#api_master_id_ref").val(item.masterId);
					rowForClone.find("#search_target").val(item.searchTarget);
					rowForClone.find("#field_for_search").val(item.fieldForSearch);
					
				})
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

	async function updateData(condition) {
		let getValueUpdated = await getData();
			console.log(getValueUpdated);
			let hassError = await validation("update");
			// let valueValidation = true;
			let dataLost = false;
			if (!hassError) {
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
				$('#kintoneplugin-setting-prompt-template > tr').each(function () {
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
				HASUPDATED = true;
				if (condition == "initial" || condition == "import") return;
				Swal10.fire({
					position: 'center',
					icon: 'success',
					text: 'プラグイン設定が更新されました。',
					showConfirmButton: true,
				});
				
			}
	}

	// validate update function.
	async function validation(condition) {
		let hasError = false;
		let errorMessage = "";
		//group setting table
		$('#kintoneplugin-setting-tspace > tr:gt(0)').each(function (index) {
			let groupName = $(this).find('#group_name');
			let searchType = $(this).find('#search_type');
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
				$(groupName).removeClass('validation-error');
			}
		});

		//code master table
		$('#kintoneplugin-setting-code-master > tr:gt(0)').each(function (index) {
			let appId = $(this).find('#app_id');
			let masterId = $(this).find('#master_id');
			if (!masterId.val()) {
				errorMessage += `<p>Please enter Master ID on Code master difinition row: ${index + 1}</p>`;
				$(masterId).addClass('validation-error');
				hasError = true;
			} else {
				$(masterId).removeClass('validation-error');
			}

			if (!appId.val()) {
				errorMessage += `<p>Please enter App ID on Code master difinition row: ${index + 1}</p>`;
				$(appId).addClass('validation-error');
				hasError = true;
			} else {
				$(appId).removeClass('validation-error');
			}
		});
		if (condition == "save") {
			$('#kintoneplugin-setting-prompt-template > tr:gt(0)').each(function (index) {
				let groupName = $(this).find('#group_name_ref');
				let searchName = $(this).find('#search_name');
				let targetFields = $(this).find('#search_target');
				if (!searchName.val()) {
					errorMessage += `<p>Please enter Search type on Search content row: ${index + 1}</p>`;
					$(searchName).addClass('validation-error');
					hasError = true;
				} else {
					$(searchName).removeClass('validation-error');
				}

				if (groupName.val() == "-----") {
					errorMessage += `<p>Please select Group name on Search content row: ${index + 1}</p>`;
					$(groupName).parent().addClass('validation-error');
					hasError = true;
				} else {
					$(groupName).parent().removeClass('validation-error');
				}

				if (targetFields.val() == "-----") {
					errorMessage += `<p>Please select Search target field on Search content row: ${index + 1}</p>`;
					$(targetFields).parent().addClass('validation-error');
					hasError = true;
				} else {
					$(targetFields).parent().removeClass('validation-error');
				}
			});
		}

		if (hasError) Swal10.fire({
			position: 'center',
			icon: 'error',
			html: errorMessage,
			showConfirmButton: true,
		});
		return hasError;
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
			let hasError = await validation("save");
			if (hasError) return;
			let createConfig = await getData();
			let config = JSON.stringify(createConfig);
			kintone.plugin.app.setConfig({ config }, () => {
				window.location.href = `../../flow?app=${kintone.app.getId()}#section=settings`;
			});
		});

		// button-update.
		$("#button-update").click(async ()=> {await updateData()});

		// button-load data.
		$("#load_data").click(async function () {
			window.RsComAPI.showSpinner();
			console.log($("#kintoneplugin-setting-code-master > tr:gt(0)"))
			let allResponse = [];
			let codeMasterTable = $("#kintoneplugin-setting-code-master > tr:gt(0)");
			let hasError = await validateLoadData(codeMasterTable);
			console.log('hasError', hasError);
			if (!hasError) {
				for (let row of codeMasterTable) {
					let appId = $(row).find('#app_id').val();
					let apiToken = $(row).find('#api_token').val();
					let body = { app: appId };

					if (!appId) continue;  // Skip if appId is not present

					if (apiToken) body.token = apiToken;

					let checkData = allResponse.filter(item => item.appId == appId);
					console.log('checkData', checkData);

					let response = [];
					if (checkData.length <= 0) {
						response = await kintone.api("/k/v1/preview/app/form/fields", "GET", {
							app: appId
						}).then(res => { return res.properties });
						allResponse.push({ appId, response });
					} else {
						console.log('get old');
						response = checkData[0].response;
					}
					console.log('response', response);

					// $(row).find('select#type_field').empty().append($('<option>').val('-----').text("-----"));
					$(row).find('select#code_field').empty().append($('<option>').val('-----').text("-----"));
					$(row).find('select#name_field').empty().append($('<option>').val('-----').text("-----"));
					// for (const item of response) {
					// 	console.log(item);
					// if (($(row).find('select#type_field option[value="' + item.type.value + '"]')).length <= 0) {
					// 	$(row).find('select#type_field').append(
					// 		$('<option>').attr("value", item.type.value).text(`${item.type.value}`)
					// 	);
					// }
					$(row).find('select#code_field').append(
						$('<option>').attr("value", response.code.code).text(`${response.code.code}`)
					);
					$(row).find('select#name_field').append(
						$('<option>').attr("value", response.name.code).text(`${response.name.code}`)
					);
					console.log('response', response);
				}
			}
			window.RsComAPI.hideSpinner();
		});

		$("button#recreate-button").on('click', async function () {
			// e.preventDefault();
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
			}

			window.RsComAPI.showSpinner();
			let fieldForSearch = $(currentRow).find('select#field_for_search').val();
			let latestValue = await getData();
			let records = await window.RsComAPI.getRecords({ app: kintone.app.getId() });

			let getGroupData = latestValue.groupSetting.filter(item => item.groupName == groupName);

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
					text: 'プラグイン設定が更新されました。',
					showConfirmButton: true,
				});
			} catch (error) {
				console.log(error);
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

		$("#resourceName, #deploymentID, #apiVersion, #apiKey, #platForm, #maxToken").on("change", function () {
			HASUPDATED = false;
		});

		

		// get version of chat gpt from api 
		async function validateLoadData(codeMasterTable) {
			let hasError = false;
			for (let row of codeMasterTable) {
				let appId = $(row).find('#app_id').val();
				if (!appId) {
					$(row).find('#app_id').addClass('validation-error');
					Swal10.fire({
						position: "center",
						icon: "error",
						text: "アプリIDが未入力です。",
						showConfirmButton: true,
					});
					hasError = true;
				} else {
					$(row).find('#app_id').removeClass('validation-error');
				}
			}
			return hasError;
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



