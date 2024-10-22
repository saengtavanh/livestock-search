(function (PLUGIN_ID) {
  const config = {
    search_displays: [
      {
        name_marker: "TextInitial",
        group_name: "TextInitial",
        search_length: "1rem 10px",
        search_type: "text_initial"
      },
      {
        name_marker: "textPartial",
        group_name: "textPartial",
        search_length: "1rem 10px",
        search_type: "text_partial"
      },
      {
        name_marker: "textExact",
        group_name: "textExact",
        search_length: "1rem 10px",
        search_type: "text_exact"
      },
      {
        name_marker: "MultiTextInitial",
        group_name: "MultiTextInitial",
        search_length: "1rem 10px",
        search_type: "MultiText_initial"
      },
      {
        name_marker: "MultiTextPartial",
        group_name: "MultiTextPartial",
        search_length: "1rem 10px",
        search_type: "MultiText_Partial"
      },
      {
        name_marker: "NumberExact",
        group_name: "NumberExact",
        search_length: "1rem 10px",
        search_type: "Number_Exact"
      },
      {
        name_marker: "NumberRange",
        group_name: "NumberRange",
        search_length: "1rem 10px",
        search_type: "Number_Range"
      },
      {
        name_marker: "DateExact",
        group_name: "DateExact",
        search_length: "1rem 10px",
        search_type: "Date_Exact"
      },
      {
        name_marker: "DateRange",
        group_name: "DateRange",
        search_length: "1rem 10px",
        search_type: "Date_Range"
      },
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
        target_field: "DropdownExactCode",
        field_for_search: "foodSearch"
      },
      {
        group_name: "DropdownExact",
        search_name: "fark000",
        code_master_id: "",
        target_field: "DropdownExactCode",
        field_for_search: "foodSearch"
      },
      {
        group_name: "DropdownExactEmpy",
        search_name: "fark999",
        code_master_id: "",
        target_field: "DropdownExactCode",
        field_for_search: "foodSearch"
      },
      {
        group_name: "DropdownExactEmpy",
        search_name: "fark888",
        code_master_id: "",
        target_field: "DropdownExactCode",
        field_for_search: "foodSearch"
      },
      {
        group_name: "DropdownExactTest",
        search_name: "Test1",
        code_master_id: "",
        target_field: "DropdownExactCode",
        field_for_search: "foodSearch"
      },
      {
        group_name: "DropdownExactTest",
        search_name: "Test2",
        code_master_id: "",
        target_field: "DropdownExactCode",
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

  kintone.events.on('app.record.index.show', () => {
    const spaceEl = kintone.app.getHeaderSpaceElement();
    if (!spaceEl) {
      throw new Error('The header element is unavailable on this page.');
    }
    const $spaceEl = $(spaceEl).css({
      'display': 'flex',
      'flex-wrap': 'wrap',
      'gap': '10px',
      'justify-content': 'flex-start',
    });
    const $btnSearch = $("<button>Search</button>").addClass("kintoneplugin-button-dialog-ok").css({
      backgroundColor: "#4CAF50",
      minWidth: "20px",
      marginLeft: "10px",
      color: "white",
      border: "none",
      cursor: "pointer"
    });

    // Create Clear button
    const $btnClear = $("<button>Clear</button>").addClass("kintoneplugin-button-dialog-cancel").css({
      backgroundColor: "#4CAF50",
      minWidth: "20px",
      marginLeft: "10px",
      color: "white",
      border: "none",
      cursor: "pointer"
    });
    const $buttonContainer = $("<div></div>").css({ display: "flex", gap: "10px" })
      .append($btnSearch)
      .append($btnClear);

    // Button click event for Search button
    $btnSearch.on("click", () => {
      // Implement your search logic here
      console.log("Search button clicked");
    });

    // Button click event for Clear button
    $btnClear.on("click", () => {
      // Clear all input fields
      $("input.kintoneplugin-input-text").val(""); // Clear text inputs
      $("textarea.options-class").val(""); // Clear text areas
      // Optionally reset dropdowns and other inputs as needed
      console.log("Clear button clicked");
    });


    // Functions for creating each input type
    function createTextInput() {
      return $('<input>').attr('type', 'text').addClass('kintoneplugin-input-text');
    }

    function createTextArea() {
      const textarea = new Kuc.TextArea({
        requiredIcon: true,
        className: 'options-class',
        id: 'options-id',
        visible: true,
        disabled: false
      });

      textarea.addEventListener('change', event => {
        console.log(event);
      });
      return textarea;
    }

    function createNumberInput() {
      return $('<input>').attr('type', 'number').addClass('kintoneplugin-input-text');
    }

    function createNumberRangeInput() {
      const $rangeMin = $('<input>').attr('type', 'number').attr('placeholder', 'Min').addClass('kintoneplugin-input-text');
      const $rangeMax = $('<input>').attr('type', 'number').attr('placeholder', 'Max').addClass('kintoneplugin-input-text');
      const $separatornumber = $('<span>⁓</span>').css({ 'margin': '0', 'font-size': '20px', 'align-self': 'center' });

      const $wrapperd = $('<div></div>').css({ 'display': 'flex', 'align-items': 'center', 'gap': '10px' });
      $wrapperd.append($rangeMin).append($separatornumber).append($rangeMax);

      return $wrapperd;
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

      datePicker.addEventListener('change', event => {
        console.log("DatePicker", event.detail.value);
      });

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

      const $separator = $('<span>⁓</span>').css({ 'margin': '0', 'font-size': '20px', 'align-self': 'center' });

      const $wrapper = $('<div></div>').css({ 'display': 'flex', 'align-items': 'center', 'gap': '10px' });
      $wrapper.append(datePickerFirst).append($separator).append(datePickerFinally);

      return $wrapper;
    }

    function createDropdownInput(options = []) {
      const $dropdown = $('<select></select>').addClass('kintoneplugin-dropdown');
      $dropdown.append('<option value="">-----</option>');
      options.forEach(option => {
        $dropdown.append(`<option value="${option.value}">${option.text}</option>`);
      });
      return $dropdown;
    }

    config.search_displays.forEach((searchItem) => {
      console.log("searchItem", searchItem);
      const { search_type, name_marker, group_name } = searchItem;

      const $element = $('<div></div>').addClass('search-item').css({
        'display': 'flex',
        'flex-direction': 'column',
        'gap': '5px'
      });

      let inputElement;

      if (search_type === 'text_initial') {
        inputElement = createTextInput();
      } else if (search_type === 'text_partial') {
        inputElement = createTextInput();
      } else if (search_type === 'text_exact') {
        inputElement = createTextInput();
      } else if (search_type === 'MultiText_initial') {
        inputElement = createTextArea();
      } else if (search_type === 'MultiText_Partial') {
        inputElement = createTextArea();
      } else if (search_type === 'Number_Exact') {
        inputElement = createNumberInput();
      } else if (search_type === 'Number_Range') {
        inputElement = createNumberRangeInput();
      } else if (search_type === 'Date_Exact') {
        inputElement = createDateInput();
      } else if (search_type === 'Date_Range') {
        inputElement = createDateRangeInput();
      } else if (search_type === 'Dropdown_Exact') {
        const relatedContent = config.search_content.filter(
          content => content.group_name === group_name
        );
        console.log("relatedContent", relatedContent);

        if (relatedContent.length > 0) {
          const options = relatedContent.map(content => ({
            value: content.code_master_id || content.target_field,
            text: content.search_name
          }));
          console.log("options", options);
          inputElement = createDropdownInput(options);
        }
      }
      if (inputElement) {
        $(inputElement).css({
          'width': searchItem.search_length
        });
        const $label = $('<label>').text(group_name);
        $element.append($label).append(inputElement);
        $spaceEl.append($element);
        $spaceEl.append($buttonContainer)
      }
    });
  });
})(kintone.$PLUGIN_ID);
