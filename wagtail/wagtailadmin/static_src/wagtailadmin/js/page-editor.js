'use strict';

// registerHalloPlugin must be implemented here so it can be used by plugins
// hooked in with insert_editor_js (and hallo-bootstrap.js runs too late)
var halloPlugins = {
    halloformat: {},
    halloheadings: {formatBlocks: ['p', 'h2', 'h3', 'h4', 'h5']},
    hallolists: {},
    hallohr: {},
    halloreundo: {},
    hallowagtaillink: {},
    hallorequireparagraphs: {}
};

function registerHalloPlugin(name, opts) {
    halloPlugins[name] = (opts || {});
}

// Compare two date objects. Ignore minutes and seconds.
function dateEqual(x, y) {
    return x.getDate() === y.getDate() &&
           x.getMonth() === y.getMonth() &&
           x.getYear() === y.getYear()
}

/*
Remove the xdsoft_current css class from markup unless the selected date is currently in view.
Keep the normal behaviour if the home button is clicked.
 */
function hideCurrent(current, input) {
    var selected = new Date(input[0].value);
    if (!dateEqual(selected, current)) {
        $(this).find('.xdsoft_datepicker .xdsoft_current:not(.xdsoft_today)').removeClass('xdsoft_current');
    }
}

function initDateChooser(id, opts) {
    if (window.dateTimePickerTranslations) {
        $('#' + id).datetimepicker($.extend({
            closeOnDateSelect: true,
            timepicker: false,
            scrollInput: false,
            format: 'Y-m-d',
            i18n: {
                lang: window.dateTimePickerTranslations
            },
            lang: 'lang',
            onGenerate: hideCurrent
        }, opts || {}));
    } else {
        $('#' + id).datetimepicker($.extend({
            timepicker: false,
            scrollInput: false,
            format: 'Y-m-d',
            onGenerate: hideCurrent
        }, opts || {}));
    }
}

function initTimeChooser(id) {
    if (window.dateTimePickerTranslations) {
        $('#' + id).datetimepicker({
            closeOnDateSelect: true,
            datepicker: false,
            scrollInput: false,
            format: 'H:i',
            i18n: {
                lang: window.dateTimePickerTranslations
            },
            lang: 'lang'
        });
    } else {
        $('#' + id).datetimepicker({
            datepicker: false,
            format: 'H:i'
        });
    }
}

function initDateTimeChooser(id, opts) {
    if (window.dateTimePickerTranslations) {
        $('#' + id).datetimepicker($.extend({
            closeOnDateSelect: true,
            format: 'Y-m-d H:i',
            scrollInput: false,
            i18n: {
                lang: window.dateTimePickerTranslations
            },
            language: 'lang',
            onGenerate: hideCurrent
        }, opts || {}));
    } else {
        $('#' + id).datetimepicker($.extend({
            format: 'Y-m-d H:i',
            onGenerate: hideCurrent
        }, opts || {}));
    }
}

function InlinePanel(opts) {
    var self = {};

    self.setHasContent = function() {
        if ($('> li', self.formsUl).not('.deleted').length) {
            self.formsUl.parent().removeClass('empty');
        } else {
            self.formsUl.parent().addClass('empty');
        }
    };

    self.initChildControls = function(prefix) {
        var childId = 'inline_child_' + prefix;
        var deleteInputId = 'id_' + prefix + '-DELETE';

        //mark container as having children to identify fields in use from those not
        self.setHasContent();

        $('#' + deleteInputId + '-button').click(function() {
            /* set 'deleted' form field to true */
            $('#' + deleteInputId).val('1');
            $('#' + childId).addClass('deleted').slideUp(function() {
                self.updateMoveButtonDisabledStates();
                self.updateAddButtonState();
                self.setHasContent();
            });
        });

        if (opts.canOrder) {
            $('#' + prefix + '-move-up').click(function() {
                var currentChild = $('#' + childId);
                var currentChildOrderElem = currentChild.find('input[name$="-ORDER"]');
                var currentChildOrder = currentChildOrderElem.val();

                /* find the previous visible 'inline_child' li before this one */
                var prevChild = currentChild.prev(':visible');
                if (!prevChild.length) return;
                var prevChildOrderElem = prevChild.find('input[name$="-ORDER"]');
                var prevChildOrder = prevChildOrderElem.val();

                // async swap animation must run before the insertBefore line below, but doesn't need to finish first
                self.animateSwap(currentChild, prevChild);

                currentChild.insertBefore(prevChild);
                currentChildOrderElem.val(prevChildOrder);
                prevChildOrderElem.val(currentChildOrder);

                self.updateMoveButtonDisabledStates();
            });

            $('#' + prefix + '-move-down').click(function() {
                var currentChild = $('#' + childId);
                var currentChildOrderElem = currentChild.find('input[name$="-ORDER"]');
                var currentChildOrder = currentChildOrderElem.val();

                /* find the next visible 'inline_child' li after this one */
                var nextChild = currentChild.next(':visible');
                if (!nextChild.length) return;
                var nextChildOrderElem = nextChild.find('input[name$="-ORDER"]');
                var nextChildOrder = nextChildOrderElem.val();

                // async swap animation must run before the insertAfter line below, but doesn't need to finish first
                self.animateSwap(currentChild, nextChild);

                currentChild.insertAfter(nextChild);
                currentChildOrderElem.val(nextChildOrder);
                nextChildOrderElem.val(currentChildOrder);

                self.updateMoveButtonDisabledStates();
            });

            $('#' + prefix + '-move-top').click(function() {
                var currentChild = $('#' + childId);
                var currentChildOrderElem = currentChild.find('input[name$="-ORDER"]');
                var currentChildOrder = currentChildOrderElem.val();

                var topChild = currentChild.parent().children(':first-child');
                if (!topChild.length) return;

                var topChildOrderElem = topChild.find('input[name$="-ORDER"]');
                var topChildOrder = topChildOrderElem.val();

                self.animateMove(currentChild, 'top');

                currentChild.insertBefore(topChild);

                currentChild.parent().children('li:visible')
                            .find('input[name$="-ORDER"]')
                            .each(function(index, el) {
                                $(el).val(index + 1);
                            });

                currentChildOrderElem.val(topChildOrder);

                self.updateMoveButtonDisabledStates();
            });

            $('#' + prefix + '-move-bottom').click(function() {
                var currentChild = $('#' + childId);
                var currentChildOrderElem = currentChild.find('input[name$="-ORDER"]');
                var currentChildOrder = currentChildOrderElem.val();

                var bottomChild = currentChild.parent().children(':last-child');
                if (!bottomChild.length) return;

                var bottomChildOrderElem = bottomChild.find('input[name$="-ORDER"]');
                var bottomChildOrder = bottomChildOrderElem.val();

                self.animateMove(currentChild, 'bottom');

                currentChild.insertAfter(bottomChild);

                currentChild.parent().children('li:visible')
                            .find('input[name$="-ORDER"]')
                            .each(function(index, el) {
                                $(el).val(index + 1);
                            });

                currentChildOrderElem.val(bottomChildOrder);

                self.updateMoveButtonDisabledStates();
            });
        }

        /* Hide container on page load if it is marked as deleted. Remove the error
         message so that it doesn't count towards the number of errors on the tab at the
         top of the page. */
        if ($('#' + deleteInputId).val() === '1') {
            $('#' + childId).addClass('deleted').hide(0, function() {
                self.updateMoveButtonDisabledStates();
                self.updateAddButtonState();
                self.setHasContent();
            });

            $('#' + childId).find('.error-message').remove();
        }
    };

    self.formsUl = $('#' + opts.formsetPrefix + '-FORMS');

    self.updateMoveButtonDisabledStates = function() {
        if (opts.canOrder) {
            var forms = self.formsUl.children('li:visible');
            forms.each(function(i) {
                $('ul.controls .inline-child-move-up', this).toggleClass('disabled', i === 0).toggleClass('enabled', i !== 0);
                $('ul.controls .inline-child-move-down', this).toggleClass('disabled', i === forms.length - 1).toggleClass('enabled', i != forms.length - 1);
                $('ul.controls-2 .inline-child-move-top', this).toggleClass('disabled', i === 0).toggleClass('enabled', i !== 0);
                $('ul.controls-2 .inline-child-move-bottom', this).toggleClass('disabled', i === forms.length - 1).toggleClass('enabled', i != forms.length - 1);
            });
        }
    };

    self.updateAddButtonState = function() {
        if (opts.maxForms) {
            var forms = self.formsUl.children('li:visible');
            var addButton = $('#' + opts.formsetPrefix + '-ADD');

            if (forms.length >= opts.maxForms) {
                addButton.addClass('disabled');
            } else {
                addButton.removeClass('disabled');
            }
        }
    };

    self.updateMultiAddButtonState = function() {
        if (opts.onMultiAdd && opts.maxForms) {
            var forms = self.formsUl.children('li:visible');
            var addButton = $('#' + opts.formsetPrefix + '-ADD-MULTI');

            if (forms.length >= opts.maxForms) {
                addButton.addClass('disabled');
            } else {
                addButton.removeClass('disabled');
            }
        }
    };

    self.animateSwap = function(item1, item2) {
        var parent = self.formsUl;
        var children = parent.children('li:visible');

        // Apply moving class to container (ul.multiple) so it can assist absolute positioning of it's children
        // Also set it's relatively calculated height to be an absolute one, to prevent the container collapsing while its children go absolute
        parent.addClass('moving').css('height', parent.height());

        children.each(function() {
            // console.log($(this));
            $(this).css('top', $(this).position().top);
        }).addClass('moving');

        // animate swapping around
        item1.animate({
            top:item2.position().top
        }, 200, function() {
            parent.removeClass('moving').removeAttr('style');
            children.removeClass('moving').removeAttr('style');
        });

        item2.animate({
            top:item1.position().top
        }, 200, function() {
            parent.removeClass('moving').removeAttr('style');
            children.removeClass('moving').removeAttr('style');
        });
    };

    self.animateMove = function(item, where) {
        var parent = self.formsUl;
        var children = parent.children('li:visible');
        var target;

        if (where == 'top') {
            target = children.find(':first-child');
        } else {
            target = children.find(':last-child');
        }

        // Apply moving class to container (ul.multiple) so it can assist absolute positioning of it's children
        // Also set it's relatively calculated height to be an absolute one, to prevent the container collapsing while its children go absolute
        parent.addClass('moving').css('height', parent.height());

        children.each(function() {
            // console.log($(this));
            $(this).css('top', $(this).position().top);
        }).addClass('moving');

        // animate swapping around
        item.animate({
            top:target.position().top
        }, 200, function() {
            parent.removeClass('moving').removeAttr('style');
            children.removeClass('moving').removeAttr('style');
        });
    };

    buildExpandingFormset(opts.formsetPrefix, {
        onAdd: function(formCount) {
            var newChildPrefix = opts.emptyChildFormPrefix.replace(/__prefix__/g, formCount);
            self.initChildControls(newChildPrefix);
            if (opts.canOrder) {
                /* NB form hidden inputs use 0-based index and only increment formCount *after* this function is run.
                Therefore formcount and order are currently equal and order must be incremented
                to ensure it's *greater* than previous item */
                $('#id_' + newChildPrefix + '-ORDER').val(formCount + 1);
            }

            self.updateMoveButtonDisabledStates();
            self.updateAddButtonState();

            if (opts.onAdd) opts.onAdd();
        },
        onMultiAdd: opts.onMultiAdd
    });

    return self;
}

function cleanForSlug(val, useURLify) {
    if (URLify != undefined && useURLify !== false) { // Check to be sure that URLify function exists, and that we want to use it.
        return URLify(val, 255, true);
    } else { // If not just do the "replace"
        return val.replace(/\s/g, '-').replace(/[&\/\\#,+()$~%.'":`@\^!*?<>{}]/g, '').toLowerCase();
    }
}

function initSlugAutoPopulate() {
    var slugFollowsTitle = false;

    $('#id_title').on('focus', function() {
        /* slug should only follow the title field if its value matched the title's value at the time of focus */
        var currentSlug = $('#id_slug').val();
        var slugifiedTitle = cleanForSlug(this.value);
        slugFollowsTitle = (currentSlug == slugifiedTitle);
    });

    $('#id_title').on('keyup keydown keypress blur', function() {
        if (slugFollowsTitle) {
            var slugifiedTitle = cleanForSlug(this.value);
            $('#id_slug').val(slugifiedTitle);
        }
    });
}

function initSlugCleaning() {
    $('#id_slug').blur(function() {
        // if a user has just set the slug themselves, don't remove stop words etc, just illegal characters
        $(this).val(cleanForSlug($(this).val(), false));
    });
}

function initErrorDetection() {
    var errorSections = {};

    // first count up all the errors
    $('.error-message').each(function() {
        var parentSection = $(this).closest('section');

        if (!errorSections[parentSection.attr('id')]) {
            errorSections[parentSection.attr('id')] = 0;
        }

        errorSections[parentSection.attr('id')] = errorSections[parentSection.attr('id')] + 1;
    });

    // now identify them on each tab
    for (var index in errorSections) {
        $('.tab-nav a[href="#' + index + '"]').addClass('errors').attr('data-count', errorSections[index]);
    }
}

function initCollapsibleBlocks(root) {
    if (!root) {
        root = $(document);
    }
    root.find('.object.multi-field.collapsible').each(function() {
        var $li = $(this);
        var $fieldset = $li.find('fieldset');
        if ($li.hasClass('collapsed') && $li.find('.error-message').length == 0) {
            $fieldset.hide();
        }

        $li.find('> h2').click(function() {
            if (!$li.hasClass('collapsed')) {
                $li.addClass('collapsed');
                $fieldset.hide('show');
            } else {
                $li.removeClass('collapsed');
                $fieldset.show('show');
            }
        });
    });
}

function initKeyboardShortcuts() {
    Mousetrap.bind(['mod+p'], function(e) {
        $('.action-preview').trigger('click');
        return false;
    });

    Mousetrap.bind(['mod+s'], function(e) {
        $('.action-save').trigger('click');
        return false;
    });
}

$(function() {
    /* Only non-live pages should auto-populate the slug from the title */
    if (!$('body').hasClass('page-is-live')) {
        initSlugAutoPopulate();
    }

    initSlugCleaning();
    initErrorDetection();
    initCollapsibleBlocks();
    initKeyboardShortcuts();

    /* Set up "save & continue" button */
    var stay_re = /stay=[^&]*/;
    $('.actions input[type="submit"].stay').click(function(e) {
        var form = $(this).closest('form'),
            form_action_url = form.attr('action');

        if (form_action_url.split('?').length > 1) {
            if (stay_re.exec(form_action_url)) {
                form.attr('action', form_action_url.replace(stay_re, 'stay=1'));
            } else {
                form.attr('action', form_action_url + '&stay=1');
            }
        } else {
            form.attr('action', form_action_url + '?stay=1');
        }
    });

    $('.actions input[type="submit"].leave').click(function(e) {
        var form = $(this).closest('form'),
            form_action_url = form.attr('action');

        if (form_action_url.split('?').length > 1) {
            form.attr('action', form_action_url.replace(stay_re, ''));
        }
    });

    var preview_b = $('form#page-edit-form .actions.preview .action-preview');

    /* Set up behaviour of preview button */
    preview_b.click(createPreviewButtonHandler(
                                $('#page-edit-form'), $('.action-preview')));
});
