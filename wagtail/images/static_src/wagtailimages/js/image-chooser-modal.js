IMAGE_CHOOSER_MODAL_ONLOAD_HANDLERS = {
    'chooser': function(modal, jsonData) {
        var searchUrl = $('form.image-search', modal.body).attr('action');

        /* currentTag stores the tag currently being filtered on, so that we can
        preserve this when paginating */
        var currentTag;

        function ajaxifyLinks (context) {
            $('.listing a', context).on('click', function() {
                modal.loadUrl(this.href);
                return false;
            });

            $('.pagination a', context).on('click', function() {
                var page = this.getAttribute("data-page");
                setPage(page);
                return false;
            });
        }

        function fetchResults(requestData) {
            $.ajax({
                url: searchUrl,
                data: requestData,
                success: function(data, status) {
                    $('#image-results').html(data);
                    ajaxifyLinks($('#image-results'));
                }
            });
        }

        function search() {
            /* Searching causes currentTag to be cleared - otherwise there's
            no way to de-select a tag */
            currentTag = null;
            fetchResults({
                q: $('#id_q').val(),
                collection_id: $('#collection_chooser_collection_id').val()
            });
            return false;
        }

        function setPage(page) {
            params = {p: page};
            if ($('#id_q').val().length){
                params['q'] = $('#id_q').val();
            }
            if (currentTag) {
                params['tag'] = currentTag;
            }
            params['collection_id'] = $('#collection_chooser_collection_id').val();
            fetchResults(params);
            return false;
        }

        ajaxifyLinks(modal.body);

        // $('form.image-upload', modal.body).on('submit', function() {
        //     var formdata = new FormData(this);

        //     if ($('#id_image-chooser-upload-title', modal.body).val() == '') {
        //         var li = $('#id_image-chooser-upload-title', modal.body).closest('li');
        //         if (!li.hasClass('error')) {
        //             li.addClass('error');
        //             $('#id_image-chooser-upload-title', modal.body).closest('.field-content').append('<p class="error-message"><span>This field is required.</span></p>')
        //         }
        //         setTimeout(cancelSpinner, 500);
        //     } else {
        //         $.ajax({
        //             url: this.action,
        //             data: formdata,
        //             processData: false,
        //             contentType: false,
        //             type: 'POST',
        //             dataType: 'text',
        //             success: modal.loadResponseText,
        //             error: function(response, textStatus, errorThrown) {
        //                 message = jsonData['error_message'] + '<br />' + errorThrown + ' - ' + response.status;
        //                 $('#upload').append(
        //                     '<div class="help-block help-critical">' +
        //                     '<strong>' + jsonData['error_label'] + ': </strong>' + message + '</div>');
        //             }
        //         });
        //     }

        //     return false;
        // });

        $('form.image-search', modal.body).on('submit', search);

        $('#id_q').on('input', function() {
            clearTimeout($.data(this, 'timer'));
            var wait = setTimeout(search, 200);
            $(this).data('timer', wait);
        });
        $('#collection_chooser_collection_id').on('change', search);
        $('a.suggested-tag').on('click', function() {
            currentTag = $(this).text();
            $('#id_q').val('');
            fetchResults({
                'tag': currentTag,
                collection_id: $('#collection_chooser_collection_id').val()
            });
            return false;
        });

        function populateTitle(context) {
            var fileWidget = $('#id_image-chooser-upload-file', context);
            fileWidget.on('change', function () {
                var titleWidget = $('#id_image-chooser-upload-title', context);
                var title = titleWidget.val();
                if (title === '') {
                    // The file widget value example: `C:\fakepath\image.jpg`
                    var parts = fileWidget.val().split('\\');
                    var fileName = parts[parts.length - 1];
                    titleWidget.val(fileName);
                }
            });
        }

        populateTitle(modal.body);

        /* Create a function for adding image widgets (e.g. used together with
        drag/drop). */
        window.add_select_image_widget = function() {
            $('form.image-select', modal.body).submit(function() {
                var formdata = new FormData(this);
                $.ajax({
                    url: this.action,
                    data: formdata,
                    processData: false,
                    contentType: false,
                    type: 'POST',
                    dataType: 'text',
                    success: modal.loadResponseText,
                    error: function(xhr, textStatus, errorThrown) {
                        // Display the error in the upload form
                        if (xhr.status == 413) {
                            // make the error message for large files user-friendly
                            errorThrown = 'The image is too large, please upload a smaller file.';
                        }

                        var li = $('form.image-select li:has(.image_field)',
                                modal.body),
                            err = li.find('p.error-message')
                        li.addClass('error');

                        // if we already have an error-message element, write into it
                        if (err.length) {
                            err.html(errorThrown);
                        } else {
                            // add a <p class="error-message">...</p> to the image_field
                            li.find('.field-content').append(
                                '<p class="error-message">' + errorThrown + '</p>');
                        }
                    }
                });

                return false;
            });
        };
    },
    'image_chosen': function(modal, jsonData) {
        modal.respond('imageChosen', jsonData['result']);
        modal.close();
    },
    'select_format': function(modal) {
        $('form', modal.body).on('submit', function() {
            var formdata = new FormData(this);

            $.post(this.action, $(this).serialize(), modal.loadResponseText, 'text');

            return false;
        });
    }
};
