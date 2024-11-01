// let checkValue = [];
//         if (filteredRecords[0]?.masterId !== "-----") {
//           filteredRecords.forEach((item) => {
//             if (!CODEMASTER) return;
//             $.each(CODEMASTER, (index, data) => {
//               if (item.masterId === data.numericKey) {
//                 let valueData = data.codeAndName;
//                 let valueCheck = Array.isArray(valueData)
//                   ? valueData
//                   : [valueData];
//                 $.each(valueCheck, (index, data) => {
//                   const existsData = checkValue.some(
//                     (entry) => entry.code === data.code
//                   );
//                   if (!existsData) {
//                     checkValue.push({ code: data.code, name: data.name });
//                     const option = $("<option>")
//                       .text(data.name)
//                       .addClass("option")
//                       .attr("value", data.code)
//                       .attr("fieldCode", item.searchTarget);
//                     dropDown.append(option);
//                   }
//                 });
//               }
//             });
//           });