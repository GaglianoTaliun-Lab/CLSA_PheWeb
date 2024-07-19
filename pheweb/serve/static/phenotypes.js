'use strict';

function populate_streamtable(phenotypes) {
    $(function() {
        // This is mostly copied from <https://michigangenomics.org/health_data.html>.
        var data = phenotypes;

        // add a column (with header and template for every stratification in the data)
        var stratified_html = ""
        if ('stratification' in data[0]){
            Object.keys(data[0].stratification).forEach(key => {
                $('#stream_table').find('tr').find('th').eq(-1).after('<th>'+ capitalizeFirstLetter(key) +'</th>')
                stratified_html = stratified_html + '<td><%= h.stratification.'+ key +' %> </td>\n'
            });
        }

        $('body').append(getTemplateHTML(stratified_html))

        data = _.sortBy(data, _.property('pval'));
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

//   $('#check_combined').change(function() {
//     var hideCombined = !$(this).prop('checked'); // Get the inverse of checkbox state

//     // Iterate through each row in the stream table
//     $('#stream_table tbody tr').each(function() {
//         var sex = $(this).find('td:eq(2)').text(); // Assuming 'sex' column is the third column

//         // Check if the row should be hidden based on checkbox state and 'sex' column value
//         if(sex.trim() === 'combined'){
//             if (hideCombined) {
//                 $(this).hide(); // Hide the row
//             } else {
//                 $(this).show(); // Show the row
//             }
//         }
//     });
// });

// $('#check_male').change(function() {
//     var hideMale = !$(this).prop('checked'); // Get the inverse of checkbox state

//     // Iterate through each row in the stream table
//     $('#stream_table tbody tr').each(function() {
//         var sex = $(this).find('td:eq(2)').text(); // Assuming 'sex' column is the third column

//         // Check if the row should be hidden based on checkbox state and 'sex' column value
//         if(sex.trim() === 'male'){
//             if (hideMale) {
//                 $(this).hide(); // Hide the row
//             } else {
//                 $(this).show(); // Show the row
//             }
//         }
//     });
// });

// $('#check_female').change(function() {
//     var hideFemale = !$(this).prop('checked'); // Get the inverse of checkbox state

//     // Iterate through each row in the stream table
//     $('#stream_table tbody tr').each(function() {
//         var sex = $(this).find('td:eq(2)').text(); // Assuming 'sex' column is the third column

//         // Check if the row should be hidden based on checkbox state and 'sex' column value
//         if(sex.trim() === 'female'){
//             if (hideFemale) {
//                 $(this).hide(); // Hide the row
//             } else {
//                 $(this).show(); // Show the row
//             }
//         }
//     });
// });
});

var DIR = 'asc';
var LAST_N = 5;
function sortTable(n) {
    var table = document.getElementById("stream_table");

    resetArrows();

    if (LAST_N == n && DIR === 'asc'){
        DIR = "desc";
    } else {
        DIR = "asc";
    }

    // Determine the column name for sorting based on index n
    if (DIR == "desc") {
        table.getElementsByTagName('th')[n].getElementsByClassName('arrow-down')[0].style.borderColor = "grey";
        table.getElementsByTagName('th')[n].getElementsByClassName('arrow-up')[0].style.borderColor = "black";
    } else if (DIR == "asc") {
        table.getElementsByTagName('th')[n].getElementsByClassName('arrow-up')[0].style.borderColor = "grey";
        table.getElementsByTagName('th')[n].getElementsByClassName('arrow-down')[0].style.borderColor = "black";
    }
    LAST_N = n;
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

function resetArrows() {
  var table = document.getElementById("stream_table");
  var sortingRows = [0,1,2,3,5]
  sortingRows.forEach(function(i){
    table.getElementsByTagName('th')[i].getElementsByClassName('arrow-up')[0].style.borderColor = "grey";
    table.getElementsByTagName('th')[i].getElementsByClassName('arrow-down')[0].style.borderColor = "grey";
  });
}

function capitalizeFirstLetter(str) {
    if (!str) return str; // Return if the string is empty or null
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getTemplateHTML(stratified_html){
    return($('<div>').html(`
    <script type="text/template" id="streamtable-template">
        <tr>
            <td><%= h.category %></td>
            <td><a style="color:black" href="<%= pheno_url %>/<%= h.phenocode %>">
                <%= h.phenostring || h.phenocode %>
            </a></td>
            <td>
                <% if (h.num_cases && h.num_controls) { %>
                <%= h.num_cases.toLocaleString() %> + <%= h.num_controls.toLocaleString() %>
                <% } else if (h.num_samples) { %>
                <%= h.num_samples.toLocaleString() %>
                <% } %>
                </td>
            <td><%= h.num_peaks %></td>
            <td><a style="color:black" href="<$= variant_url %>/<%= h.chrom %>-<%= h.pos %>-<%= h.ref %>-<%= h.alt %>">
                <%= h.chrom %>:<%= h.pos.toLocaleString() %> <%= h.ref %> / <%= h.alt %>
                <% if (h.rsids) { %>(<%= h.rsids.replace(/,/g, ', ') %>)<% } %>
                <%= h.top_variant_group %>
            </a></td>
            <td><%= (h.pval == 0) ? '≤1e-320' : h.pval.toExponential(1) %></td>
            <td class="nearest_genes_col">
                <% var ngs = h.nearest_genes.split(","); ngs.forEach(function(g, i) { %>
                <a style="color:black" href="<%= region_url %>/<%= h.phenocode %>/gene/<%= g %>?include=<%= h.chrom %>-<%= h.pos %>">
                <i><%= g %></i></a><%= (i+1 !== ngs.length)?',':'' %>
                <% }) %>
            </td> 
            ` +
            stratified_html
            + `
        </tr>
    </script>`))
}