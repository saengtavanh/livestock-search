(async function (PLUGIN_ID) {
  const config = {
    search_displays: [
      // {
      //   name_marker: "TextInitial",
      //   group_name: "TextInitial",
      //   search_length: "1rem 10px",
      //   search_type: "text_initial"
      // },
      // {
      //   name_marker: "textPartial",
      //   group_name: "textPartial",
      //   search_length: "1rem 10px",
      //   search_type: "text_partial"
      // },
      // {
      //   name_marker: "textExact",
      //   group_name: "textExact",
      //   search_length: "1rem 10px",
      //   search_type: "text_exact"
      // },
      // {
      //   name_marker: "MultiTextInitial",
      //   group_name: "MultiTextInitial",
      //   search_length: "1rem 10px",
      //   search_type: "MultiText_initial"
      // },
      // {
      //   name_marker: "MultiTextPartial",
      //   group_name: "MultiTextPartial",
      //   search_length: "1rem 10px",
      //   search_type: "MultiText_Partial"
      // },
      // {
      //   name_marker: "NumberExact",
      //   group_name: "NumberExact",
      //   search_length: "1rem 10px",
      //   search_type: "Number_Exact"
      // },
      // {
      //   name_marker: "NumberRange",
      //   group_name: "NumberRange",
      //   search_length: "1rem 10px",
      //   search_type: "Number_Range"
      // },
      // {
      //   name_marker: "DateExact",
      //   group_name: "DateExact",
      //   search_length: "1rem 10px",
      //   search_type: "Date_Exact"
      // },
      // {
      //   name_marker: "DateRange",
      //   group_name: "DateRange",
      //   search_length: "1rem 10px",
      //   search_type: "Date_Range"
      // },
      {
        name_marker: "DropdownExact",
        group_name: "DropdownExact",
        search_length: "1rem 10px",
        search_type: "Dropdown_Exact"
      },
      {
        name_marker: "",
        group_name: "DropdownExactEmpy",
        search_length: "1rem 10px",
        search_type: "Dropdown_Exact"
      },
      {
        name_marker: "DropdownExactTest",
        group_name: "DropdownExactTest",
        search_length: "1rem 10px",
        search_type: "Dropdown_Exact"
      },
    ],
    search_content: [
      {
        group_name: "TextInitial",
        search_name: "food",
        code_master_id: "",
        target_field: "TextInitialCode",
        field_for_search: "foodSearch"
      },
      {
        group_name: "textPartial",
        search_name: "food1",
        code_master_id: "",
        target_field: "textPartialCode",
        field_for_search: "foodSearch"
      },
      {
        group_name: "textExact",
        search_name: "food12",
        code_master_id: "",
        target_field: "textExactCode",
        field_for_search: "foodSearch"
      },
      {
        group_name: "MultiTextInitial",
        search_name: "food2134",
        code_master_id: "",
        target_field: "MultiTextInitialCode",
        field_for_search: "foodSearch"
      },
      {
        group_name: "MultiTextPartial",
        search_name: "food000",
        code_master_id: "",
        target_field: "MultiTextPartialCode",
        field_for_search: "foodSearch"
      },
      {
        group_name: "NumberExact",
        search_name: "food0033",
        code_master_id: "",
        target_field: "NumberExactCode",
        field_for_search: "foodSearch"
      },
      {
        group_name: "NumberRange",
        search_name: "food0033",
        code_master_id: "",
        target_field: "NumberRangeCode",
        field_for_search: "foodSearch"
      },
      {
        group_name: "DateExact",
        search_name: "food0033",
        code_master_id: "",
        target_field: "DateExactCode",
        field_for_search: "foodSearch"
      },
      {
        group_name: "DateRange",
        search_name: "food0033",
        code_master_id: "",
        target_field: "DateRangeCode",
        field_for_search: "foodSearch"
      },
      {
        group_name: "DropdownExact",
        search_name: "fark111",
        code_master_id: "",
        target_field: "TextInitialCode",
        field_for_search: "foodSearch"
      },
      {
        group_name: "DropdownExact",
        search_name: "fark000",
        code_master_id: "",
        target_field: "DropdownExact",
        field_for_search: "foodSearch"
      },
      {
        group_name: "DropdownExactEmpy",
        search_name: "fark999",
        code_master_id: "",
        target_field: "DropdownExact",
        field_for_search: "foodSearch"
      },
      {
        group_name: "DropdownExactEmpy",
        search_name: "fark888",
        code_master_id: "",
        target_field: "NumberExactCode",
        field_for_search: "foodSearch"
      },
      {
        group_name: "DropdownExactTest",
        search_name: "Test1",
        code_master_id: "",
        target_field: "DropdownExact",
        field_for_search: "foodSearch"
      },
      {
        group_name: "DropdownExactTest",
        search_name: "Test2",
        code_master_id: "",
        target_field: "TextInitialCode",
        field_for_search: "foodSearch"
      },
    ],
    code_master: [
      {
        master_id: "12345678",
        app_id: "",
        api_token: "",
        code_field: "",
        name_field: "",
        type: "",
      }
    ]
  };

  // Kintone event to show records
  kintone.events.on('app.record.index.show', async (event) => {
    const records = await window.RsComAPI.getRecords({ app: kintone.app.getId() });
    console.log("records", records);

    const spaceEl = kintone.app.getHeaderMenuSpaceElement();
    if (!spaceEl) throw new Error('The header element is unavailable on this page.');

    const $spaceEl = $(spaceEl)
    const $elementsAll = $('<div></div>').addClass('custom-space-el');

    // Create dropdowns based on the configuration
    function createDropDowns(config) {
      config.search_displays.forEach(display => {
        if (display.search_type === "Dropdown_Exact") {
          let relatedContent = config.search_content.filter(content => content.group_name === display.group_name);

          // Only show content if `name_marker` is not empty
          if (display.name_marker) {
            relatedContent = relatedContent.filter(content => content.group_name === display.group_name);
          }

          if (relatedContent.length > 0) {
            const $dropDownTitle = $("<label>")
              .text(display.name_marker ? display.group_name : relatedContent[0].search_name)
              .addClass('custom-dropdownTitle')
              .css({ cursor: display.name_marker ? "default" : "pointer" })
              .on("click", function () {
                handleDropDownTitleClick(display, config, relatedContent, $dropDownTitle);
              });
            const $dropDown = createDropDown(display, records, relatedContent[0], $dropDownTitle);
            const $elementDropdown = $('<div></div>').addClass('search-item').append($dropDownTitle, $dropDown);
            $elementsAll.append($elementDropdown)
          }
        }
      });
    }

    function handleDropDownTitleClick(display, config, relatedContent, $dropDownTitle) {
      if (display.name_marker === "") {
        $dropDownTitle.css({ cursor: "pointer" });
        // Check if the dropdown is already visible
        const existingMenu = $('.custom-context-menu');
        if (existingMenu.length > 0) {
          existingMenu.remove(); // Remove existing menu if it exists
          return; // Exit if you are closing the menu
        }

        // Filter items based on the group name
        const filteredItems = config.search_content.filter(content => content.group_name === display.group_name && !display.name_marker);
        const itemsList = filteredItems.map(content => content.search_name);

        // Create a custom context menu or container for buttons
        const customContextMenu = $('<div></div>')
          .addClass('custom-context-menu')
          .css({
            display: 'flex',
            'flex-direction': 'column',
            'align-items': 'center',
            margin: '10px',
            padding: '20px',
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
          const targetField = filteredItems[index].field_for_search; // Assuming you need the target field

          const hoverBtn = new Kuc.Button({
            text: buttonLabel,
            type: 'normal',
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

    // Handle dropdown title click
    // function handleDropDownTitleClick(display, config, relatedContent, $dropDownTitle) {
    //   if (display.name_marker === "") {
    //     $dropDownTitle.css({ cursor: "pointer" });
    //     const filteredItems = config.search_content.filter(content => content.group_name === display.group_name && !display.name_marker);
    //     const itemsList = filteredItems.map(content => content.search_name);

    //     const buttonsHTML = itemsList.map((item, index) =>
    //       `<button class="swal2-item-btn" data-index="${index}" style="display: flex; flex-direction: column; align-items: center; margin: 5px; background-color: #f0f0f0; border: none; padding: 10px;">${item}</button>`
    //     ).join('');

    //     Swal.fire({
    //       html: `<div style="display: flex; flex-wrap: wrap; flex-direction: column;">${buttonsHTML}</div>`,
    //       showConfirmButton: false,
    //       didOpen: () => {
    //         // Attach click event listeners to item buttons after the Swal is rendered
    //         document.querySelectorAll('.swal2-item-btn').forEach(button => {
    //           button.addEventListener('click', function () {
    //             const index = this.getAttribute('data-index');
    //             const selectedItem = itemsList[index]; // Get the selected item by index

    //             // Close the Swal modal after selecting an item
    //             Swal.close();

    //             // Update the title with the selected item
    //             $dropDownTitle.text(selectedItem);

    //             // Call your function to update any other parts of the UI or state
    //             updateDropDownOptions(selectedItem, filteredItems, records, $dropDownTitle);
    //           });
    //         });
    //       }
    //     })
    //   }
    // }

    // Create dropdown element
    function createDropDown(display, records, initialContent, $dropDownTitle) {
      const $dropDown = $("<select>")
        .addClass("kintoneplugin-dropdown")
        .attr("name", "mySelect")
        .css({ width: display.search_length });
      $dropDown.append($("<option>").text('-----').val(''));

      if (display.name_marker) {
        let filteredRecords = config.search_content.filter(item => item.group_name === display.group_name);
        filteredRecords.forEach(item => {
          records.forEach(record => {
            const $option = $("<option>")
              .text(record[item.target_field].value)
              .addClass('option')
              .attr('value', record[item.target_field].value);
            $dropDown.append($option);
          });
        });
        // $dropDown.trigger('change');
      } else {
        $dropDownTitle.text(initialContent.search_name);
        records.forEach(item => {
          const $initialOption = $("<option>")
            .text(item[initialContent.target_field].value)
            .addClass('option')
            .attr('value', item[initialContent.target_field].value);
          $dropDown.append($initialOption);
        });
        $dropDown.trigger('change');
      }
      $dropDown.on('change', e => {
        const selectedValue = $dropDown.val();
        console.log("Selected value:", selectedValue);

        // Call queryDropdown function with the selected value
        queryDropdown(selectedValue);
      });


      return $dropDown;
    }

    // Update dropdown options
    function updateDropDownOptions(selectedItem, filteredItems, records, $dropDownTitle) {
      const $dropDown = $dropDownTitle.next("select"); // Find the corresponding dropdown
      $dropDown.empty();
      $dropDown.append($("<option>").text('-----').val(''));

      const selectedContent = filteredItems.find(content => content.search_name === selectedItem);
      records.forEach(record => {
        const $selectedOption = $("<option>")
          .text(record[selectedContent.target_field].value)
          .addClass('option')
          .attr('value', record[selectedContent.target_field].value);
        $dropDown.append($selectedOption);
      });
      $dropDown.trigger('change');
    }

    createDropDowns(config);

    function queryDropdown(selectedValue) {
      console.log("selectedValue", selectedValue);
      let query = '';
      if (selectedValue) {
        query = `${selectedValue} in text_initial`;
        console.log(query);
      }
    }

    // Create input fields
    function createTextInput() {
      return $('<input type="text" class="kintoneplugin-input-text">').on('change', function () {
        console.log("Text Input:", $(this).val());
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
      return $('<button>').text(text).addClass('kintoneplugin-button-dialog-ok').css('font-size', '16px').on('click', callback);
    }

    const $searchButton = createButton('Search', () => alert('Search button clicked!'));
    const $clearButton = createButton('C', () => alert('Clear button clicked!'));

    const $elementBtn = $('<div class="element-button"></div>').append($searchButton, $clearButton);

    config.search_displays.forEach(searchItem => {
      const { search_type, group_name } = searchItem;
      const $elementInput = $('<div></div>').addClass('search-item');

      let inputElement;
      switch (search_type) {
        case 'text_initial':
        case 'text_partial':
        case 'text_exact':
          inputElement = createTextInput();
          break;
        case 'MultiText_initial':
        case 'MultiText_Partial':
          inputElement = createTextArea();
          break;
        case 'Number_Exact':
          inputElement = createNumberInput();
          break;
        case 'Number_Range':
          inputElement = createNumberRangeInput();
          break;
        case 'Date_Exact':
          inputElement = createDateInput();
          break;
        case 'Date_Range':
          inputElement = createDateRangeInput();
          break;
        default:
          inputElement = null;
      }
      if (inputElement) {
        $(inputElement).css('width', searchItem.search_length);
        const $label = $('<label>').text(group_name).addClass('label');
        $elementInput.append($label, inputElement);
        $elementsAll.append($elementInput);
      }
    });

    $elementsAll.append($elementBtn);
    $spaceEl.append($elementsAll);
  });

})(kintone.$PLUGIN_ID);