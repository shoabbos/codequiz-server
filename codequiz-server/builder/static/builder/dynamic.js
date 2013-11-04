var counter = 0;

// String additions
String.prototype.lines = function () {
    return this.split(/\r*\n/);
}
String.prototype.lineCount = function () {
    return this.lines().length;
}

//var $ = django.jQuery;  // bind Djangos jQuery to the shortcut "$", or else not much will work

/**
 * Add a selection drop down list, to choose the kind of text field
 * @param node DOM object to append this to
 * @param cssclass CSS class to give the drop down ('right' or 'inline')
 * @param preSelectedType Which option to preselect
 */
function addTypeSelection(node, cssclass, preSelectedType) {
    $select = $("<select>").addClass(cssclass);

    var options = [
        {"type": "text", "text": "Normal"},
        {"type": "source", "text": "Source"}
    ];

    var count = options.length;

    for (var i = 0; i < count; i++) {
        var option = options[i];

        $option = $("<option>", {value: option["type"], text: option["text"]});
        if (preSelectedType == option["type"]) {
            $option.prop({"selected": true});
        }
        $select.append($option);
    }

    if (node.css('display') == 'none') {
        $select.hide();
    }
    node.after($select);
}

/**
 * Adds a segment to the task definition
 *
 * This is where new types of input can be implemented for the admin interface.
 *
 * @param {String} containerName Which element to add this to (id name)
 * @param {String} inputType Which type of segment to add
 * @param {Object} data Data to prefill the segment with
 */
function addInput(containerName, inputType, data) {

    // First, we create a new list item
    var newElement = document.createElement('li');
    newElement.class = "ui-state-default";
    newElement.id = "segment" + counter;
    newElement.type = inputType;

    // we add it to the container that goes by the id in 'containername' and store it as a jQuery variable
    $("#" + containerName).append(newElement);
    var item = $("#" + newElement.id);
    if (!data || data["animate"]) {
        item.hide();
    }

    // add the little arrow icon to the left of each segment
    item.append("<span class='ui-icon ui-icon-arrowthick-2-n-s'></span>");

    /**
     * Add a textarea
     * @param {String} type The kind of textarea (currently only distinguishes "text" and "comment")
     */
    function addTextArea(type, placeHolder, textareaData, cols, cssClass) {
        var content = "";
        var contentType = "";
        var rows = 1;
        var isComment;
        if (textareaData) {
            content = textareaData["content"];
            contentType = textareaData["type"];
            rows = content.lineCount();
            isComment = textareaData["comment"];
        }

        if (cols > 20) {
            rows = 5;
        }

        if (isComment) {
            item.addClass("comment");
        }
        $textarea = $("<textarea>", {
            cols: cols, rows: rows,
            placeholder: placeHolder,
            text: content
        });

        if (cols > 20) {
            $textarea.addClass("wide");
        }
        else {
            $textarea.addClass("no-ace");
        }

        function updateLines() {
            var rows = $(this).attr("rows");
            var lines = $(this).val().lineCount();
            if (lines != rows) {
                if ($(this).hasClass('wide')) {
                    lines = Math.max(5, lines);
                }
                $(this).attr("rows", lines);
            }
        }

        $textarea.change(function () {
            updateLines.call(this);
        });
        $textarea.keyup(function () {
            updateLines.call(this);
        });

        if (contentType == "source") {
            $textarea.addClass("source");
        }

        item.append($textarea);
        addTypeSelection($textarea, cssClass, contentType);
    }

    /**
     * Add a text input field and a type selection next to it
     * @param {String} key The key to retrieve data from JSON
     * @param {String} placeHolder Placeholder text for the input field
     */
    function addTextInput(placeHolder, inputData, position) {
        var content = "";
        var contentType = "";
        var isComment;
        var lines = 1;
        if (inputData) {
            content = inputData["content"];
            contentType = inputData["type"];
            isComment = inputData["comment"];
        }

        var $input = $("<input>", {
            type: "text",
            placeholder: placeHolder,
            value: content
        });
        if (contentType == "source") {
            $input.addClass("source");
        }
        if (isComment) {
            $input.addClass("comment");
        }
        if (position) {
            console.log("pos:", position);

            $input.hide();
            item.children("select").eq(position - 1).after($input);
            addTypeSelection($input, "inline", contentType);
            $input.show('slow');
            $input.next().show('slow');
        }
        else {
            item.append($input);
            addTypeSelection($input, "inline", contentType);
        }

    }

    // depending on the type of segment we want to insert, add some input fields
    // there's quite some type/null/undefined checking going on, unfortunately,
    // to cleanly support both cases (new segments and loaded segments)
    switch (inputType) {
        case 'text':
            addTextArea(inputType, "Text...", data, 100, "right");
            break;

        case 'source':
            addTextArea(inputType, "Text...", data, 100, "right");
            break;

        case 'comment':
            addTextArea(inputType, "Comment...", data, 100, "right");
            break;

        case 'input':
            if (data) {
                var content = data["content"];
                var count = content.length;
                for (var i = 0; i < count; i++) {
                    addTextInput("Text", content[i]);
                }
            }
            else {
                addTextInput("Text");
            }

            var $addTextInputButton = $('<a href="#" class="addinput">');
            $addTextInputButton.append('<span class="fa-stack">' +
                '<i class="fa fa-circle fa-stack-2x"></i>' +
                '<i class="fa fa-plus fa-stack-1x fa-inverse"></i>' +
                '</span></i>');
            $addTextInputButton.click(function (e) {
                e.preventDefault();
                var numTextInputs = item.children("input").length;
                addTextInput("Text", null, numTextInputs);
                updateWatchdogs();
            });

            var $removeTextInputButton = $('<a href="#" class="removeinput">');
            $removeTextInputButton.append('<span class="fa-stack">' +
                '<i class="fa fa-circle fa-stack-2x"></i>' +
                '<i class="fa fa-minus fa-stack-1x fa-inverse"></i>' +
                '</span></i>');
            $removeTextInputButton.click(function (e) {
                e.preventDefault();
                removeTextInput(1);
                updateWatchdogs();
            });
            item.append($addTextInputButton);
            item.append($removeTextInputButton);

            var answer = null
            solution = null;
            if (data) {
                answer = data["answer"];
                solution = data["solution"];
            }
            addTextArea("text", "Answer", answer, 20, "inline");
            addTextArea("text", "Solution", solution, 20, "inline");
            break;

        case 'check':
            var solution = false;
            if (data) {
                var content = data["content"];
                var count = content.length;
                for (var i = 0; i < count; i++) {
                    addTextInput("Text", content[i]);
                }
                solution = data["solution"];
            }
            else {
                addTextInput("Text");
            }
            item.append("<label for='answer'>Answer</label>");
            $checkbox = $("<input>", {name: "answer", type: "checkbox"});
            if (solution) {
                $checkbox.prop({"checked": true});
            }
            item.append($checkbox);
            break;
    }

    // add the delete button to the segment
    item.append('<a href="#" class="delete" remove="' + newElement.id + '"><span class="fa-stack">' +
        '<i class="fa fa-circle fa-stack-2x"></i>' +
        '<i class="fa fa-times fa-stack-1x fa-inverse"></i>' +
        '</span></i></a>');

    // add hooks for delete button
    $("a.delete").click(function (event) {
        event.preventDefault();
        removeInput($(this).attr("remove"));
    });

    function updateWatchdogs() {
// mark input and textarea fields for automatic updating of hidden input field that stores the JSON
        $("li input").addClass("watch");
        $("li textarea").addClass("watch");
        $("li select").addClass("watch");
        $(".watch").change(function () {
            updateTask();
        });
        $(".watch").keyup(function () {
            updateTask();
        });
        $("select").change(function () {
            var $prev = $(this).prev();
            var selectedValue = $(this).find(":selected").val();
            if (selectedValue == "source") {
                $prev.addClass("source");
                if ($prev.is("textarea.source")) {
                    transformTextAreaToACE($prev);
                }
            } else if (selectedValue == "text") {
                $prev.removeClass("source");
                if ($(this).prev().is("textarea.ace")) {
                    transformACEToTextarea($prev);
                }
            }
        })
        // update after inserting a new segment
        updateTask();
    }

    updateWatchdogs();

    counter++;

    if (!data || data["animate"]) {
        item.slideDown( "slow" );
    }
}

/**
 * update the hidden input field that holds the generated JSON
 */
function updateTask() {
    var dict = exportValues();
    $("input[name='body_xml']").val(JSON.stringify(dict, null, 4));
}

/**
 * Remove a segment from the task
 * @param {String} name Which segment to remove
 */
function removeInput(name) {
    $("#" + name).remove();
    updateTask();
}

/**
 * Walks over all the segments and builds a dictionary/JSON object
 * @returns {{segments: Array}}
 */
function exportValues() {
    var segments = [];

    $("#sortable li").each(function (number, obj) {
        var li = $(this);

        /**
         * Extracts a text area type of input, whose key will be the type of the <li> its contained in
         */
        function extractTextArea() {
            var $firstChild = li.children("textarea").first();
            var $typeSelect = $firstChild.next();
            var isComment = li.attr("type") == "comment";
            var dict = {
                "content": $firstChild.val(),
                "type": $typeSelect.val(),
            };
            if (isComment) {
                dict["comment"] = true;
            }
            segments.push(dict);
        }

        function extractInput(node) {
            var $select = node.next();
            var dict = {
                "content": node.val(),
                "type": $select.val()
            };
            var isComment = node.attr("type") == "comment";
            if (isComment) {
                dict["comment"] = true;
            }
            return dict;
        }

        switch (obj.type) {
            case 'text':
                extractTextArea();
                break;

            case 'source':
                extractTextArea();
                break;

            case 'comment':
                extractTextArea();
                break;

            case 'input':
                var content = [];
                var $inputs = $(this).children("input");
                var count = $inputs.length;
                for (var i = 0; i < count; i++) {
                    content.push(extractInput($inputs.eq(i)));
                }

                var $textareas = $(this).children("textarea");

                var $answer = $textareas.eq(0);
                var answerDict = {
                    "content": $answer.val(),
                    "type": $answer.next().val()
                }

                var $solution = $textareas.eq(1);
                var solutionDict = {
                    "content": $solution.val(),
                    "type": $solution.next().val()
                }

                segments.push({
                    "type": "input",
                    "content": content,
                    "answer": answerDict,
                    "solution": solutionDict
                });
                break;

            case 'check':
                var content = [];
                var $inputs = $(this).children("input[type='text']");
                var count = $inputs.length;
                for (var i = 0; i < count; i++) {
                    content.push(extractInput($inputs.eq(i)));
                }

                var solution = $(this).children("input[type='checkbox']").first().is(':checked');

                segments.push({
                    "type": "check",
                    "content": content,
                    "solution": solution
                });

                break;
        }
    })
    ;
    return {segments: segments};
}

// This block gets called by jQuery as soon as the DOM is ready
$(document).ready(function () {
    // store the JSON string from the original textarea widget (i.e. the one from the DB)
    var jsonString = $("textarea.builder").val();

    $("textarea.builder").replaceWith("<div style='margin-left:10em'><ul id='sortable' style='width: 100%'></ul></div>");

    $("#sortable").after("<div id='builderbuttons' style='margin-top:1em'></div>");

    $("#builderbuttons")
        .append("<a class='add' href='#' type='text'>Text</a>")
        .append("<a class='add' href='#' type='comment'>Comment</a>")
        .append("<a class='add' href='#' type='input'>Line Entry</a>")
        .append("<a class='add' href='#' type='check'>Check</a>")
        .append("<input type='hidden' name='body_xml'>");

    $("a.add").click(function (event) {
        event.preventDefault();
        // call addInput() with the type that is in the "type" attribute of the <a> element
        var type = $(this).attr("type");
        var data = null;
        if (type == "comment") {
            type = "text";
            data = {"comment": true, "content": "", "type": "text", "animate":true}
        }
        addInput("sortable", $(this).attr("type"), data);
    });

    // set the hidden input fields content to the initial JSON string
    $("input[name='body_xml']").val(jsonString);

    // check if it really is a JSON string and is defined and has a length
    if (typeof jsonString !== 'undefined' && jsonString.length > 0 && jsonString.charAt(0) == "{") {
        restoreFromJSON(JSON.parse(jsonString));
    }

    transformTextAreaToACE($("textarea.source"));
});

function transformTextAreaToACE(textarea) {
    var content = textarea.val();

    textarea.filter(".source").not(".ace").not(".no-ace").acedInitTA({theme: 'solarized_light', mode: 'python'});
    textarea.addClass("ace");
    textarea.data('ace-div').acedSession().on("change", function () {
        updateTask();
    });
    textarea.data('ace-div').acedSession().setValue(content);
}

function transformACEToTextarea(textarea) {
    textarea.filter(".ace").acedRemoveFromTA();
    textarea.filter(".ace").removeClass("ace");
}

/**
 * Builds up the segment list from the JSON object that describes it
 *
 * @param {Object} json JSON object (not the JSON string! i.e. use JSON.parse(jsonString)!)
 */
function restoreFromJSON(json) {
    var segments = json["segments"];

    segments.forEach(function (segment, index, array) {
        var type = segment["type"];
        addInput("sortable", type, segment);
    });
}

// set some options and event hooks for jQuery Sortable to get a few animations and to update the hidden input for the JSON
// (this gets called automatically, when the script loads)
$(function () {
    $("#sortable").sortable({
        delay: 300,
        placeholder: "ui-state-highlight",
        forcePlaceholderSize: true,
        opacity: 0.5,
        start: function (e, ui) {
            $(ui.placeholder).hide(300);
        },
        change: function (e, ui) {
            $(ui.placeholder).hide().show(300);
        },
        stop: function (event, ui) {
            updateTask();
        }
    });
});