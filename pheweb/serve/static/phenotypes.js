'use strict';

function populate_streamtable(phenotypes) {
    $(function() {

        // This is mostly copied from <https://michigangenomics.org/health_data.html>.
        var data = phenotypes;
        // data = _.sortBy(data, _.property('pval'));
        var template = _.template($('#streamtable-template').html());
        var view = function(pheno) {
            return template({h: pheno});
        };
        var $found = $('#streamtable-found');
        $found.text(data.length + " phenotypes");

        var callbacks = {
            pagination: function(summary){
                if ($.trim($('#search').val()).length > 0){
                    $found.text(summary.total + " matching phenotypes");
                } else {
                    $found.text(data.length + " phenotypes");
                }
            }
        }

        var options = {
            view: view,
            search_box: '#search',
            callbacks: callbacks,
            pagination: {
                span: 5,
                next_text: 'Next <span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span>',
                prev_text: '<span class="glyphicon glyphicon-arrow-left" aria-hidden="true"></span> Previous',
                per_page_select: false,
                per_page_opts: [100], // this is the best way I've found to control the number of rows
            }
        }

        $('#stream_table').stream_table(options, data);

    });
}

// jQuery code to handle checkbox state change
$(document).ready(function() {
    $('#check_combined').change(function() {
        var hideCombined = !$(this).prop('checked'); // Get the inverse of checkbox state

        // Iterate through each row in the stream table
        $('#stream_table tbody tr').each(function() {
            var sex = $(this).find('td:eq(2)').text(); // Assuming 'sex' column is the third column (index 2)

            // Check if the row should be hidden based on checkbox state and 'sex' column value
            if(sex.trim() === 'combined'){
                if (hideCombined) {
                    $(this).hide(); // Hide the row
                } else {
                    $(this).show(); // Show the row
                }
            }
        });
    });

    $('#check_male').change(function() {
        var hideMale = !$(this).prop('checked'); // Get the inverse of checkbox state

        // Iterate through each row in the stream table
        $('#stream_table tbody tr').each(function() {
            var sex = $(this).find('td:eq(2)').text(); // Assuming 'sex' column is the third column (index 2)

            // Check if the row should be hidden based on checkbox state and 'sex' column value
            if(sex.trim() === 'male'){
                if (hideMale) {
                    $(this).hide(); // Hide the row
                } else {
                    $(this).show(); // Show the row
                }
            }
        });
    });

    $('#check_female').change(function() {
        var hideFemale = !$(this).prop('checked'); // Get the inverse of checkbox state

        // Iterate through each row in the stream table
        $('#stream_table tbody tr').each(function() {
            var sex = $(this).find('td:eq(2)').text(); // Assuming 'sex' column is the third column (index 2)

            // Check if the row should be hidden based on checkbox state and 'sex' column value
            if(sex.trim() === 'female'){
                if (hideFemale) {
                    $(this).hide(); // Hide the row
                } else {
                    $(this).show(); // Show the row
                }
            }
        });
    });
});

function sortTable(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("stream_table");
    switching = true;
    // Set the sorting direction to ascending:
    dir = "asc";
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
      // Start by saying: no switching is done:
      switching = false;
      rows = table.rows;
      /* Loop through all table rows (except the
      first, which contains table headers): */
      for (i = 1; i < (rows.length - 1); i++) {
        // Start by saying there should be no switching:
        shouldSwitch = false;
        /* Get the two elements you want to compare,
        one from current row and one from the next: */
        x = rows[i].getElementsByTagName("TD")[n];
        y = rows[i + 1].getElementsByTagName("TD")[n];
        /* Check if the two rows should switch place,
        based on the direction, asc or desc: */
        x.innerHTML = x.innerHTML.trim()
        y.innerHTML = y.innerHTML.trim()
        if (dir == "asc") {
          if (isNumber(x.innerHTML) && isNumber(y.innerHTML) || (y.innerHTML === "" || x.innerHTML === "") ){
            if (evaluateToNumber(x.innerHTML) > evaluateToNumber(y.innerHTML.toLowerCase())) {
                // If so, mark as a switch and break the loop:
                shouldSwitch = true;
                break;
              }
          }
          else {
            if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                // If so, mark as a switch and break the loop:
                shouldSwitch = true;
                break;
              }
          }
        } else if (dir == "desc") {
            if (isNumber(x.innerHTML) && isNumber(y.innerHTML) || (y.innerHTML === "" || x.innerHTML === "")){
                if (evaluateToNumber(x.innerHTML) < evaluateToNumber(y.innerHTML.toLowerCase())) {
                    // If so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                  }
              }
            else {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    // If so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                  }
            }
        }
      }
      if (shouldSwitch) {
        /* If a switch has been marked, make the switch
        and mark that a switch has been done: */
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        // Each time a switch is done, increase this count by 1:
        switchcount ++;
      } else {
        /* If no switching has been done AND the direction is "asc",
        set the direction to "desc" and run the while loop again. */
        if (switchcount == 0 && dir == "asc") {
          dir = "desc";
          switching = true;
        }
      }
    }
  }

  function isNumber(str) {
    try {
      // Evaluate the string using the Function constructor
      const result = new Function(`return ${str}`)();
      
      // Check if the result is a finite number
      return typeof result === 'number' && isFinite(result);
    } catch (e) {
      // If there's an error (e.g., invalid equation), return false
      return false;
    }
  }

  function evaluateToNumber(str) {
    try {
      // Evaluate the string using the Function constructor
      const result = new Function(`return ${str}`)();
      
      // Check if the result is a finite number
      if (typeof result === 'number' && isFinite(result)) {
        return result; // Return the numeric value
      } else {
        return null; // Return null if not a finite number
      }
    } catch (e) {
      // If there's an error (e.g., invalid equation), return null
      return null;
    }
  }
