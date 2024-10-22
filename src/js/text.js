const dropdown = document.createElement('select');
dropdown.classList.add("gaia-argoui-select");
dropdown.style.padding = "10px";
// dropdown.setAttribute("id", "dropdown" + idDropDown);

// Create a default option
let defaultOption = document.createElement("option");
defaultOption.text = "-----";
defaultOption.value = "";
dropdown.add(defaultOption);
let defaultOption1 = document.createElement("option");
defaultOption1.text = "911";
defaultOption1.value = "911";
dropdown.appendChild(defaultOption1);
// ---
const dropdown1 = document.createElement('select');
dropdown1.classList.add("gaia-argoui-select");
dropdown1.style.marginLeft = "10px";
dropdown1.style.padding = "10px";
// dropdown.setAttribute("id", "dropdown" + idDropDown);

// Create a default option
let defaultOption2 = document.createElement("option");
defaultOption2.text = "-----";
defaultOption2.value = "";
dropdown1.add(defaultOption2);
let defaultOption3 = document.createElement("option");
defaultOption3.text = "911";
defaultOption3.value = "911";
dropdown1.appendChild(defaultOption3);

const inputText = document.createElement("input");
inputText.style.marginLeft = "10px";
inputText.style.padding = "5px;";
inputText.classList.add("kintoneplugin-input-text");

const dropdown3 = document.createElement('select');
dropdown3.classList.add("gaia-argoui-select");
dropdown3.style.marginLeft = "10px";
dropdown3.style.padding = "10px";
// Create a default option
let defaultOption4 = document.createElement("option");
defaultOption4.text = "-----";
defaultOption4.value = "";
dropdown3.add(defaultOption4);
let defaultOption5 = document.createElement("option");
defaultOption5.text = "911";
defaultOption5.value = "911";
dropdown3.appendChild(defaultOption5);

const inputDate1 = document.createElement("input");
inputDate1.style.marginLeft = "10px";
inputDate1.style.padding = "5px;";
inputDate1.classList.add("kintoneplugin-input-text");

const symbol = "⁓";

const inputDate2 = document.createElement("input");
inputDate2.style.marginLeft = "10px";
inputDate2.style.padding = "5px;";
inputDate2.classList.add("kintoneplugin-input-text");

   config = {
      search_displays: [
        {
          name_marker: "abc",
          group_name: "abc",
          search_length: "1rem 10px",
          search_type: "text_initial"
        },
        {
          name_marker: "abc",
          group_name: "abc456",
          search_length: "1rem 10px",
          search_type: "text_initial456"
        },
        {
          name_marker: "",
          group_name: "def",
          search_length: "1rem 10px",
          search_type: "text_patial"
        },
        {
          name_marker: "",
          group_name: "def123",
          search_length: "1rem 10px",
          search_type: "text_patial123"
        }
      ],
      search_content: [
        {
          group_name: "abc",
          search_name: "food",
          code_master_id: "",
          target_field: "foodCode",
          field_for_search: "foodSearch"
        },
        {
          group_name: "abc1",
          search_name: "water",
          code_master_id: "",
          target_field: "foodCode1",
          field_for_search: "foodSearch1"
        }
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




     // const $dropdown = $("<select>")
    //   .addClass("gaia-argoui-select")
    //   .css({
    //     width: "150px",
    //     padding: "10px"
    //   })
    //   .append($("<option>").text("-----").val("-----"))
    //   .append($("<option>").text("911").val("911"));

    // const $dropdown1 = $("<select>")
    //   .addClass("gaia-argoui-select")
    //   .css({
    //     width: "150px",
    //     marginLeft: "10px",
    //     padding: "10px"
    //   })
    //   .append($("<option>").text("-----").val("-----"))
    //   .append($("<option>").text("911").val("911"));

    // const manager = $("<div>")
    //   .addClass("kintoneplugin-label")
    //   .text("manager")
    //   .css({
    //     color: "#4CAF50",
    //     fontSize: "16px",
    //     fontWeight: "bold"
    //   });

    // const $inputText = $("<input>")
    //   .addClass("kintoneplugin-input-text")
    //   .css({
    //     marginLeft: "10px",
    //     padding: "0px"
    //   });

    // const $dropdown3 = $("<select>")
    //   .addClass("gaia-argoui-select")
    //   .css({
    //     width: "150px",
    //     marginLeft: "10px",
    //     padding: "10px"
    //   })
    //   .append($("<option>").text("-----").val("-----"))
    //   .append($("<option>").text("911").val("911"));

    // const datePicker = new Kuc.DatePicker({
    //   requiredIcon: true,
    //   language: 'auto',
    //   className: 'options-class',
    //   id: 'options-id',
    //   visible: true,
    //   disabled: false
    // });
    // $(datePicker).css("marginLeft", "10px");

    // const datePicker1 = new Kuc.DatePicker({
    //   requiredIcon: true,
    //   language: 'auto',
    //   className: 'options-class',
    //   id: 'options-id',
    //   visible: true,
    //   disabled: false
    // });

    // datePicker.addEventListener('change', event => {
    //   console.log("DataPicker", event.detail.value);
    // });
    // datePicker1.addEventListener('change', event => {
    //   console.log("DataPicker1", event.detail.value);
    // });

    // const $btnSearch = $("<button>")
    //   .addClass("kintoneplugin-button-dialog-ok")
    //   .text("Search")
    //   .css({
    //     backgroundColor: "#4CAF50",
    //     minWidth: "20px",
    //     marginLeft: "10px",
    //     color: "white",
    //     border: "none",
    //     cursor: "pointer"
    //   });

    // const $btnClear = $("<button>")
    //   .addClass("kintoneplugin-button-dialog-ok")
    //   .text("Clear")
    //   .css({
    //     backgroundColor: "#4CAF50",
    //     minWidth: "20px",
    //     marginLeft: "10px",
    //     color: "white",
    //     border: "none",
    //     cursor: "pointer"
    //   });

    // const $divEl = $("<div>")
    //   .append($dropdown)
    //   .append($dropdown1)
    //   .append($inputText)
    //   .append($dropdown3)
    //   .append(datePicker)
    //   .append(" ⁓ ")  // symbol
    //   .append(datePicker1)
    //   .append($btnSearch)
    //   .append($btnClear);

    // $spaceEl.append($divEl); 




    // Function to create and append dropdowns
    function createDropDowns(config) {
      config.search_displays.forEach((display) => {
        const relatedContent = config.search_content.filter(
          (content) => content.group_name === display.group_name
        );

        if (relatedContent.length > 0) {
          // Create title for the drop-down based on search_name
          const $dropDownTitle = $("<label>")
            .addClass("kintoneplugin-label")
            .text(`${relatedContent[0].search_name}`) // Use the first search_name
            .css({ color: "#4CAF50" });

          // Create drop-down
          const $dropDown = $("<select>")
            .addClass("kintoneplugin-dropdown")
            .css({
              width: display.search_length,
            });
          const $defaultOption = $("<option>")
            .text('-----')
            .val('');
          $dropDown.append($defaultOption);
          // Add options to the drop-down
          relatedContent.forEach((content) => {
            const $option = $("<option>")
              .text(content.search_name)
              .val(content.code_master_id || content.target_field); // Use code_master_id or target_field as the value
            $dropDown.append($option);
          });
          // Add click event on dropDownTitle to show SweetAlert pop-up
          $dropDownTitle.on("click", () => {
            // Check if name_marker is empty
            if (display.name_marker === "") {
              // SweetAlert pop-up with options from search_content
              const options = relatedContent.map(content => ({
                text: content.search_name,
                value: content.search_name // Use search_name as the value
              }));

              Swal.fire({
                title: 'Select an option',
                input: 'select',
                inputOptions: {
                  [options]: options.reduce((obj, item) => {
                    obj[item.value] = item.text;
                    return obj;
                  }, {})
                },
                inputPlaceholder: 'Choose an option',
                showCancelButton: true,
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                preConfirm: (value) => {
                  // Set selected value as the title
                  if (value) {
                    $dropDownTitle.text(value); // Update the title with selected value
                  }
                }
              });
            }
          });

          // Append drop-down and title to the space element in Kintone
          const $title = $("<div>")
            .css({ marginBottom: "10px" })
            .append($dropDownTitle)
            .append($dropDown);
          console.log($title);
          const $container = $("<div>")
            .css({ display: "flex" })
            .append($title)
          $spaceEl.append($container);
        }
      });
    }

    // Call the function to generate and display drop-downs
    createDropDowns(config);

















    (function (PLUGIN_ID) {
      const config = {
        search_displays: [
          {
            name_marker: "abc",
            group_name: "abc",
            search_length: "1rem 10px",
            search_type: "text_initial"
          },
          {
            name_marker: "",
            group_name: "def",
            search_length: "1rem 10px",
            search_type: "text_partial"
          },
          {
            name_marker: "",
            group_name: "del",
            search_length: "1rem 10px",
            search_type: "text_partial"
          }
        ],
        search_content: [
          {
            group_name: "abc",
            search_name: "food",
            code_master_id: "",
            target_field: "foodCode",
            field_for_search: "foodSearch"
          },
          {
            group_name: "abc",
            search_name: "food1",
            code_master_id: "",
            target_field: "foodCode",
            field_for_search: "foodSearch"
          },
          {
            group_name: "def",
            search_name: "water",
            code_master_id: "",
            target_field: "foodCode",
            field_for_search: "foodSearch"
          },
          {
            group_name: "def",
            search_name: "fark",
            code_master_id: "",
            target_field: "foodCode",
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
    
        const spaceEl = kintone.app.getHeaderMenuSpaceElement();
        if (!spaceEl) {
          throw new Error('The header element is unavailable on this page.');
        }
    
        const $spaceEl = $(spaceEl);
    
        function createDropDowns(config) {
          config.search_displays.forEach((display) => {
            // Filter related content based on group_name and check if name_marker has a value
            let relatedContent = config.search_content.filter(
              (content) => content.group_name === display.group_name
            );
    
            // Only show content if `name_marker` is not empty
            if (display.name_marker) {
              relatedContent = relatedContent.filter((content) => content.group_name === display.group_name);
            }
    
            if (relatedContent.length > 0) {
              // Create title for the drop-down based on search_name
              const $dropDownTitle = $("<label>")
                .addClass("kintoneplugin-label")
                .text(`${relatedContent[0].search_name}`) // Set initial title as the first search_name
                .css({ color: "#4CAF50" });
    
              // Conditionally set the cursor to "pointer" if name_marker is empty
              if (display.name_marker === "") {
                $dropDownTitle.css({ cursor: "pointer" });
    
                // Event listener for clicking the dropDownTitle (shows SweetAlert pop-up)
                $dropDownTitle.on("click", function () {
                  // Filter the content to display only items where name_marker is empty
                  const filteredItems = config.search_content.filter(
                    (content) => content.group_name === display.group_name && !display.name_marker
                  );
    
                  // Create the list of search names to display in the SweetAlert pop-up
                  const itemsList = filteredItems.map((content) => content.search_name);
    
                  // Use SweetAlert to display a selection pop-up
                  Swal.fire({
                    title: 'Select an Item',
                    input: 'select',
                    inputOptions: itemsList.reduce((options, item, index) => {
                      options[index] = item;
                      return options;
                    }, {}),
                    inputPlaceholder: 'Select an item',
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
    
                      // Add the selected option as the only option in the dropdown
                      const selectedContent = filteredItems.find(
                        (content) => content.search_name === selectedItem
                      );
                      if (selectedContent) {
                        const $selectedOption = $("<option>")
                          .text(selectedContent.search_name)
                          .val(selectedContent.code_master_id || selectedContent.target_field);
                        $dropDown.append($selectedOption);
                      }
                    }
                  });
                });
              }
    
              // Create drop-down
              const $dropDown = $("<select>")
                .addClass("kintoneplugin-dropdown")
                .css({
                  width: display.search_length,
                });
    
              // Add default option
              const $defaultOption = $("<option>")
                .text('-----')
                .val('');
              $dropDown.append($defaultOption);
    
              // Initially add all related content as options
              relatedContent.forEach((content) => {
                const $option = $("<option>")
                  .text(content.search_name)
                  .val(content.code_master_id || content.target_field); // Use code_master_id or target_field as the value
                $dropDown.append($option);
              });
    
              // Initially, match the dropdown title with the first related content item
              const initialContent = relatedContent[0];
              $dropDownTitle.text(initialContent.search_name);
    
              // Clear the dropdown and show only the first matching value on load
              $dropDown.empty();
              const $initialOption = $("<option>")
                .text(initialContent.search_name)
                .val(initialContent.code_master_id || initialContent.target_field);
              $dropDown.append($initialOption);
    
              // Append drop-down and title to the space element in Kintone
              const $title = $("<div>")
                .css({ marginBottom: "10px" })
                .append($dropDownTitle)
                .append($dropDown);
              const $container = $("<div>")
                .css({ display: "flex" })
                .append($title);
              $spaceEl.append($container);
            }
          });
        }
    
        // Call the function to generate and display drop-downs
        createDropDowns(config);
      });
    })(kintone.$PLUGIN_ID);




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
            search_name: "fark",
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
    
        const spaceEl = kintone.app.getHeaderMenuSpaceElement();
        if (!spaceEl) {
          throw new Error('The header element is unavailable on this page.');
        }
    
        const $spaceEl = $(spaceEl);
    
        function createDropDowns(config) {
          config.search_displays.forEach((display) => {
            // Filter related content based on group_name and check if name_marker has a value
            let relatedContent = config.search_content.filter(
              (content) => content.group_name === display.group_name
            );
            console.log("relatedContent", relatedContent);
    
            // Only show content if `name_marker` is not empty
            if (display.name_marker) {
              relatedContent = relatedContent.filter((content) => content.group_name === display.group_name);
            }
    
            if (relatedContent.length > 0) {
              // Create title for the drop-down based on search_name
              const $dropDownTitle = $("<label>")
                .addClass("kintoneplugin-label")
                .text(`${relatedContent[0].search_name}`)
                .css({ color: "#4CAF50" });
    
    
              // Conditionally set the cursor to "pointer" if name_marker is empty
              if (display.name_marker === "") {
                $dropDownTitle.css({ cursor: "pointer" });
    
                // Event listener for clicking the dropDownTitle (shows SweetAlert pop-up)
                $dropDownTitle.on("click", function () {
                  // Filter the content to display only items where name_marker is empty
                  const filteredItems = config.search_content.filter(
                    (content) => content.group_name === display.group_name && !display.name_marker
                  );
                  console.log("filteredItems", filteredItems);
    
                  // Create the list of search names to display in the SweetAlert pop-up
                  const itemsList = filteredItems.map((content) => content.search_name);
                  console.log("itemsList", itemsList);
    
                  // Use SweetAlert to display a selection pop-up
                  Swal.fire({
                    title: 'Select an Item',
                    input: 'select',
                    inputOptions: itemsList.reduce((options, item, index) => {
                      options[index] = item;
                      return options;
                    }, {}),
                    inputPlaceholder: 'Select an item',
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
                      console.log("selectedItem", selectedItem);
    
                      // Update the title of the drop-down with the selected item
                      $dropDownTitle.text(selectedItem);
    
                      // Filter and update the drop-down options to show only the selected item
                      $dropDown.empty();
    
                      // Add the selected option as the only option in the dropdown
                      const selectedContent = filteredItems.find(
                        (content) => content.search_name === selectedItem
                      );
                      console.log("selectedContent", selectedContent);
                      if (selectedContent) {
                        const $selectedOption = $("<option>")
                          .text(selectedContent.search_name)
                          .val(selectedContent.code_master_id || selectedContent.target_field);
                        $dropDown.append($selectedOption);
                        console.log("selectedOption", $selectedOption);
                      }
                    }
                  });
                });
              }
    
              // Create drop-down
              const $dropDown = $("<select>")
                .addClass("kintoneplugin-dropdown")
                .css({
                  width: display.search_length,
                });
    
              // Add default option
              const $defaultOption = $("<option>")
                .text('-----')
                .val('');
              $dropDown.append($defaultOption);
    
              // Initially add all related content as options
              relatedContent.forEach((content) => {
                const $option = $("<option>")
                  .text(content.search_name)
                  .val(content.code_master_id || content.target_field); // Use code_master_id or target_field as the value
                $dropDown.append($option);
              });
    
              // Initially, match the dropdown title with the first related content item
              const initialContent = relatedContent[0];
              $dropDownTitle.text(initialContent.search_name);
              console.log("initialContent", initialContent);
    
              // Clear the dropdown and show only the first matching value on load
              $dropDown.empty();
              const $initialOption = $("<option>")
                .text(initialContent.search_name)
                .val(initialContent.code_master_id || initialContent.target_field);
              $dropDown.append($initialOption);
              console.log("initialOption", $initialOption);
    
              // Append drop-down and title to the space element in Kintone
              const $title = $("<div>")
                .css({ marginBottom: "10px" })
                .append($dropDownTitle)
                .append($dropDown);
              const $container = $("<div>")
                .css({ display: "flex" })
                .append($title);
              $spaceEl.append($container);
            }
          });
        }
    
        // Call the function to generate and display drop-downs
        createDropDowns(config);
      });
    })(kintone.$PLUGIN_ID);
    
    
