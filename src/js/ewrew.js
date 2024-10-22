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
        group_name: "abc",
        search_name: "food1",
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
      {
        group_name: "def",
        search_name: "fark",
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

    const spaceEl = kintone.app.getHeaderSpaceElement();
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
          // const $dropDownTitle = $("<label>")
          //   .text(`${relatedContent[0].search_name}`)
          //   .css({ color: "#4CAF50", });

          const $dropDownTitle = $("<label>")
            .text(display.name_marker ? display.group_name : relatedContent[0].search_name)
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
                // inputPlaceholder: 'Select an item',
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
              .val(content.code_master_id || content.target_field);
            $dropDown.append($option);
          });

          // Set specific option value if name_marker is not empty
          if (display.name_marker) {
            const specificContent = relatedContent.find((content) => content.search_name === display.group_name);
            console.log(specificContent);
            if (specificContent) {
              $dropDown.empty();
              const $specificOption = $("<option>")
                .text(specificContent.search_name)
                .val(specificContent.code_master_id || specificContent.target_field);
              $dropDown.append($specificOption);
            }
          } else {
            const initialContent = relatedContent[0];
            $dropDownTitle.text(initialContent.search_name);

            $dropDown.empty();
            const $initialOption = $("<option>")
              .text(initialContent.search_name)
              .val(initialContent.code_master_id || initialContent.target_field);
            $dropDown.append($initialOption);
          }
          const $element = $('<div></div>').addClass('search-item').css({
            'display': 'flex',
            'flex-direction': 'column',
            'gap': '5px'
          });
          $element.append($dropDownTitle)
          $element.append($dropDown)
          $spaceEl.append($element);
        }
      });
    }

    // Call the function to generate and display drop-downs
    createDropDowns(config);
  });
})(kintone.$PLUGIN_ID);