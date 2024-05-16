'use strict';

function populate_streamtable(phenotypes) {
    $(function() {

        // This is mostly copied from <https://michigangenomics.org/health_data.html>.
        var data = phenotypes;
        // data = _.sortBy(data, _.property('pval'));
        var template = _.template($('#streamtable-template').html());
        var view = function(pheno) {
            console.log(template({h: pheno}))
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
