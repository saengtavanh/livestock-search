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
        target_field: "food",
        field_for_search: "foodSearch"
      },
      {
        group_name: "DropdownExact",
        search_name: "fark000",
        code_master_id: "",
        target_field: "animal",
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

  // Event listener for showing the record index page
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
      'marginBottom': '50px'
    });

    function createDropDowns(config) {
      config.search_displays.forEach((display) => {
        if (display.search_type === "Dropdown_Exact") {
          // Filter related content based on group_name
          let relatedContent = config.search_content.filter(
            (content) => content.group_name === display.group_name
          );

          // Only show content if `name_marker` is not empty
          if (display.name_marker) {
            relatedContent = relatedContent.filter((content) => content.group_name === display.group_name);
          }

          if (relatedContent.length > 0) {
            const $dropDownTitle = $("<label>")
              .text(display.name_marker ? display.group_name : relatedContent[0].search_name)
              .css({ color: "#4CAF50" });

            // Conditionally set the cursor to "pointer" if name_marker is empty
            if (display.name_marker === "") {
              $dropDownTitle.css({ cursor: "pointer" });

              // Event listener for clicking the dropDownTitle (shows SweetAlert pop-up)
              $dropDownTitle.on("click", function () {
                const filteredItems = config.search_content.filter(
                  (content) => content.group_name === display.group_name && !display.name_marker
                );

                const itemsList = filteredItems.map((content) => content.search_name);

                // Use SweetAlert to display a selection pop-up
                Swal.fire({
                  title: 'Select an Item',
                  input: 'select',
                  inputOptions: itemsList.reduce((options, item, index) => {
                    options[index] = item;
                    return options;
                  }, {}),
                  showCancelButton: true,
                  inputValidator: (value) => {
                    return new Promise((resolve) => {
                      if (value === '') {
                        resolve('You need to select something!');
                      } else {
                        resolve();
                      }
                    });
                  }
                }).then((result) => {
                  if (result.value !== undefined) {
                    const selectedItem = itemsList[result.value];

                    // Update the title of the drop-down with the selected item
                    $dropDownTitle.text(selectedItem);

                    // Filter and update the drop-down options to show only the selected item
                    $dropDown.empty();

                    const selectedContent = filteredItems.find(
                      (content) => content.search_name === selectedItem
                    );
                    console.log("object", selectedContent);
                    if (selectedContent) {
                      const $selectedOption = $("<option>")
                        .text(selectedContent.search_name)
                        .attr('value', selectedContent.search_name || selectedContent.target_field);
                      // .val(selectedContent.code_master_id || selectedContent.target_field);
                      $dropDown.append($selectedOption);
                    }
                  }
                });
              });
            }
            // Create drop-down
            const $dropDown = $("<select>")
              .addClass("kintoneplugin-dropdown")
              .css({ width: display.search_length });

            // Add default option
            const $defaultOption = $("<option>")
              .text('-----')
              .val('');
            $dropDown.append($defaultOption);

            // Initially add all related content as options
            relatedContent.forEach((content) => {
              const $option = $("<option>")
                .text(content.search_name)
                .attr('value', content.search_name || content.target_field);
              // .val(content.code_master_id || content.target_field);
              $dropDown.append($option);
            });
            // Event listener for when the dropdown value changes
            $dropDown.on('change', function (e) {
              console.log("value::", e.target.value);
              const selectedValue = $(this).val();
              // let option = $("select[name='kintoneplugin-dropdown'] option:selected").val();
              // console.log("Selected value:", option);
              console.log("Selected value:", selectedValue);
            });

            // Set specific option value if name_marker is not empty
            if (display.name_marker) {
              // const specificContent = relatedContent.find((content) => content.search_name);
              const specificContent = relatedContent.find((content) => content.search_name === display.group_name);
              // console.log('111', specificContent);
              if (specificContent) {
                $dropDown.empty();
                const $specificOption = $("<option>")
                  .text(specificContent.search_name)
                  .attr('value', specificContent.search_name || specificContent.target_field);
                // .val(specificContent.code_master_id || specificContent.target_field);
                $dropDown.append($specificOption);
                // console.log("object", $specificOption);
              }

            } else {
              const initialContent = relatedContent[0];
              // console.log('rer', initialContent);
              $dropDownTitle.text(initialContent.search_name);

              $dropDown.empty();
              const $initialOption = $("<option>")
                .text(initialContent.search_name)
                .attr('value', initialContent.search_name || initialContent.target_field);
              // .val(initialContent.code_master_id || initialContent.target_field);
              $dropDown.append($initialOption);
            }
            const $element = $('<div></div>').addClass('search-item').css({
              'display': 'flex',
              'flex-direction': 'column',
              'gap': '5px'
            });
            $element.append($dropDownTitle);
            $element.append($dropDown);
            $spaceEl.append($element);
          }
        }
      });
    }
    createDropDowns(config);

    // Functions for creating each input type
    function createTextInput() {
      const $input = $('<input>').attr('type', 'text').addClass('kintoneplugin-input-text');

      $input.on('change', function () {
        console.log("Text Input:", $(this).val());
      });

      return $input;
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
        console.log("TextArea:", event.detail.value);
      });
      return textarea;
    }

    function createNumberInput() {
      const $input = $('<input>').attr('type', 'number').addClass('kintoneplugin-input-text');

      $input.on('change', function () {
        console.log("Number Input:", $(this).val());
      });
      return $input;
    }

    function createNumberRangeInput() {
      const $rangeMin = $('<input>').attr('type', 'number').attr('placeholder', 'Min').addClass('kintoneplugin-input-text');
      const $rangeMax = $('<input>').attr('type', 'number').attr('placeholder', 'Max').addClass('kintoneplugin-input-text');
      const $separatornumber = $('<span>⁓</span>').css({ 'margin': '0', 'font-size': '20px', 'align-self': 'center' });

      const $wrapperd = $('<div></div>').css({ 'display': 'flex', 'align-items': 'center', 'gap': '10px' });
      $wrapperd.append($rangeMin).append($separatornumber).append($rangeMax);

      $rangeMin.on('change', function () {
        console.log("Range Min:", $(this).val());
      });

      $rangeMax.on('change', function () {
        console.log("Range Max:", $(this).val());
      });

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
    const $searchButton = $('<button>')
      .text('Search')
      .addClass('kintoneplugin-button-dialog-ok')
      .css({ backgroundColor: '#4CAF50' })
      .on('click', function () {
        alert('Search button clicked!');
        // Add search logic here
      });

    const $clearButton = $('<button>')
      .text('Clear')
      .addClass('kintoneplugin-button-dialog-ok')
      .css({ backgroundColor: '#4CAF50' })
      .on('click', function () {
        alert('Clear button clicked!');
        // Add clear logic here
      });

    config.search_displays.forEach((searchItem) => {
      const { search_type, group_name } = searchItem;

      const $element = $('<div></div>').addClass('search-item').css({
        'display': 'flex',
        'flex-direction': 'column',
        'gap': '5px'
      });

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
      // else if (search_type === 'Dropdown_Exact') {

      //   inputElement = createDropDowns(config);
      // }
      if (inputElement) {
        $(inputElement).css({
          'width': searchItem.search_length
        });
        const $label = $('<label>').text(group_name);
        $element.append($label).append(inputElement);
        $spaceEl.append($element);
      }
    });
    $spaceEl.append($searchButton, $clearButton);
  });
})(kintone.$PLUGIN_ID);