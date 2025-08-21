var helpers = {
    _cntWinDialog: 0,
    _cntWinProperties: 0,
    debugOn: false,
    _formToArray: function ($objForm, selectorElement, namePrefix, by) {
        if (selectorElement === undefined) {
            selectorElement = 'input';
        }

        //index by name or id?
        var indexBy = '';
        if (by === 'id') {
            indexBy = 'id';
        } else if (by === 'name') {
            indexBy = 'name';
        }

        //walk items and get values
        var returnData = {};
        //console.log($objForm);


        var prefixLength = 0;
        if (namePrefix !== undefined && namePrefix !== '') {
            prefixLength = namePrefix.length;
        }


        if (indexBy != '') {
            $objForm.find(selectorElement).each(function () {
                //console.log($(this).attr('id') + ' ' + $(this).val());
                var fieldName = $(this).attr(indexBy);
                if (prefixLength > 0) {
                    //prefix specified
                    if (fieldName.substring(0, prefixLength) == namePrefix) {
                        fieldName = fieldName.substring(prefixLength);
                        //only matching fields are added:
                        returnData[fieldName] = $(this).val();
                    }
                } else {
                    //no name prefix specified
                    returnData[fieldName] = $(this).val();
                }

                //console.log(fieldName);
                //args[fieldName] = $(this).val()
            });
        }

        return returnData;
    },
    debug: function (info) {
        if (this.debugOn == true) {
            console.log(info);
        }
    },
    dialogShow: function (title, html, width, height, buttons, callback, callbackArg) {

        var windowId = 'dialog' + this._cntWinDialog;
        var $window = this._windowCreate(windowId, title, html, buttons, true, width, height, callback, callbackArg);
        this._cntWinDialog++;
        return $window;
    },
    dialogGet: function () {
        var cnt = this._cntWinDialog - 1;
        var dlgName = "#dialog" + cnt.toString();
        //alert(dlgName);
        return $(dlgName);
    },
    getUrlVars: function () {
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
            vars[key] = value;
        });
        return vars;
    },
    looper: function (object, callback) {
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                if (false === callback.call(object[key], key, object[key])) {
                    break;
                }
            }
        }
        return object;
    },
    formToArrayById: function ($objForm, selectorElement, namePrefix) {
        return this._formToArray($objForm, selectorElement, namePrefix, 'id');
    },
    formToArrayByName: function ($objForm, selectorElement, namePrefix) {
        return this._formToArray($objForm, selectorElement, namePrefix, 'name');
    },
    _buttonHtml: function (buttons) {
        var buttonHtml = "";
        if (buttons === "yesNo") {
            buttonHtml = '<input type="button" value="' + l.get("dialogYes") + '" class="yesButton" /><input type="button" value="' + l.get("dialogNo") + '" class="noButton" />';
        } else if (buttons === "okCancel") {
            buttonHtml = '<input type="button" value="' + l.get("dialogOK") + '" class="yesButton" /><input type="button" value="' + l.get("dialogCancel") + '" class="noButton" />';
        } else if (buttons === "yesNoCancel") {
            buttonHtml = '<input type="button" value="' + l.get("dialogYes") + '" class="yesButton" /><input type="button" value="' + l.get("dialogNo") + '" class="noButton" /><input type="button" value="' + l.get("dialogCancel") + '" class="cancelButton" />';
        } else if (buttons === "cancel") {
            buttonHtml = '<input type="button" value="' + l.get("dialogCancel") + '" class="cancelButton" />';
        }
        return buttonHtml;
    },
    _windowCreate: function (id, title, html, buttons, modal, width, height, callback, callbackArg) {
        if (width === undefined) {
            width = "350px";
        }
        if (height === undefined) {
            height = "150px";
        }


        //buttons
        var buttonHtml = this._buttonHtml(buttons);
        //window html
        windowHtml = '<div id="' + id + '"><div>' + title
                + '</div><div><div class="dialogContent">' + html + '</div><div class="dialogButtons">' + buttonHtml + '</div></div></div>';
        $(document.body).append(windowHtml);
        //buttons
        var $window = $('#' + id);
        var $noButton = $('#' + id + ' .noButton');
        var $yesButton = $('#' + id + ' .yesButton');
        var $cancelButton = $('#' + id + ' .cancelButton');
        if ($yesButton.length > 0 && $noButton.length > 0) {
            //yesNo
            $window.jqxWindow({
                isModal: modal,
                height: height,
                width: width,
                cancelButton: $noButton,
                okButton: $yesButton,
                initContent: function () {
                    $yesButton.jqxButton({
                        width: '100px',
                        theme: 'energyblue'
                    });
                    $noButton.jqxButton({
                        width: '100px',
                        theme: 'energyblue'
                    });
                    $yesButton.focus();
                }
            });
        } else {
            //just cancel button
            $window.jqxWindow({
                isModal: modal,
                height: height,
                width: width,
            });
        }

        //cancel button (closes window with dialogResult = none)
        if ($cancelButton.length > 0) {
            $cancelButton.jqxButton({
                width: '100px',
                theme: 'energyblue'
            });
            $cancelButton.on("click", function () {
                $window.jqxWindow('close');
            });
        }



        $window.on('close', function (event) {
            var eventData = "";
            //console.log(event);
            if (event.args.dialogResult.OK) {
                eventData = 'yes';
            } else if (event.args.dialogResult.Cancel) {
                eventData = 'no';
            } else {
                eventData = 'cancel';
            }
            //console.log(eventData);
            //console.log(callback);
            if (callback !== undefined) {
                callback(eventData, callbackArg, $window);
            } else {
                $(this).remove();
            }
        });
        return $window;
    },
    _propertiesWindowHtml: function (properties) {
        var html = '';
        $.each(properties, function (group, value) {
            //property groups

            var label = l.get("propertyGroup" + group);
            if (label.substring(0, 13) === 'Key not found') {
                helpers.debug('No translation for: ' + label);
                label = group;
            }

            html += '<div class="propertyWindowPropertyTitle">' + label + '</div>';
            html += '<div style="display: table; width: 100%">';
            $.each(value, function (index, value) {
                //properties
                html += helpers._propertiesWindowProperty(index, value, group);
            });
            html += '</div>';
        });
        return html;
    },
    propertiesWindowRefresh: function ($window, properties, callback, callbackArg) {
        //console.log('refreshing properties');
        //var $focused = $(':focus');
        //console.log($focused);

        if ($window.length > 0) {
            //replace window content
            var $dlg = helpers.propertiesWindow(l.get('properties'), properties, "", "", "", callback, callbackArg);
            /*} else {
             console.log('no properties window found');
             */
        }
    },
    propertiesWindow: function (title, properties, width, height, buttons, callback, callbackArg) {

        var html = this._propertiesWindowHtml(properties);
        //create window
        //var windowId = 'winProperties' + this._cntWinProperties;
        var windowId = 'winProperties';
        var $window = $('#' + windowId);
        if ($window.length === 0) {
            //create window if it doesnt exist
            $window = this._windowCreate(windowId, title, html, buttons, false, width, height);
        } else {
            //replace window content
            //$window.find('.jqx-window-content').html(html);
            $window.find('.dialogContent').html(html);
        }

        //handler for field changes
        //$window.find('.propControl').each(function(a,b){

        //handler for changed fields
        if (callback) {
            $window.find('.propControl').on("change", function (event) {
                //console.log(event);
                //alert(event.target);
                var $el = $(event.target);
                var prop = $el.attr('id');
                var val = $el.val();
                var group = $el.attr('x_group');
                //checkboxes
                if ($el.prop('type') === 'checkbox') {
                    if ($el.prop('checked') == true) {
                        val = true;
                    } else {
                        val = false;
                    }
                }
                //console.log(val);
                if (prop.length > 4) {
                    //remove "prop"before property name
                    prop = prop.substr(4);
                }

                /*
                 alert("p " + prop);
                 alert("t " + event.target);
                 alert("g " + group);
                 alert("v " + val);
                 */

                callback(callbackArg, group, prop, val);
            });
        }

        this._cntWinProperties++;
        return $window;
    },
    randomId: function (length) {
        if (length === undefined) {
            length = 8;
        }
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    },
    _propertiesWindowProperty: function (name, property, group) {

        var label = l.get("property" + name);
        //console.log(label.substring(0,13));
        if (label.substring(0, 13) === 'Key not found') {
            helpers.debug('No translation for: ' + label);
            label = name;
        }


        var html = '<div class="propertyWindowProperty">';
        html += '<div class="propertyWindowPropertyLabel">' + label + '</div>';
        html += '<div class="propertyWindowPropertyValue">';
        var readonly = '';
        var readonlyClass = '';
        if (property.readonly === true) {
            readonly = 'readonly ';
            readonlyClass = 'readonly ';
        }


        if (property.controlType === 'text') {
            html += '<input ' + readonly + 'type="text" class="' + readonlyClass + 'propControl" id="prop' + name + '" value="' + property.value + '" x_group="' + group + '">';
        } else if (property.controlType === 'dropdown') {
            html += '<select ' + readonly + 'size="1" class="' + readonlyClass + 'propControl" id="prop' + name + '" x_group="' + group + '">';
            html += '<option>' + l.get('optionPleaseChoose') + '</option>';
            $.each(property.options, function (index, value) {
                if (value === property.value) {
                    //selected
                    html += '<option selected value="' + value + '">' + value + '</option>';
                } else {
                    html += '<option value="' + value + '">' + value + '</option>';
                }
            });
            html += '</select>';
        } else if (property.controlType === 'checkbox') {
            var checked = '';
            if (property.value === true) {
                checked = 'checked ';
            }
            //value="' + property.value + '" 
            html += '<input ' + checked + readonly + 'type="checkbox" value="true" class="' + readonlyClass + 'propControl" id="prop' + name + '" x_group="' + group + '">';
        }

        html += '</div>';
        html += '</div>';
        return html;
    }
};
//### types ###


//### settings ###
var mainSettings = {};
$.getJSON("../server/loadsettings.php", function (data) {
    //console.log(data);
    mainSettings = data;
    helpers.debug(mainSettings.app.analyticsID);
    helpers.debug("settings loaded, adding analytics code now");
    (function (i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r;
        i[r] = i[r] || function () {
            (i[r].q = i[r].q || []).push(arguments)
        }, i[r].l = 1 * new Date();
        a = s.createElement(o),
                m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m)
    }
    )(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
    ga('create', mainSettings.app.analyticsID, 'auto');
    ga('set', 'anonymizeIp', true);
    ga('require', 'ec');
    helpers.debug("Analytics ID: " + mainSettings.app.analyticsID);
});
//### debugging ###
if (helpers.getUrlVars()["debug"] == "1") {
    helpers.debugOn = true;
}

var jlfwrk_layout = {};
function startDesigner() {
    jlfwrk_layout = {
        format: {
            loadData: null,
            _eventArticleTileClick: function ($tile, artObj, callback) {
                var args = {$tile: $tile, artObj: artObj};
                if (callback !== undefined) {
                    //console.log("set callback");
                    args.callback = callback;
                }

                if (jlfwrk_layout.labelDocument.layoutChanged === true || jlfwrk_layout.labelDocument.config.layout.data.length > 0) {
                    //alert("Sie haben das Layout bereits bearbeitet. Wenn Sie jetzt ein anderes Format wählen werden Ihre Änderungen verworfen. Möchten Sie das vorhandene Etikett speichern?");
                    //console.log("save changes");
                    //helpers.dialogShow("Änderungen verwerfen?", "Sie haben das Layout bereits bearbeitet. Wenn Sie jetzt ein anderes Format wählen werden Ihre Änderungen verworfen. Fortfahren?", "300px", "150px", "yesNo", jlfwrk_layout.labelDocument.callbackDialogSaveChanges, args);
                    helpers.dialogShow(l.get("saveChangesTitle"), l.get("saveChangesText"), "350px", "150px", "yesNoCancel", jlfwrk_layout.labelDocument.callbackDialogSaveChanges, args);
                } else {
                    //console.log("change");
                    jlfwrk_layout.labelDocument.callbackDialogSaveChanges("no", args);
                }

                ga('send', 'event', 'Labelmanager', 'Format', 'ausgewählt');
            },
            _eventFormatChanged: function () {
                //called when label size is changed
                jlfwrk_layout.layout.reload();
                jlfwrk_layout.data.viewMainReload();
            },
            viewMain: function ($appendTo, myself) {
                if (myself == undefined) {
                    myself = jlfwrk_layout;
                }
                //console.log("label size");
                //STEP 1: size
                //console.log(myself.settings);
                //console.log("settings");
                var prodCounter = 0;
                var $html = $('<div id="toolSize"></div><div class="textFrame"><div id="prodSelector"></div></div>');
                $(myself.settings.products).each(function () {
                    //$(html).append("<option value='" + prodCounter + "'>" + this.name + "</option>");
                    $html.append('<div class="prodWrapper"><div class="prodTile"><img src="' + this.image + '" /><br />' + this.name + '</div></div>');
                    //$html.find('#prodSelector').append('<div class="prodWrapper"><div class="prodTile"><img src="' + this.image + '" /><br />' + this.name + '</div></div>');
                    //load articles
                    $(myself.settings.products[prodCounter].articles).each(function () {
                        var artObj = this;
                        var labelsPerPage = artObj.hLabels * artObj.vLabels;
                        var $curArt = $("<div class='artTile' id='artTile" + artObj.artNo + "'><div class='artTileArtNo'>" + artObj.artNo + "</div><div class='artTileInfo'>" + artObj.labelWidth + " x " + artObj.labelHeight + " mm<br />" + labelsPerPage + " " + l.get("labelsPerPage") + "</div></div>");
                        $curArt.on('click', function () {
                            //handle buttons
                            jlfwrk_layout.format._eventArticleTileClick($(this), artObj);
                        });
                        $html.children(".prodWrapper").last().append($curArt);
                    });
                    prodCounter++;
                    //console.log(this);

                });
                //console.log($html);
                $appendTo.append($html);
                $("#toolSize").jqxToolBar({
                    width: 1200, height: 45, tools: 'button button',
                    initTools: function (type, index, tool, menuToolIninitialization) {
                        if (type == "button") {
                            var icon = $("<div class='jqx-editor-toolbar-icon jqx-editor-toolbar-icon-" + theme + " buttonIcon'></div>");
                        }
                        switch (index) {
                            case 0:
                                icon.addClass("toolbarIcon toolbarNew");
                                icon.attr("title", l.get("startNewLayout"));
                                tool.append(icon);
                                tool.on("click", function () {
                                    //jlfwrk_layout.previewPreparePrintData();
                                    //jlfwrk_layout.preview.pagePrevious();
                                    //alert("open");
                                    var args = {};
                                    var $dlg = helpers.dialogShow(l.get("startNewLayout"), '<div id="newFile"></div>', "640px", "400px", "okCancel", jlfwrk_layout.callbackDialogNewLayout, args);
                                    jlfwrk_layout.format.frmFormatNew.appendTo($('#newFile'));
                                    //$("#layoutNewPageWidth").jqxInput({placeHolder: l.get("sampleData"), height: 25, width: 200, minLength: 1});
                                    //$("#layoutNewPageWidth").jqxInput({placeHolder: "Test", height: 25, width: 200, minLength: 1});



                                    //ga('send', 'event', 'Labelmanager', 'Format', 'Datei geöffnet');
                                });
                                break;
                            case 1:
                                icon.addClass("toolbarIcon toolbarOpen");
                                icon.attr("title", l.get("openExistingLayout"));
                                tool.append(icon);
                                tool.on("click", function () {
                                    jlfwrk_layout.labelDocument.labelLoadFile();
                                });
                                break;
                        }
                    }
                });
            },
            callbackLayoutLoadV2: function (dialogResult, args, $dialog) {
                var layoutObj = jlfwrk_layout.format.loadData;
                //console.log(layoutObj);

                //set loaded data (needs to be done after size is set!)
                jlfwrk_layout.labelDocument.config.label = layoutObj.label;
                jlfwrk_layout.labelDocument.config.layout.data = layoutObj.layout.data;
                //console.log(jlfwrk_layout.labelDocument.config.layout.data);
                jlfwrk_layout.labelDocument.config.layout.elements = layoutObj.layout.elements;
                //handle new data
                jlfwrk_layout.layout.layoutLoad();
                this.loadData = null;
                if ($dialog !== undefined) {
                    $dialog.remove();
                }

                //console.log(jlfwrk_layout.labelDocument);
            },
            callbackLayoutLoadV1: function (dialogResult, args, $dialog) {
                helpers.debug('loading old format (v1)');
                var layoutObj = jlfwrk_layout.format.loadData;
                //console.log(layoutObj);


                jlfwrk_layout.labelDocument.config.label = layoutObj.label;
                jlfwrk_layout.labelDocument.config.layout.data = layoutObj.data;
                //console.log(layoutObj.data);
                var colOld = [];
                var colNew = [];
                //modify elements to fit new format...
                $.each(layoutObj.elements, function (elIndex, el) {
                    //console.log(el);
                    //$newEl = jlfwrk_layout.layout.element.add(el.type, el.left, el.top, jlfwrk_layout.layout.element.pxToMm(el.width), jlfwrk_layout.layout.element.pxToMm(el.height));

                    //prepare variables
                    var fontBold = false;
                    if (el.fontWeight !== 'normal') {
                        fontBold = true;
                    }
                    var fontItalic = false;
                    if (el.fontStyle !== 'normal') {
                        fontItalic = true;
                    }
                    var fontUnderline = false;
                    if (el.textDecoration !== 'none') {
                        fontUnderline = true;
                    }

                    //names and ids
                    var newID = helpers.randomId(32);
                    colOld.push(el.name);
                    colNew.push(newID + '-value');
                    //create element object
                    var newEl = {
                        _hidden: {
                            id: newID
                        },
                        general: {
                            alignment: {
                                value: el.align
                            },
                            fontBold: {
                                value: fontBold
                            },
                            fontFamily: {
                                value: el.fontFamily
                            },
                            fontItalic: {
                                value: fontItalic
                            },
                            fontSize: {
                                value: el.fontSize
                            },
                            fontUnderline: {
                                value: fontUnderline
                            },
                            height: {
                                value: jlfwrk_layout.layout.element.pxToMm(el.height)
                            },
                            left: {
                                value: jlfwrk_layout.layout.element.pxToMm(el.left)
                            },
                            name: {
                                value: el.name
                            },
                            top: {
                                value: jlfwrk_layout.layout.element.pxToMm(el.top)
                            },
                            type: {
                                value: el.type
                            },
                            verticalAlignment: {
                                value: el.verticalAlign
                            },
                            width: {
                                value: jlfwrk_layout.layout.element.pxToMm(el.width)
                            },
                            zIndex: {
                                value: 1
                            }
                        }
                    }
                    jlfwrk_layout.labelDocument.config.layout.elements.push(newEl);
                    //console.log(newEl);
                });
                //rename data columns
                jlfwrk_layout.data.renameColumn(colOld, colNew);
                //handle new data
                jlfwrk_layout.layout.layoutLoad();
                this.loadData = null;
                if ($dialog !== undefined) {
                    $dialog.remove();
                }

                //console.log(jlfwrk_layout.labelDocument);
            },
            formatSet: function (args) {
                //alert(dialogResult);
                //console.log(args);

                var artObj = args.artObj;
                //formatting
                $(".artTile").removeClass("artTileSelected");
                if (args.tile !== undefined) {
                    var $tile = args.$tile;
                    $tile.addClass("artTileSelected");
                }

                //store label settings in labelmanager
                jlfwrk_layout.labelDocument.config.label.artNo = artObj.artNo;
                jlfwrk_layout.labelDocument.config.label.pageWidth = artObj.pageWidth;
                jlfwrk_layout.labelDocument.config.label.pageHeight = artObj.pageHeight;
                jlfwrk_layout.labelDocument.config.label.marginLeft = artObj.marginLeft;
                jlfwrk_layout.labelDocument.config.label.marginTop = artObj.marginTop;
                jlfwrk_layout.labelDocument.config.label.labelWidth = artObj.labelWidth;
                jlfwrk_layout.labelDocument.config.label.labelHeight = artObj.labelHeight;
                jlfwrk_layout.labelDocument.config.label.hSpace = artObj.hSpace;
                jlfwrk_layout.labelDocument.config.label.vSpace = artObj.vSpace;
                jlfwrk_layout.labelDocument.config.label.hLabels = artObj.hLabels;
                jlfwrk_layout.labelDocument.config.label.vLabels = artObj.vLabels;
                //setupPage();

                jlfwrk_layout.format._eventFormatChanged();
            },
            reload: function () {
                var $viewParent = $("#prodSelector").parent();
                $viewParent.html(""); //reset view
                this.appendTo($viewParent); //load view
            },
            validateFormat: function (args, onlyCheckIfSet) {
                //console.log(args);
                var pageWidth = Number(args['pageWidth']);
                var pageHeight = Number(args['pageHeight']);
                var labelWidth = Number(args['labelWidth']);
                var labelHeight = Number(args['labelHeight']);
                var marginLeft = Number(args['marginLeft']);
                var marginTop = Number(args['marginTop']);
                var hLabels = Number(args['hLabels']);
                var vLabels = Number(args['vLabels']);
                var hSpace = Number(args['hSpace']);
                var vSpace = Number(args['vSpace']);

                var result = true;


                //check if relevant fields are set
                if (pageWidth > 0 && pageHeight > 0 && labelHeight > 0 && labelWidth > 0) {
                } else {
                    //console.log('data not set');
                    result = false;
                }


                if (onlyCheckIfSet === undefined || onlyCheckIfSet !== true) {


                    //check label fits on the page
                    /*
                     if (pageWidth >= labelWidth && pageHeight >= labelHeight) {
                     //ok as is
                     helpers.debug('OK as is');
                     } else if (pageWidth >= labelHeight && pageHeight >= labelWidth) {
                     //ok rotated
                     helpers.debug('OK rotated');
                     } else {
                     //label too big for page
                     helpers.debug('label too big for page');
                     result = false;
                     }
                     */


                    //check if number h and v are positive
                    if (hLabels * vLabels <= 0) {
                        result = false;
                    }


                    //check if all labels fit on the page
                    var width = hLabels * labelWidth + (hLabels - 1) * hSpace + marginLeft;
                    if (pageWidth < width) {
                        //console.log('Page not wide enough for all labels');
                        result = false;
                    }
                    var height = vLabels * labelHeight + (vLabels - 1) * vSpace + marginTop;
                    if (pageHeight < height) {
                        //console.log('Page not high enough for all labels');
                        result = false;
                    }
                }

                return result;
            },
            /*
             frmFormatSwitchFields: function($field1, $field2){
             var tmp = $field1.val();
             $field1.val($field2.val());
             $field2.val(tmp);
             },*/
            frmFormatNewRefreshPreview: function ($appendTo) {
                //console.log('F');
                //console.log(jlfwrk_layout.labelDocument.config);
                //console.log($appendTo.parents('.jqx-window-content').find('.yesButton'));
                var artObj = helpers.formToArrayById($appendTo, '.layoutNewFormFieldInput', 'layoutNewForm');
                $but = $appendTo.parents('.jqx-window-content').find('.yesButton');
                if (jlfwrk_layout.format.validateFormat(artObj) === true) {
                    $('.layoutNewFormPreview').html(jlfwrk_layout.preview.pagePreview(artObj));
                    //make border wider
                    $('.layoutNewFormPreview').children('.pagePreviewItemPageWrap').css('border-width', '3px');

                    $but.prop('disabled', false);
                    $but.removeClass('disabled');
                } else {
                    $('.layoutNewFormPreview').html('<h1>' + l.get('newLayoutPreviewWarning') + '</h1>');
                    $but.prop('disabled', true);
                    $but.addClass('disabled');
                }
            },
            frmFormatNewAutoCalculate: function ($appendTo) {
                //console.log('autocalc');
                //alert("jh");
                var artObj = helpers.formToArrayById($appendTo, '.layoutNewFormFieldInput', 'layoutNewForm');
                if (jlfwrk_layout.format.validateFormat(artObj, true) === true) {

                    var labelWidth = $('#layoutNewFormlabelWidth').val();
                    var labelHeight = $('#layoutNewFormlabelHeight').val();
                    var pageWidth = $('#layoutNewFormpageWidth').val();
                    var pageHeight = $('#layoutNewFormpageHeight').val();


                    var aH = Math.floor(pageWidth / labelWidth);
                    var aV = Math.floor(pageHeight / labelHeight);
                    var a = aH * aV;

                    var bH = Math.floor(pageWidth / labelHeight);
                    var bV = Math.floor(pageHeight / labelWidth);
                    var b = bH * bV;

                    var numH = aH;
                    var numV = aV;
                    if (b > a) {
                        //page needs to be turned
                        numH = bV;
                        numV = bH;

                        var tmp = pageWidth;
                        pageWidth = pageHeight;
                        pageHeight = tmp;
                    }

                    //margins -> set to center
                    var marginH = (pageWidth - numH * labelWidth) / 2;
                    var marginV = (pageHeight - numV * labelHeight) / 2;

                    //set new values
                    $('#layoutNewFormpageWidth').val(pageWidth);
                    $('#layoutNewFormpageHeight').val(pageHeight);
                    $('#layoutNewFormmarginLeft').val(marginH);
                    $('#layoutNewFormmarginTop').val(marginV);
                    $('#layoutNewFormhLabels').val(numH);
                    $('#layoutNewFormvLabels').val(numV);

                }
            },
            frmFormatNew: {
                appendTo: function ($appendTo) {
                    //var swIcon = '<img src="images/icons/switch.png" style="width: 24px; height: 24px;" />';
                    var swIcon = '';
                    var html = '<div class="layoutNewForm">';
                    html += '<div id="layoutNewTabs">';
                    html += '<ul><li>' + l.get('newLayoutMain') + '</li><li>' + l.get('newLayoutExtended') + '</li></ul>';
                    //tab 1 main
                    html += '<div><div class="tabContent10">';
                    html += this._layoutNewElement(l.get('newLabelLabelWidth'), 'labelWidth', 'mm' + swIcon);
                    //html += '&lt;-&gt;';
                    html += this._layoutNewElement(l.get('newLabelLabelHeight'), 'labelHeight', 'mm');
                    html += '<br />';
                    html += '<br />';
                    html += this._layoutNewElementHtml(l.get('newLayoutMedia'), '<input checked type="radio" id="layoutNewFormMediaA4" name="mediaType" value="A4" /> <label for="layoutNewFormMediaA4">' + l.get('newLayoutMediaA4') + '</label>');
                    html += this._layoutNewElementHtml('&nbsp;', '<input type="radio" id="layoutNewFormMediaRoll" name="mediaType" value="roll" /> <label for="layoutNewFormMediaRoll">' + l.get('newLayoutMediaRoll') + '</label>');
                    html += this._layoutNewElementHtml('', '<input type="radio" id="layoutNewFormMediaSpecial" name="mediaType" value="special" /> <label for="layoutNewFormMediaSpecial">' + l.get('newLayoutMediaSpecial') + '</label>');
                    html += '<br />';
                    html += '<div class="layoutNewPageData">';
                    html += this._layoutNewElement(l.get('newLabelPageWidth'), 'pageWidth', 'mm' + swIcon, 210);
                    //html += '&lt;-&gt;';
                    html += this._layoutNewElement(l.get('newLabelPageHeight'), 'pageHeight', 'mm', 297);
                    //html += '<br />';
                    html += '</div>';
                    html += '</div></div>';
                    //tab 2 advanced
                    html += '<div><div class="tabContent10">';
                    html += this._layoutNewElement(l.get('newLabelPageMarginLeft'), 'marginLeft', 'mm');
                    html += this._layoutNewElement(l.get('newLabelPageMarginTop'), 'marginTop', 'mm');
                    html += '<br />';
                    html += this._layoutNewElement(l.get('newLabelHLabels'), 'hLabels', '', 1);
                    html += this._layoutNewElement(l.get('newLabelVLabels'), 'vLabels', '', 1);
                    html += '<br />';
                    html += this._layoutNewElement(l.get('newLabelHSpace'), 'hSpace', 'mm');
                    html += this._layoutNewElement(l.get('newLabelVSpace'), 'vSpace', 'mm');
                    html += '</div>';
                    html += '</div></div>';
                    //end tabs
                    html += '</div>';
                    html += '<div class="layoutNewFormPreview"></div>';
                    //var $html = $(html);
                    $appendTo.append(html);
                    //create tabs
                    $('#layoutNewTabs').jqxTabs({width: 370, height: 320, position: 'top'});


                    //auto calculate elements

                    $('#layoutNewFormlabelHeight').addClass('layoutNewFormAutoCalc');
                    $('#layoutNewFormlabelWidth').addClass('layoutNewFormAutoCalc');
                    $('#layoutNewFormpageHeight').addClass('layoutNewFormAutoCalc');
                    $('#layoutNewFormpageWidth').addClass('layoutNewFormAutoCalc');
                    //$('#layoutNewFormpageWidth').addClass('layoutNewFormAutoCalc');


                    $appendTo.find('.layoutNewFormFieldInput').on('change', function (event) {
                        if ($(event.target).hasClass("layoutNewFormAutoCalc")) {
                            jlfwrk_layout.format.frmFormatNewAutoCalculate($appendTo);
                        }

                        jlfwrk_layout.format.frmFormatNewRefreshPreview($appendTo);
                    });
                    //handle media selector
                    $appendTo.find('input[name="mediaType"]').on('change', function () {
                        //alert("jh");
                        var sel = $('input[name="mediaType"]:checked').val();
                        //alert(sel);

                        if (sel === 'A4') {
                            $('#layoutNewFormpageWidth').val(210);
                            $('#layoutNewFormpageHeight').val(297);
                            jlfwrk_layout.format.frmFormatNewAutoCalculate($appendTo);
                            jlfwrk_layout.format.frmFormatNewRefreshPreview($appendTo);
                            $('.layoutNewPageData').hide();
                        } else if (sel === 'roll') {
                            $('#layoutNewFormpageWidth').val($('#layoutNewFormlabelWidth').val());
                            $('#layoutNewFormpageHeight').val($('#layoutNewFormlabelHeight').val());
                            jlfwrk_layout.format.frmFormatNewAutoCalculate($appendTo);
                            jlfwrk_layout.format.frmFormatNewRefreshPreview($appendTo);
                            $('.layoutNewPageData').hide();
                        } else if (sel === 'special') {
                            $('.layoutNewPageData').show();
                        }

                    });
                    //initial preview
                    /*
                     var artObj = helpers.formToArrayById($appendTo, '.layoutNewFormFieldInput', 'layoutNewForm');
                     if (jlfwrk_layout.format.validateFormat(artObj) === true) {
                     $('.layoutNewFormPreview').html(jlfwrk_layout.preview.pagePreview(artObj));
                     }
                     */
                    jlfwrk_layout.format.frmFormatNewRefreshPreview($appendTo);
                },
                _layoutNewElement: function (label, name, units, value) {
                    if (units === undefined) {
                        units = '';
                    }
                    if (value === undefined) {
                        value = '';
                    }
                    //return '<div class="layoutNewFormField"><div>' + label + '</div><input type="text" class="layoutNewFormFieldInput" id="layoutNewForm' + name + '" value="' + value + '" /> ' + units + '</div>';
                    var controlHtml = '<input type="text" class="layoutNewFormFieldInput" id="layoutNewForm' + name + '" value="' + value + '" /> ' + units;
                    return this._layoutNewElementHtml(label, controlHtml);
                },
                _layoutNewElementHtml: function (label, html) {
                    return '<div class="layoutNewFormField"><div>' + label + '</div>' + html + '</div>';
                }
            },
            frmProductSelector: {
                appendTo: function ($appendTo) {

                }
            }
        },
        layout: {
            _$popover: null,
            _$layoutElement: "",
            _labelSelector: "#label",
            _layoutTool: "",
            _editMode: true,
            _editBusy: false,
            _elementTypes: [
                {
                    name: "text",
                    label: l.get("textfield"),
                    counter: 0,
                    template: '%VALUE%'
                },
                {
                    name: "barcode",
                    label: l.get("barcode"),
                    counter: 0,
                    //template: '<img src="barcode/image.php?code=%VALUE%&style=png&type=C128B&width=100&height=100&xres=3&font=5" />',
                    //template: '<img src="barcode2/barcode.php?d=%VALUE%&f=png&s=code-128&w=100&h=100&p=0" />',
                    //template: '<img src="barcode2/barcode.php?d=%VALUE%&f=png&s=qr&p=0" />',
                    //template: '<img src="barcode2/barcode.php?d=%VALUE%&f=png&s=%barcode/type%&p=0&pb=%barcode/cleartext%&w=%general/width%" />',
                    template: '<img src="barcode2/barcode_wrapper.php?d=%VALUE%&f=png&s=%barcode/type%&wmm=%general/width%&hmm=%general/height%&cleartext=%barcode/cleartext%" />',
                    defaultValue: '123456',
                    defaultWidth: 50,
                    defaultHeight: 10,
                    extendedProperties: {
                        barcode: {
                            type: {
                                controlType: 'dropdown',
                                value: 'code-128',
                                options: [
                                    'code-128',
                                    'code-39',
                                    'ean-13',
                                    'ean-8',
                                    'ean-128',
                                    'qr'
                                ]
                            },
                            cleartext: {
                                controlType: 'checkbox',
                                value: false,
                            }
                        }
                    }
                },
                {name: "arrow", label: l.get("arrow"), counter: 0, template: '<img src="images/arrow%VALUE%.png" />', defaultValue: '1', defaultWidth: 10, defaultHeight: 30}
                //http://192.168.98.5/jldev/mms-labels/jq/barcode/image.php?code=123456&style=png&type=C128B&width=400&height=100&xres=3&font=5
            ],
            clear: function () {
                //console.log('clear');
                $(jlfwrk_layout.layout._labelSelector).find(".layoutElement").remove();
                $(jlfwrk_layout.layout._elementTypes).each(function () {
                    //console.log(this);
                    this.counter = 0;
                });
            },
            elementTypesByType: function (elementTypes) {
                //console.log(this.toString());
                return elementTypes.name === this.toString();
            },
            appendTo: function ($appendTo) {
                //var myself = this;
                //STEP 2: layout

                var html = '<div id="toolFormat"></div>\
                                <div class="textFrame">\
                                    <div id="label"></div><br />\
                                    <div id="layoutWarningSelectFormat">' + l.get("layoutWarningFormat") + '</div>\
                                </div>\
                                <div class="layoutElementsToolbar">\
                                    <div id="customWindowHeader">\
                                        <span id="captureContainer" style="float: left">' + l.get("layoutTools") + '</span>\
                                    </div>\
                                    <div id="customWindowContent" style="overflow: hidden">\
                                        <div class="layoutElementsToolbarTools"></div>\
                                    </div>\
                                </div>\
                                \
                                <div id="layoutEditSampleData">\
                                    <div id="customWindowHeader">\
                                        <span id="captureContainer" style="float: left">' + l.get("sampleData") + '</span>\
                                    </div>\
                                    <div id="customWindowContent" style="overflow: hidden">\
                                        <input type="text" id="layoutEditSampleDataText"><br /><br />\
                                        <div id="layoutEditSampleDataExtended"></div>\
                                        <input type="button" id="layoutEditSampleDataCancel" value="' + l.get("dialogCancel") + '">\
                                        <input type="button" id="layoutEditSampleDataOK" value="' + l.get("dialogOK") + '">\
                                    </div>\
                                </div>\
                                <div id="layoutPopover">\
                                    <div></div>\
                                </div>';
                //$.get("templates/layout.html", function (data) {
                //console.log("data:" + data);
                $appendTo.append(html);
                //layout class functions
                //jlfwrk_layout.pageElementsToolbar();

                //jlfwrk_layout.layout._formSampleData();
                jlfwrk_layout.layout._formSampleData();
                jlfwrk_layout.layout._tbElements();
                jlfwrk_layout.layout._tbFormat();
                jlfwrk_layout.layout._popover();
                //delete handler for layout elements
                $(document).on("keydown", function (event) {
                    //console.log(event);

                    //console.log(event.target);
                    if (jlfwrk_layout.layout._editMode === true) {
                        //only allow changes in edit mode
                        if (event.which === 46) {
                            //delete
                            if (event.target.tagName.toUpperCase() !== 'INPUT') {
                                //console.log(event.which);
                                if (jQuery.type(jlfwrk_layout.layout._$layoutElement) === "object") {
                                    //helpers.dialogShow(l.get("layoutDeleteElementTitle"), l.get("layoutDeleteElementText"), "350px", "150px", "yesNoCancel", jlfwrk_layout.layout.element.byType, $(jlfwrk_layout.layout._$layoutElement));
                                    helpers.dialogShow(l.get("layoutDeleteElementTitle"), l.get("layoutDeleteElementText"), "350px", "150px", "yesNoCancel", jlfwrk_layout.layout.element.delete, $(jlfwrk_layout.layout._$layoutElement));
                                    //alert("Sind Sie sicher, dass Sie das Element löschen möchten? Eventuell hinterlegte Daten, werden ebenfalls entfernt.");

                                }
                            }
                        }
                    }

                    //console.log(event.which);
                });
                //alert("Load was performed.");
                //});
            },
            _formSampleData: function () {
                $("#layoutEditSampleData").jqxWindow({
                    resizable: true,
                    autoOpen: false,
                    height: '110px',
                    width: '220px',
                    minHeight: '110px',
                    minWidth: '220px',
                    isModal: true
                            //position: {x: 650, y: 180}
                });
                $("#layoutEditSampleDataText").jqxInput({placeHolder: l.get("sampleData"), height: 25, width: 200, minLength: 1});
                $("#layoutEditSampleDataCancel").jqxButton({width: 100, height: 25});
                $("#layoutEditSampleDataOK").jqxButton({width: 100, height: 25});
                $("#layoutEditSampleDataCancel").on("click", function () {
                    $("#layoutEditSampleData").jqxWindow("hide");
                });
                $("#layoutEditSampleDataOK").on("click", function () {
                    if (jQuery.type(jlfwrk_layout.layout._$layoutElement) === "object") {
                        //update value
                        var elementValue = $("#layoutEditSampleDataText").val();
                        jlfwrk_layout.layout.element.setValue(jlfwrk_layout.layout._$layoutElement, elementValue);
                    }
                    $("#layoutEditSampleData").jqxWindow("hide");
                });
            },
            _tbElements: function () {

                var $toolbar = $(".layoutElementsToolbar .layoutElementsToolbarTools");
                //$toolbar.append("test");
                $(jlfwrk_layout.layout._elementTypes).each(function () {
                    var $html = $('<input type="button" value="' + this.label + '" class="layoutElementsToolbarButton" />');
                    $html.attr("_elementType", this.name);
                    $html.append("<br />");
                    $toolbar.append($html);
                });
                //elements toolbar
                $(".layoutElementsToolbar").jqxWindow({
                    resizable: true,
                    autoOpen: false,
                    height: '150px',
                    width: '190px',
                    minHeight: '150px',
                    minWidth: '190px',
                    position: {x: 630, y: 210}
                });
                // Create a jqxToggleButton widget.
                $(".layoutElementsToolbarButton").each(function () {
                    $(this).jqxToggleButton({width: '150', toggled: false});
                });
                //handler for extendet tools
                var myself = jlfwrk_layout;
                var $labelArea = $(jlfwrk_layout.layout._labelSelector);
                $labelArea.on("click", function (event) {
                    //$("#label").on("click", function (event) {
                    //alert("click");
                    jlfwrk_layout.layout._eventLabelClick(event);
                });
                $('.layoutElementsToolbar').on('close', function () {
                    //change button if tools are closed
                    jlfwrk_layout.layout.layoutEditable(false);
                });
                $(".layoutElementsToolbarButton").on('click', function () {
                    jlfwrk_layout.layout._eventTbElementButtonClick($(this));
                });
            },
            _tbFormat: function () {

                //new toolbar
                $("#toolFormat").html("");
                $("#toolFormat").jqxToolBar({
                    width: 1200, height: 45, tools: 'dropdownlist combobox | toggleButton toggleButton toggleButton | toggleButton toggleButton toggleButton | toggleButton toggleButton toggleButton | toggleButton',
                    initTools: function (type, index, tool, menuToolIninitialization) {
                        if (type == "toggleButton") {
                            var icon = $("<div class='jqx-editor-toolbar-icon jqx-editor-toolbar-icon-" + theme + " buttonIcon'></div>");
                        }
                        switch (index) {
                            case 0:
                                var fontFamily = Array();
                                fontFamily[0] = "Arial";
                                fontFamily[1] = "Courier";
                                fontFamily[2] = "Times";
                                tool.jqxDropDownList({width: 130, height: 30, source: fontFamily, selectedIndex: 0});
                                tool.on("change", function () {
                                    jlfwrk_layout.layout.element.setFontFamily($(this).val());
                                });
                                break;
                            case 1:
                                tool.jqxComboBox({width: 50, height: 30, source: [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 72, 144, 180], selectedIndex: 6});
                                tool.on("change", function () {
                                    jlfwrk_layout.layout.element.setFontSize($(this).val());
                                });
                                break;
                            case 2:
                                /*
                                 var iconClass = l.get("formatBoldClass");
                                 if (iconClass === '') {
                                 iconClass = "toolbarTextBold";
                                 }
                                 icon.addClass("toolbarIcon " + iconClass);
                                 */
                                icon.addClass("toolbarIcon");
                                var iconFile = l.get("formatBoldIcon");
                                if (iconFile == "") {
                                    iconFile = "images/toolbars/bold.png";
                                }
                                helpers.debug("icon file: " + iconFile);
                                icon.css("background-image", 'url("' + iconFile + '")');
                                icon.attr("title", l.get("formatBold"));
                                tool.append(icon);
                                tool.on("click", function () {
                                    var toggled = $(this).jqxToggleButton('toggled');
                                    jlfwrk_layout.layout.element.setFontBold(toggled);
                                });
                                break;
                            case 3:
                                icon.addClass("toolbarIcon");
                                var iconFile = l.get("formatItalicIcon");
                                if (iconFile == "") {
                                    iconFile = "images/toolbars/italic.png";
                                }
                                helpers.debug("icon file: " + iconFile);
                                icon.css("background-image", 'url("' + iconFile + '")');
                                icon.attr("title", l.get("formatItalic"));
                                tool.append(icon);
                                tool.on("click", function () {
                                    var toggled = $(this).jqxToggleButton('toggled');
                                    jlfwrk_layout.layout.element.setFontItalic(toggled);
                                });
                                break;
                            case 4:
                                icon.addClass("toolbarIcon");
                                var iconFile = l.get("formatUnderlineIcon");
                                if (iconFile == "") {
                                    iconFile = "images/toolbars/underline.png";
                                }
                                helpers.debug("icon file: " + iconFile);
                                icon.css("background-image", 'url("' + iconFile + '")');
                                icon.attr("title", l.get("formatUnderline"));
                                tool.append(icon);
                                tool.on("click", function () {
                                    var toggled = $(this).jqxToggleButton('toggled');
                                    jlfwrk_layout.layout.element.setFontUnderline(toggled);
                                });
                                break;
                            case 5:
                                icon.addClass("toolbarIcon toolbarTextLeft");
                                icon.attr("title", l.get("formatAlignLeft"));
                                tool.append(icon);
                                tool.on("click", function () {
                                    $(this).jqxToggleButton('toggled', true); //always toggle button on click
                                    jlfwrk_layout.layout.element.setAlignLeft();
                                });
                                break;
                            case 6:
                                icon.addClass("toolbarIcon toolbarTextCenter");
                                icon.attr("title", l.get("formatAlignCenter"));
                                tool.append(icon);
                                tool.on("click", function () {
                                    $(this).jqxToggleButton('toggled', true); //always toggle button on click
                                    jlfwrk_layout.layout.element.setAlignCenter();
                                });
                                break;
                            case 7:
                                icon.addClass("toolbarIcon toolbarTextRight");
                                icon.attr("title", l.get("formatAlignRight"));
                                tool.append(icon);
                                tool.on("click", function () {
                                    $(this).jqxToggleButton('toggled', true); //always toggle button on click
                                    jlfwrk_layout.layout.element.setAlignRight();
                                });
                                break;
                            case 8:
                                icon.addClass("toolbarIcon toolbarTextTop");
                                icon.attr("title", l.get("formatVAlignTop"));
                                tool.append(icon);
                                tool.on("click", function () {
                                    $(this).jqxToggleButton('toggled', true); //always toggle button on click
                                    jlfwrk_layout.layout.element.setVerticalAlignTop();
                                });
                                break;
                            case 9:
                                icon.addClass("toolbarIcon toolbarTextMiddle");
                                icon.attr("title", l.get("formatVAlignMiddle"));
                                tool.append(icon);
                                tool.on("click", function () {
                                    $(this).jqxToggleButton('toggled', true); //always toggle button on click
                                    jlfwrk_layout.layout.element.setVerticalAlignMiddle();
                                });
                                break;
                            case 10:
                                icon.addClass("toolbarIcon toolbarTextBottom");
                                icon.attr("title", l.get("formatVAlignBottom"));
                                tool.append(icon);
                                tool.on("click", function () {
                                    $(this).jqxToggleButton('toggled', true); //always toggle button on click
                                    jlfwrk_layout.layout.element.setVerticalAlignBottom();
                                });
                                break;
                            case 11:
                                icon.addClass("toolbarIcon toolbarButtonTools");
                                icon.attr("title", l.get("layoutTools"));
                                tool.append(icon);
                                tool.on('click', function (event) {
                                    jlfwrk_layout.layout._eventTbFormatToolsClick($(this));
                                });
                                break;
                        }
                    }
                });
            },
            _popover: function () {
                /*var html='Wir haben bereits ein Grundlayout f&uuml;r Sie angelegt.<br />Formatieren Sie die Schrift nach Ihren W&uuml;nschen.<br />\
                 Die aufzudruckenden Informationen werden im nächsten Schritt angegeben.<br />\
                 <br />\
                 <div class="infoBox">Um Elemente zu ver&auml;ndern oder hinzuzuf&uuml;gen, klicken sie bitte auf &quot;Werkzeuge&quot;</div>';
                 */
                /*var html = 'Wir haben bereits ein Grundlayout f&uuml;r Sie angelegt.<br />\n\
                 Formatieren Sie die Schrift nach Ihren W&uuml;nschen.<br />\
                 Ihre Daten, Texte, Zahlen, etc. geben Sie in Schritt 3 ein.';*/
                //var html = 'Verwenden Sie die Werkzeuge aus der Werkzeugleiste<br />um Ihr Layout zu erstellen.<br />\n\
                //        <b>Ihre Daten, Texte, Zahlen, etc. geben Sie in Schritt 3 ein.</b>';
                var html = l.get("layoutPopover");
                $("#layoutPopover div").html(html);
                //$("#layoutPopover").jqxPopover({offset: {left: 200, top: 0}, arrowOffsetValue: -150, title: "Info", showCloseButton: true, selector: $("#label")});
                $("#layoutPopover").jqxPopover({offset: {left: 100, top: 0}, arrowOffsetValue: -150, title: "Info", showCloseButton: true, selector: $(".layoutElementsToolbar")});
                this._$popover = $("#layoutPopover");
            },
            _layoutToolReset: function () {
                $(jlfwrk_layout.layout._labelSelector).css("cursor", "auto");
                jlfwrk_layout.layout._layoutTool = "";
            },
            reload: function () {
                var $layoutLabel = $(jlfwrk_layout.layout._labelSelector);
                var labelBorder = 3;
                //console.log(jlfwrk_layout.label);
                $layoutLabel.html("");
                $layoutLabel.css("width", jlfwrk_layout.labelDocument.config.label.labelWidth + "mm")
                $layoutLabel.css("height", jlfwrk_layout.labelDocument.config.label.labelHeight + "mm")

                //remove warning & show label
                $("#layoutWarningSelectFormat").hide();
                $("#label").show();
                //reset formatting
                var tools = $("#toolFormat").jqxToolBar("getTools");
                //$("#layoutFontFamily").val("Arial");
                tools[0].tool.val("Arial"); //font
                //$("#layoutFontSize").val(16);
                tools[1].tool.val(16); //font size

                //console.log(tools);
                tools[2].tool.jqxToggleButton('toggled', false); //bold
                tools[3].tool.jqxToggleButton('toggled', false); //italic
                tools[4].tool.jqxToggleButton('toggled', false); //underline


                tools[5].tool.jqxToggleButton('toggled', false); //left
                tools[6].tool.jqxToggleButton('toggled', true); //center
                tools[7].tool.jqxToggleButton('toggled', false); //right


                tools[8].tool.jqxToggleButton('toggled', false); //top
                tools[9].tool.jqxToggleButton('toggled', true); //middle
                tools[10].tool.jqxToggleButton('toggled', false); //bottom


                //reset layout elements
                jlfwrk_layout.labelDocument.config.layout.elements = [];
                jlfwrk_layout.layout.clear();
                /*
                 $(jlfwrk_layout.layout._elementTypes).each(function () {
                 jlfwrk_layout.counter = 0;
                 });*/


                //console.log(jlfwrk_layout.labelDocument.config.label.labelWidth - 2 * labelBorder);
                //jlfwrk_layout.layout.element.add("text", labelBorder + "mm", labelBorder + "mm", jlfwrk_layout.labelDocument.config.label.labelWidth - 2 * labelBorder, jlfwrk_layout.labelDocument.config.label.labelHeight - 2 * labelBorder);
                jlfwrk_layout.layout.layoutStore();
                jlfwrk_layout.labelDocument.layoutChanged = false;
            },
            _eventElementResizeStop: function ($el) {
                this.element.handleResize($el);
                var width = $el.width();
                var height = $el.height();
                //jlfwrk_layout.layout.element._setPropertyStoreSetting($el, 'general', 'width', jlfwrk_layout.layout.element.pxToMm(width));
                jlfwrk_layout.layout.element._setPropertyUpdateGui($el, 'general', 'width', jlfwrk_layout.layout.element.pxToMm(width));
                //jlfwrk_layout.layout.element._setPropertyStoreSetting($el, 'general', 'height', jlfwrk_layout.layout.element.pxToMm(height));
                jlfwrk_layout.layout.element._setPropertyUpdateGui($el, 'general', 'height', jlfwrk_layout.layout.element.pxToMm(height));
            },
            _eventEnter: function () {
                if ($("#label").css("display") !== "none" && jlfwrk_layout._$popover !== undefined) {
                    this._$popover.jqxPopover("open");
                }

                //show tools
                var tools = $("#toolFormat").jqxToolBar("getTools");
                tools[11].tool.jqxToggleButton('toggled', true);
                $(".layoutElementsToolbar").jqxWindow('show');
                ga('send', 'event', 'Labelmanager', 'Layout', 'aufgerufen');
            },
            _eventExit: function () {
                jlfwrk_layout.layout.layoutStore();
                if (this._$popover !== undefined) {
                    this._$popover.jqxPopover("destroy");
                }
                $(".layoutElementsToolbar").jqxWindow('hide');
                var $prop = $("#winProperties");
                if ($prop.length > 0) {
                    $prop.jqxWindow('destroy');
                }
                jlfwrk_layout.data.viewMainReload(true);
            },
            _eventLabelClick: function (event) {
                //alert("d");
                //alert(jlfwrk_layout.layout._layoutTool);
                if (jlfwrk_layout.layout._layoutTool == "") {
                    //element needs to be deselected
                    if ($(event.target).attr("id") == $(jlfwrk_layout.layout._labelSelector).attr("id")) {
                        //console.log('desel');
                        jlfwrk_layout.layout.element.deselect();
                        jlfwrk_layout.layout._$layoutElement = "";
                    }
                } else {
                    jlfwrk_layout.layout.element.addClick(event);
                }
            },
            _eventTbFormatToolsClick: function ($button) {
                var toggled = $button.jqxToggleButton('toggled');
                if (toggled) {
                    jlfwrk_layout.layout.layoutEditable(true);
                } else {
                    jlfwrk_layout.layout.layoutEditable(false);
                }
            },
            _eventTbElementButtonClick: function ($button) {
                var toggled = $button.jqxToggleButton('toggled');
                if (toggled) {
                    //reset toggling
                    $(".layoutElementsToolbarButton").jqxToggleButton('toggled', false);
                    //set toggling
                    $button.jqxToggleButton('toggled', true);
                    $(jlfwrk_layout.layout._labelSelector).css("cursor", "url('images/cursor_add.png'), copy");
                    //this.__layoutTool = $button.val();
                    jlfwrk_layout.layout._layoutTool = $button.attr("_elementType");
                    //alert(jlfwrk_layout.layout._layoutTool);
                    //$(this).value = 'On';
                } else {
                    jlfwrk_layout.layout._layoutToolReset();
                }
            },
            _updateToolbar: function ($el) {
                //set tools to elements formatting
                var tools = $("#toolFormat").jqxToolBar("getTools");
                //font
                tools[0].tool.val(jlfwrk_layout.layout.element.getProperty($el, 'general', 'fontFamily').value);
                tools[1].tool.val(jlfwrk_layout.layout.element.getProperty($el, 'general', 'fontSize').value);
                //if ($el.css("font-weight") == "bold") {
                //alert($el.attr("_bold"));
                tools[2].tool.jqxToggleButton('toggled', jlfwrk_layout.layout.element.getProperty($el, 'general', 'fontBold').value);
                tools[3].tool.jqxToggleButton('toggled', jlfwrk_layout.layout.element.getProperty($el, 'general', 'fontItalic').value);
                tools[4].tool.jqxToggleButton('toggled', jlfwrk_layout.layout.element.getProperty($el, 'general', 'fontUnderline').value);
                //align
                var alignment = jlfwrk_layout.layout.element.getProperty($el, 'general', 'alignment').value;
                if (alignment === "left") {
                    tools[5].tool.jqxToggleButton('toggled', true);
                    tools[6].tool.jqxToggleButton('toggled', false);
                    tools[7].tool.jqxToggleButton('toggled', false);
                } else if (alignment === "center") {
                    tools[5].tool.jqxToggleButton('toggled', false);
                    tools[6].tool.jqxToggleButton('toggled', true);
                    tools[7].tool.jqxToggleButton('toggled', false);
                } else if (alignment === "right") {
                    tools[5].tool.jqxToggleButton('toggled', false);
                    tools[6].tool.jqxToggleButton('toggled', false);
                    tools[7].tool.jqxToggleButton('toggled', true);
                }

                //vertical align
                var verticalAlignment = jlfwrk_layout.layout.element.getProperty($el, 'general', 'verticalAlignment').value;
                if (verticalAlignment === "top") {
                    tools[8].tool.jqxToggleButton('toggled', true);
                    tools[9].tool.jqxToggleButton('toggled', false);
                    tools[10].tool.jqxToggleButton('toggled', false);
                } else if (verticalAlignment === "middle") {
                    tools[8].tool.jqxToggleButton('toggled', false);
                    tools[9].tool.jqxToggleButton('toggled', true);
                    tools[10].tool.jqxToggleButton('toggled', false);
                } else if (verticalAlignment === "bottom") {
                    tools[8].tool.jqxToggleButton('toggled', false);
                    tools[9].tool.jqxToggleButton('toggled', false);
                    tools[10].tool.jqxToggleButton('toggled', true);
                }
            },
            layoutLoad: function () {

                var conv = jlfwrk_layout.labelDocument.config.layout.conversion;
                //elements
                //remove existing...
                jlfwrk_layout.layout.clear();
                //load new
                $(jlfwrk_layout.labelDocument.config.layout.elements).each(function () {
                    //console.log('loading new element');
                    //console.log(this);
                    //jlfwrk_layout.layout.element.add(this.general.type.value, this.general.left.value / conv, this.general.top.value / conv, this.general.width.value / conv, this.general.height.value / conv);
                    jlfwrk_layout.layout.element.add(this.general.type.value, jlfwrk_layout.layout.element.unitsToPx(this.general.left.value, 'mm'), jlfwrk_layout.layout.element.unitsToPx(this.general.top.value, 'mm'), this.general.width.value, this.general.height.value, this._hidden.id, this.general.name.value);
                    //font
                    jlfwrk_layout.layout.element.setFontFamily(this.general.fontFamily.value);
                    //alert("Set: " + this.fontSizePt);
                    jlfwrk_layout.layout.element.setFontSize(this.general.fontSize.value);
                    //font style
                    jlfwrk_layout.layout.element.setFontItalic(this.general.fontItalic.value);
                    jlfwrk_layout.layout.element.setFontBold(this.general.fontBold.value);
                    jlfwrk_layout.layout.element.setFontUnderline(this.general.fontUnderline.value);
                    //alignment
                    if (this.general.alignment.value === "left") {
                        jlfwrk_layout.layout.element.setAlignLeft();
                    } else if (this.general.alignment.value === "center") {
                        jlfwrk_layout.layout.element.setAlignCenter();
                    } else if (this.general.alignment.value === "right") {
                        jlfwrk_layout.layout.element.setAlignRight();
                    }

                    //vertical alignment
                    if (this.general.verticalAlignment.value === "top") {
                        jlfwrk_layout.layout.element.setVerticalAlignTop();
                    } else if (this.general.verticalAlignment.value === "middle") {
                        jlfwrk_layout.layout.element.setVerticalAlignMiddle();
                    } else if (this.general.verticalAlignment.value === "bottom") {
                        jlfwrk_layout.layout.element.setVerticalAlignBottom();
                    }


                    //console.log(this);
                });
            },
            layoutStore: function () {
                //conversion factor
                jlfwrk_layout.labelDocument.config.layout.conversion = $("#label").height() / jlfwrk_layout.labelDocument.config.label.labelHeight;
                //elements
                jlfwrk_layout.labelDocument.config.layout.elements = [];
                //reset data fields
                jlfwrk_layout.labelDocument.config.layout.dataFields = [];
                $(jlfwrk_layout.layout._labelSelector).find(".layoutElement").each(function () {
                    var $curEl = $(this);
                    //unique id
                    var elID = $curEl.attr('_id');
                    //walk properties
                    var properties = jlfwrk_layout.layout.element.getProperties($curEl);
                    var elObj = {};
                    $.each(properties, function (groupName, group) {
                        elObj[groupName] = {};
                        $.each(group, function (propertyName, property) {
                            //console.log(propertyName);
                            elObj[groupName][propertyName] = {
                                value: property.value
                            };
                        });
                    });
                    //console.log(elObj);
                    //console.log(jlfwrk_layout.layout.element.getProperties($curEl));

                    //set data fields
                    var dataFields = {
                        elementId: elID,
                        name: 'value',
                        label: elObj.general.name.value
                                /*type: 'text'*/
                    };
                    jlfwrk_layout.labelDocument.config.layout.dataFields.push(dataFields);
                    //alert($curEl.attr("_fsize"));
                    //jlfwrk_layout.labelDocument.config.layout.elements[elID] = elObj;

                    //add id to elObj and add to array
                    if (!elObj._hidden) {
                        elObj._hidden = {};
                    }
                    elObj._hidden.id = elID;
                    jlfwrk_layout.labelDocument.config.layout.elements.push(elObj);
                    //console.log(jlfwrk_layout.labelDocument.config.layout.elements);
                });
                //console.log(jlfwrk_layout.labelDocument.config.layout);
            },
            layoutEditable: function (edit) {
                if (this._editBusy == false) {
                    this._editBusy = true;
                    if (edit === undefined) {
                        edit = true;
                    }

                    var myself = this;
                    var tools = $("#toolFormat").jqxToolBar("getTools");
                    if (edit == true) {
                        //$("#layoutFormatEditLayout").val('Werkzeuge schließen');
                        tools[11].tool.jqxToggleButton('toggled', true);
                        $(".layoutElementsToolbar").jqxWindow('show');
                        jlfwrk_layout.layout._editMode = true;
                    } else {
                        //$("#layoutFormatEditLayout").val('Werkzeuge');
                        tools[11].tool.jqxToggleButton('toggled', false);
                        $(".layoutElementsToolbar").jqxWindow('hide');
                        jlfwrk_layout.layout._layoutToolReset();
                        //jlfwrk_layout.layout._editMode = false;
                    }

                    //en- or disable draggable and resizeable
                    $(".layoutElement").each(function (index, obj) {
                        jlfwrk_layout.layout.element.editable($(obj));
                    });
                    this._editBusy = false;
                } else {
                    //console.log("edit busy");
                }
            },
            element: {
                _$contextMenuEl: null,
                _isRightClick: function (event) {
                    var rightclick;
                    if (!event)
                        var event = window.event;
                    if (event.which)
                        rightclick = (event.which === 3);
                    else if (event.button)
                        rightclick = (event.button === 2);
                    return rightclick;
                },
                _contextMenuHtml: function () {
                    return '<div style="display: none">' +
                            '<div id="elementContextMenu">' +
                            '<ul>' +
                            '<li>' + l.get('contextMenuOrder') +
                            '<ul>' +
                            '<li onClick="jlfwrk_layout.layout.element._contextMenuHandle(this,\'moveUp\');">' + l.get('contextMenuOrderForward') + '</li>' +
                            '<li onClick="jlfwrk_layout.layout.element._contextMenuHandle(this,\'moveTop\');">' + l.get('contextMenuOrderToFront') + '</li>' +
                            '<li onClick="jlfwrk_layout.layout.element._contextMenuHandle(this,\'moveDown\');">' + l.get('contextMenuOrderBackward') + '</li>' +
                            '<li onClick="jlfwrk_layout.layout.element._contextMenuHandle(this,\'moveBottom\');">' + l.get('contextMenuOrderToBack') + '</li>' +
                            '</ul>' +
                            '</li>' +
                            '<li onClick="jlfwrk_layout.layout.element._contextMenuHandle(this,\'elementDelete\');">' + l.get('contextMenuDelete') + '</li>' +
                            '<li type=\'separator\'></li>' +
                            '<li onClick="jlfwrk_layout.layout.element._contextMenuHandle(this,\'properties\');"><a href="#">' + l.get('contextMenuProperties') + '</a></li>' +
                            '</ul>' +
                            '</div>' +
                            '</div>';
                },
                _contextMenuSet: function ($el) {
                    // Create a jqxMenu
                    var contextMenu = $("#elementContextMenu").jqxMenu({width: '120px', height: '140px', autoOpenPopup: false, mode: 'popup'});
                    // open the context menu when the user presses the mouse right button.
                    $el.on('mousedown', function (event) {
                        //console.log(event);
                        var rightClick = jlfwrk_layout.layout.element._isRightClick(event) || $.jqx.mobile.isTouchDevice();
                        if (rightClick) {
                            //last clicked element
                            jlfwrk_layout.layout.element._$contextMenuEl = $(event.target).parents('.layoutElement');
                            //menu position
                            var scrollTop = $(window).scrollTop();
                            var scrollLeft = $(window).scrollLeft();
                            contextMenu.jqxMenu('open', parseInt(event.clientX) + 5 + scrollLeft, parseInt(event.clientY) + 5 + scrollTop);
                            return false;
                        }
                    });
                    // disable the default browser's context menu.
                    //$(document).on('contextmenu', function (e) {
                    $el.on('contextmenu', function (e) {
                        return false;
                    });
                },
                _contextMenuHandle: function ($el, event) {

                    var $curEl = this._$contextMenuEl;
                    //console.log($curEl.text());
                    //alert("j");
                    //console.log($curEl.context.textContent);
                    //console.log($curEl.attr('id'));
                    //console.log(event);
                    //l.get("previewPrint")
                    if (event === 'properties') {
                        var $dlg = helpers.propertiesWindow(l.get('properties'), this.getProperties($curEl), "350px", "600px", "okCancel", this.setProperty, $curEl);
                    } else if (event === 'elementDelete') {
                        //console.log(this._$contextMenuEl.find('.layoutElement'));
                        //this.delete('yes', this._$contextMenuEl.parents('.layoutElement'));
                        this.delete('yes', this._$contextMenuEl);
                    } else if (event === 'moveBottom') {
                        this.setOrderBottom(this._$contextMenuEl);
                    } else if (event === 'moveTop') {
                        this.setOrderTop(this._$contextMenuEl);
                    } else if (event === 'moveDown') {
                        this.setOrderDown(this._$contextMenuEl);
                    } else if (event === 'moveUp') {
                        this.setOrderUp(this._$contextMenuEl);
                    }


                    //alert("Siehe Console");
                },
                _initialProperties: function ($el, type) {

                    var typeData = jlfwrk_layout.layout.element.getTypeData(type);
                    var properties = {
                        general: {
                            type: {
                                controlType: 'text',
                                readonly: true,
                                value: type
                            },
                            name: {
                                controlType: 'text',
                                value: this._generateElementName(type)
                            },
                            value: {
                                controlType: 'text',
                                value: typeData.defaultValue
                            },
                            top: {
                                controlType: 'text',
                                value: 0
                            },
                            left: {
                                controlType: 'text',
                                value: 0
                            },
                            height: {
                                controlType: 'text',
                                value: 0
                            },
                            width: {
                                controlType: 'text',
                                value: 0
                            },
                            zIndex: {
                                controlType: 'text',
                                readonly: true,
                                value: 1
                            },
                            alignment: {
                                controlType: 'dropdown',
                                value: 'center',
                                options: [
                                    'left',
                                    'center',
                                    'right'
                                ]
                            },
                            verticalAlignment: {
                                controlType: 'dropdown',
                                value: 'middle',
                                options: [
                                    'top',
                                    'middle',
                                    'bottom'
                                ]
                            },
                            fontFamily: {
                                controlType: 'dropdown',
                                value: 'Arial',
                                options: [
                                    'Arial',
                                    'Courier',
                                    'Times'
                                ]
                            },
                            fontSize: {
                                controlType: 'text',
                                value: 16
                            },
                            fontBold: {
                                controlType: 'checkbox',
                                value: false
                            },
                            fontItalic: {
                                controlType: 'checkbox',
                                value: false
                            },
                            fontUnderline: {
                                controlType: 'checkbox',
                                value: false
                            },
                        }
                    };
                    //type properties
                    //jlfwrk_layout.layout._elementTypes
                    //console.log(type);
                    //console.log(jlfwrk_layout.layout._elementTypes.find(jlfwrk_layout.layout.elementTypesByType, type));
                    //console.log(jlfwrk_layout.layout._elementTypes.find(jlfwrk_layout.layout.elementTypesByType, type).extendedProperties);
                    var extProperties = jlfwrk_layout.layout._elementTypes.find(jlfwrk_layout.layout.elementTypesByType, type).extendedProperties;
                    if (extProperties !== undefined) {
                        //var extProp = '';
                        $.each(extProperties, function (groupName, group) {
                            //groups, create if they dont exist
                            if (properties[groupName] === undefined) {
                                properties[groupName] = {};
                            }

                            $.each(group, function (propertyName, property) {
                                properties[groupName][propertyName] = property;
                                //console.log(propertyName);
                                //console.log(property);
                                //extProp += index + '<br />';
                            });
                        });
                        //$("#layoutEditSampleDataExtended").html(extProp);
                        //console.log(extProp);
                    }




                    var data = {
                        properties: properties
                    }

                    $el.data(data);
                    //console.log(properties);
                },
                addClick: function (event) {
                    //alert("add");
                    //positioning should always work, no matter if absolute or relative positioning
                    var newY = event.pageY - $(event.target).offset().top;
                    var newX = event.pageX - $(event.target).offset().left;
                    jlfwrk_layout.layout.element.add(jlfwrk_layout.layout._layoutTool, newX, newY);
                    $(".layoutElementsToolbarButton").jqxToggleButton('toggled', false);
                    jlfwrk_layout.layout._layoutToolReset();
                },
                add: function (type, left, top, width, height, elID, name) {
                    //id and name are optional and only used when loading a saved layout

                    //console.log(type + " L: " + left + " T: " + top + " W: " + width + " H: " + height);
                    if (type !== undefined) {
                        var $template = jlfwrk_layout.layout.element.renderTemplate(type);
                        $(jlfwrk_layout.layout._labelSelector).append($template);
                        //console.log(jlfwrk_layout.layout._elementTypes.find(jlfwrk_layout.layout.element.byType, jlfwrk_layout.layout._layoutTool));
                        var $newEl = $("#label .layoutElement").last();
                        //unique element ID if not already passed
                        if (elID === undefined) {
                            elID = helpers.randomId(32);
                        }
                        $newEl.attr('_id', elID);
                        //### start properties

                        //element properties
                        this._initialProperties($newEl, type);
                        //name
                        if (name !== undefined) {
                            this.setName($newEl, name);
                        }

                        //position
                        if (left !== undefined) {
                            //$newEl.css("left", left);
                            this.setPosLeft($newEl, left, 'px');
                        }
                        if (top !== undefined) {
                            //$newEl.css("top", top);
                            this.setPosTop($newEl, top, 'px');
                        }

                        //size
                        var elementType = jlfwrk_layout.layout._elementTypes.find(jlfwrk_layout.layout.element.byType, type);
                        if (width !== undefined) {
                            //$newEl.css("width", width + "mm");
                            this.setWidth($newEl, width, 'mm');
                        } else {
                            //$newEl.css("width", elementType.defaultWidth + "mm");
                            //console.log(elementType);
                            this.setWidth($newEl, elementType.defaultWidth, "mm");
                        }

                        if (height !== undefined) {
                            //$newEl.css("height", height + "mm");
                            this.setHeight($newEl, height, 'mm');
                        } else {
                            //$newEl.css("height", elementType.defaultHeight + "mm");
                            this.setHeight($newEl, elementType.defaultHeight, 'mm');
                        }

                        //rerender
                        jlfwrk_layout.layout.element.rerender($newEl);
                        //### end properties


                        $newEl.addClass("layoutElementEdit");
                        jlfwrk_layout.layout.element.select($newEl, false); //auto select new elements




                        //Formatting
                        jlfwrk_layout.layout.element.setFormatting();
                        //console.log(tools);

                        //handler to select element
                        $newEl.on("click", function (event) {
                            var $selEl = $(event.target);
                            //check if click was fired from child element
                            if (!$selEl.hasClass("layoutElement")) {
                                $selEl = $(event.target).parents(".layoutElement");
                            }

                            jlfwrk_layout.layout.element.select($selEl);
                        });
                        //edit default text
                        $newEl.on("dblclick", function (event) {
                            if (jlfwrk_layout.layout._editMode === true) {
                                //only allow changes to sample data in edit mode
                                var $selEl = $(event.target);
                                //check if click was fired from child element
                                if (!$selEl.hasClass("layoutElement")) {
                                    $selEl = $(event.target).parents(".layoutElement");
                                }

                                $("#layoutEditSampleData").jqxWindow("show");
                                $("#layoutEditSampleDataText").val(jlfwrk_layout.layout.element.getValue($selEl));
                                //alert($selEl.attr("value"));


                                ga('send', 'event', 'Labelmanager', 'Layout', 'Beispielinhalt verändert');
                            }
                        });
                        //Resizing
                        $newEl.resizable({containment: "parent"});
                        $newEl.resizable({
                            start: function (event, ui) {
                                //var $eObj = $(event.target);
                                //jlfwrk_layout.layout.element.select($eObj.parent(".layoutElement").trigger("click"));
                                //console.log(jlfwrk_layout.layout._$layoutElement);
                            },
                            stop: function (event, ui) {
                                var $eObj = $(event.target);
                                jlfwrk_layout.layout._eventElementResizeStop($eObj);
                            }
                        });
                        //initial resize
                        jlfwrk_layout.layout.element.handleResize($newEl);
                        //Drag & drop
                        /*$newEl.jqxDragDrop({restricter: 'parent'});
                         $newEl.bind('dragStart', function (event) {
                         //console.log("drag: start");
                         });
                         $newEl.bind('dragEnd', function (event) {
                         //console.log("drag: end " + this.layoutResizeBusy);
                         if (this.layoutResizeBusy != true) {
                         $newEl.css("left", event.args.position.left).css("top", event.args.position.top);
                         }
                         //console.log(event.args.position);
                         });
                         //alert(event.pageX);
                         */
                        $newEl.draggable({containment: "parent"});
                        $newEl.draggable({
                            stop: function (event, ui) {
                                jlfwrk_layout.labelDocument.layoutChanged = true;
                                var position = $newEl.position();
                                //jlfwrk_layout.layout.element.setPosLeft($newEl,position.left,'px');
                                jlfwrk_layout.layout.element._setPropertyStoreSetting($newEl, 'general', 'left', jlfwrk_layout.layout.element.pxToMm(position.left));
                                jlfwrk_layout.layout.element._setPropertyStoreSetting($newEl, 'general', 'top', jlfwrk_layout.layout.element.pxToMm(position.top));
                            }
                        });
                        //context menu
                        this._contextMenuSet($newEl);
                        //finish editing
                        jlfwrk_layout.layout.element.editable($newEl);
                        jlfwrk_layout.labelDocument.layoutChanged = true;
                        ga('send', 'event', 'Labelmanager', 'Layout', type + ' hinzugefügt');
                    }
                },
                byType: function (elementTypes) {
                    //console.log(this.toString());
                    return elementTypes.name === this.toString();
                },
                delete: function (dialogResult, $el) {
                    if (dialogResult == "yes") {
                        $el.remove();
                    }
                },
                deselect: function () {
                    $(".layoutElement").removeClass("layoutElementEditSelected");
                },
                editable: function ($el) {
                    if (jlfwrk_layout.layout._editMode == true) {
                        //$el.draggable("enable");
                        //$el.resizable("enable");
                        $(".layoutElement").addClass("layoutElementEdit");
                    } else {
                        //$el.draggable("disable");
                        //$el.resizable("disable");
                        $(".layoutElement").removeClass("layoutElementEdit");
                    }
                },
                getProperties: function ($el) {

                    if (!$el.hasClass('layoutElement')) {
                        //alert("Konsole prüfen!!! Eigenschaften verlorengegangen?")
                        //console.log($el);
                        $el = $el.parents('.layoutElement').first();
                        //console.log('changed selected element to...');
                        //console.log($el);
                    }

                    data = $el.data();
                    //console.log(data);
                    //console.log(data.properties);

                    if (data === undefined || data.properties === undefined) {
                        //alert("Eigenschaften nicht vorhanden!");
                        helpers.debug("properties for element dont exist:");
                        helpers.debug($el);
                    }
                    return data.properties;
                },
                getProperty: function ($el, group, property) {
                    //alert("not implemented: getProperty");
                    var properties = this.getProperties($el);
                    return properties[group][property];
                },
                setProperty: function ($el, group, property, value) {
                    if (!$el.hasClass('layoutElement')) {
                        //alert("Konsole prüfen!!! Eigenschaften verlorengegangen?")
                        helpers.debug("properties for element dont exist:");
                        helpers.debug($el);
                        $el = $el.parents('.layoutElement');
                        helpers.debug('changed selected element to...');
                        helpers.debug($el);
                    }
                    //console.log('updating property: ' + property + ' to : ' + value);
                    //update gui
                    jlfwrk_layout.layout.element._setPropertyUpdateGui($el, group, property, value);
                    jlfwrk_layout.layout._updateToolbar($el);
                },
                _setPropertyStoreSetting: function ($el, group, property, value) {

                    if ($el.parents('#label').length > 0) {
                        //alert("layout");
                        //console.log($el.parents('#label').length);


                        var properties = jlfwrk_layout.layout.element.getProperties($el);
                        //console.log(properties);
                        //console.log(group);
                        properties[group][property].value = value;
                        jlfwrk_layout.labelDocument.layoutChanged = true;
                        helpers.propertiesWindowRefresh($('#winProperties'), properties, jlfwrk_layout.layout.element.setProperty, $el);
                        //} else {
                        //  console.log('settings not saved for preview');
                    }
                },
                _setPropertyUpdateGui: function ($el, group, property, value) {
                    if (group === 'general') {
                        //handle general properties
                        switch (property) {
                            case 'value':
                                //jlfwrk_layout.layout.element.rerender($el);
                                jlfwrk_layout.layout.element.setValue($el, value);
                                break;
                            case 'name':
                                //jlfwrk_layout.layout.element.rerender($el);
                                jlfwrk_layout.layout.element.setName($el, value);
                                break;
                            case 'top':
                                jlfwrk_layout.layout.element.setPosTop($el, value, 'mm');
                                break;
                            case 'left':
                                //console.log('left!');
                                jlfwrk_layout.layout.element.setPosLeft($el, value, 'mm');
                                break;
                            case 'height':
                                jlfwrk_layout.layout.element.setHeight($el, value, 'mm');
                                break;
                            case 'width':
                                jlfwrk_layout.layout.element.setWidth($el, value, 'mm');
                                break;
                            case 'alignment':
                                if (value === 'left') {
                                    jlfwrk_layout.layout.element.setAlignLeft($el);
                                } else if (value === 'center') {
                                    jlfwrk_layout.layout.element.setAlignCenter($el);
                                } else if (value === 'right') {
                                    jlfwrk_layout.layout.element.setAlignRight($el);
                                }
                                break;
                            case 'verticalAlignment':
                                if (value === 'top') {
                                    jlfwrk_layout.layout.element.setVerticalAlignTop($el);
                                } else if (value === 'middle') {
                                    jlfwrk_layout.layout.element.setVerticalAlignMiddle($el);
                                } else if (value === 'bottom') {
                                    jlfwrk_layout.layout.element.setVerticalAlignBottom($el);
                                }
                                break;
                            case 'fontFamily':
                                jlfwrk_layout.layout.element.setFontFamily(value);
                                break;
                            case 'fontSize':
                                jlfwrk_layout.layout.element.setFontSize(value);
                                break;
                            case 'fontBold':
                                jlfwrk_layout.layout.element.setFontBold(value);
                                break;
                            case 'fontItalic':
                                jlfwrk_layout.layout.element.setFontItalic(value);
                                break;
                            case 'fontUnderline':
                                jlfwrk_layout.layout.element.setFontUnderline(value);
                                break;
                            default:
                                //nothing to do
                        }
                    } else {
                        //refresh element, because of external properties
                        this._setPropertyStoreSetting($el, group, property, value);
                        ;
                        jlfwrk_layout.layout.element.rerender($el);
                    }
                },
                getType: function ($el) {
                    return this.getProperty($el, 'general', 'type').value;
                },
                getTypeData: function (type) {
                    var elementType = jlfwrk_layout.layout._elementTypes.find(jlfwrk_layout.layout.element.byType, type);
                    return elementType;
                },
                getValue: function ($el) {
                    return this.getProperty($el, 'general', 'value').value;
                },
                _generateElementName: function (type) {
                    var elementType = jlfwrk_layout.layout.element.getTypeData(type);
                    elementType.counter++; //start with 1, so counter update first

                    //console.log(elementType);
                    var elementName = elementType.label + "_" + elementType.counter;
                    return elementName;
                },
                renderTemplate: function (type, value, properties) {
                    //console.log(jlfwrk_layout.layout._elementTypes);
                    //var elementType = jlfwrk_layout.layout._elementTypes.find(jlfwrk_layout.layout.element.byType, type);

                    //console.log(elementType);
                    var elementType = jlfwrk_layout.layout.element.getTypeData(type);
                    var elementName = 'new element';
                    if (properties !== undefined && properties.general !== undefined && properties.general.name !== undefined) {
                        elementName = properties.general.name.value;
                    }

                    if (value === undefined) {
                        //value = elementType.defaultValue;
                        if (elementType.defaultValue === undefined) {
                            value = elementName;
                        } else {
                            value = elementType.defaultValue;
                        }
                    }



                    //special handling for arrows
                    if (type === "arrow") {
                        //console.log("v"+value);
                        if (value * 1 >= 0 && value * 1 <= 4) {
                            //value seems to be ok
                            //console.log("OK");
                            value = value * 1;
                        } else {
                            value = 0;
                        }
                    }


                    //place new element
                    var $template = $('<div class="layoutElement" value="%VALUE%"><div class="layoutElementContent"></div></div>'.replace(/%VALUE%/g, value))
                    $template.attr("_elementType", elementType.name);
                    $template.attr("_elementName", elementName);
                    //$template.attr("_value", value);

                    var elementHtml = elementType.template.replace(/%VALUE%/g, value);
                    //handle properties
                    if (properties !== undefined) {
                        elementHtml = this.renderProperties(elementHtml, properties);
                    }

                    $template.find(".layoutElementContent").html(elementHtml);
                    return $template;
                },
                renderProperties: function (template, properties) {

                    $.each(properties, function (group, groupProperties) {
                        $.each(groupProperties, function (propertyName, propertyObj) {
                            var search = '%' + group + '/' + propertyName + '%';
                            //console.log(search);
                            template = template.replace(search, propertyObj.value);
                            //console.log(template);
                        });
                    });
                    return template;
                },
                rerender: function ($el) {
                    //var elementType = $el.attr("_elementType");
                    var elementType = jlfwrk_layout.layout.element.getType($el);
                    var elementProperties = jlfwrk_layout.layout.element.getProperties($el);
                    var elementValue = jlfwrk_layout.layout.element.getValue($el);
                    //alert(elementValue);
                    var rendered = jlfwrk_layout.layout.element.renderTemplate(elementType, elementValue, elementProperties).find(".layoutElementContent").html();
                    //console.log(rendered);
                    $el.find(".layoutElementContent").html(rendered);
                    //general properties
                    jlfwrk_layout.layout.element.setFormatting($el);
                },
                select: function ($el, changeToolbar) {
                    if (changeToolbar === undefined) {
                        changeToolbar = true;
                    }

                    jlfwrk_layout.layout._$layoutElement = $el;
                    jlfwrk_layout.layout.element.deselect();
                    //console.log($el);
                    jlfwrk_layout.layout._$layoutElement.addClass("layoutElementEditSelected");
                    //console.log('endsel');

                    //update properties window
                    helpers.propertiesWindowRefresh($('#winProperties'), this.getProperties($el), jlfwrk_layout.layout.element.setProperty, $el);
                    if (changeToolbar === true) {
                        jlfwrk_layout.layout._updateToolbar($el);
                    }
                },
                setFormatting: function () {
                    var tools = $("#toolFormat").jqxToolBar("getTools");
                    jlfwrk_layout.layout.element.setFontFamily(tools[0].tool.val());
                    jlfwrk_layout.layout.element.setFontSize(tools[1].tool.val());
                    jlfwrk_layout.layout.element.setFontBold(tools[2].tool.jqxToggleButton('toggled'));
                    jlfwrk_layout.layout.element.setFontItalic(tools[3].tool.jqxToggleButton('toggled'));
                    jlfwrk_layout.layout.element.setFontUnderline(tools[4].tool.jqxToggleButton('toggled'));
                    if (tools[5].tool.jqxToggleButton('toggled')) {
                        jlfwrk_layout.layout.element.setAlignLeft();
                    } else if (tools[6].tool.jqxToggleButton('toggled')) {
                        jlfwrk_layout.layout.element.setAlignCenter();
                    } else if (tools[7].tool.jqxToggleButton('toggled')) {
                        jlfwrk_layout.layout.element.setAlignRight();
                    }

                    if (tools[8].tool.jqxToggleButton('toggled')) {
                        jlfwrk_layout.layout.element.setVerticalAlignTop();
                    } else if (tools[9].tool.jqxToggleButton('toggled')) {
                        jlfwrk_layout.layout.element.setVerticalAlignMiddle();
                    } else if (tools[10].tool.jqxToggleButton('toggled')) {
                        jlfwrk_layout.layout.element.setVerticalAlignBottom();
                    }
                },
                setAlignLeft: function ($el) {
                    if ($el === undefined) {
                        //use selected layout element if no element specified
                        $el = jlfwrk_layout.layout._$layoutElement;
                    }
                    //console.log(jlfwrk_layout.layout._$layoutElement);
                    if (jQuery.type($el) === "object") {
                        $el.css("text-align", "left");
                        this._setPropertyStoreSetting($el, 'general', 'alignment', 'left');
                    }
                    var tools = $("#toolFormat").jqxToolBar("getTools");
                    tools[6].tool.jqxToggleButton("toggled", false);
                    tools[7].tool.jqxToggleButton("toggled", false);
                },
                setAlignCenter: function ($el) {
                    if ($el === undefined) {
                        //use selected layout element if no element specified
                        $el = jlfwrk_layout.layout._$layoutElement;
                    }
                    if (jQuery.type($el) === "object") {
                        $el.css("text-align", "center");
                        this._setPropertyStoreSetting($el, 'general', 'alignment', 'center');
                    }
                    var tools = $("#toolFormat").jqxToolBar("getTools");
                    tools[5].tool.jqxToggleButton("toggled", false);
                    tools[7].tool.jqxToggleButton("toggled", false);
                },
                setAlignRight: function ($el) {
                    if ($el === undefined) {
                        //use selected layout element if no element specified
                        $el = jlfwrk_layout.layout._$layoutElement;
                    }
                    if (jQuery.type($el) === "object") {
                        $el.css("text-align", "right");
                        this._setPropertyStoreSetting($el, 'general', 'alignment', 'right');
                    }
                    var tools = $("#toolFormat").jqxToolBar("getTools");
                    tools[5].tool.jqxToggleButton("toggled", false);
                    tools[6].tool.jqxToggleButton("toggled", false);
                },
                setName: function ($el, value) {
                    //console.log(jlfwrk_layout.labelDocument.config.layout.data);
                    this._setPropertyStoreSetting($el, 'general', 'name', value);
                },
                setOrderTop: function ($el) {
                    //console.log('moveTop');
                    var oldZIndex = this.getProperty($el, 'general', 'zIndex');
                    var maxIndex = 0;
                    $('.layoutElement').each(function () {
                        var $curEl = $(this);
                        var curZIndex = jlfwrk_layout.layout.element.getProperty($curEl, 'general', 'zIndex');
                        if (curZIndex.value > oldZIndex.value) {
                            //move all items with higher z-Index backward 1 until moved (empty) zindex is reached
                            maxIndex = Math.max(maxIndex, curZIndex.value);
                            curZIndex.value--;
                            $curEl.css('z-index', curZIndex.value);
                        }
                    });
                    oldZIndex.value = maxIndex;
                    $el.css('z-index', oldZIndex.value);
                },
                setOrderBottom: function ($el) {
                    //console.log('moveBottom');
                    var oldZIndex = this.getProperty($el, 'general', 'zIndex');
                    $('.layoutElement').each(function () {
                        var $curEl = $(this);
                        var curZIndex = jlfwrk_layout.layout.element.getProperty($curEl, 'general', 'zIndex');
                        //console.log(curZIndex.value);
                        //console.log('old:');
                        //console.log(oldZIndex.value);
                        if (curZIndex.value <= oldZIndex.value) {
                            //move all items forward 1 until moved (empty) zindex is reached
                            curZIndex.value++;
                            $curEl.css('z-index', curZIndex.value);
                            //jlfwrk_layout.layout.element.setProperty($(this), 'general', 'zIndex', curZIndex.value);
                            //console.log(jlfwrk_layout.layout.element.getProperty($(this), 'general', 'zIndex'));
                        }
                    });
                    oldZIndex.value = 1;
                    $el.css('z-index', oldZIndex.value);
                },
                setOrderUp: function ($el) {
                    //console.log('moveUp');
                    var oldZIndex = this.getProperty($el, 'general', 'zIndex');
                    $('.layoutElement').each(function () {
                        var $curEl = $(this);
                        var curZIndex = jlfwrk_layout.layout.element.getProperty($curEl, 'general', 'zIndex');
                        if (curZIndex.value === oldZIndex.value + 1) {
                            //move items with z-index +1 backward 1
                            curZIndex.value--;
                            $curEl.css('z-index', curZIndex.value);
                        }
                    });
                    oldZIndex.value++;
                    $el.css('z-index', oldZIndex.value);
                },
                setOrderDown: function ($el) {
                    //console.log('moveDown');
                    var oldZIndex = this.getProperty($el, 'general', 'zIndex');
                    $('.layoutElement').each(function () {
                        var $curEl = $(this);
                        var curZIndex = jlfwrk_layout.layout.element.getProperty($curEl, 'general', 'zIndex');
                        if (curZIndex.value === oldZIndex.value - 1 && oldZIndex.value > 1) {
                            //move items with z-index +1 backward 1
                            curZIndex.value++;
                            $curEl.css('z-index', curZIndex.value);
                        }
                    });
                    if (oldZIndex.value > 1) {
                        //can be moved
                        oldZIndex.value--;
                    } else {
                        //last element
                        jlfwrk_layout.layout.element.setOrderBottom($el)
                    }
                    $el.css('z-index', oldZIndex.value);
                },
                setPosLeft: function ($el, value, units, zoom) {
                    if (zoom === undefined) {
                        zoom = 1;
                    }
                    var pxValue = this.unitsToPx(value, units);
                    //console.log('setting left');
                    //console.log(pxValue);

                    var labelWidthPx = this.unitsToPx(jlfwrk_layout.labelDocument.config.label.labelWidth, 'mm');
                    if (labelWidthPx > pxValue && pxValue >= 0) {
                        //only move if within label
                        $el.css("left", pxValue * zoom);
                        /*
                         var pos = {
                         of: '#label',
                         my: 'left',
                         at: 'left+' + pxValue
                         };
                         console.log(pos);
                         $el.position(pos);
                         */

                        if (units === 'mm') {
                            this._setPropertyStoreSetting($el, 'general', 'left', value);
                        } else {
                            this._setPropertyStoreSetting($el, 'general', 'left', this.pxToMm(pxValue));
                        }
                        /*
                         }else{
                         console.log(labelWidthPx);
                         console.log(pxValue);
                         */
                    }
                },
                setPosTop: function ($el, value, units, zoom) {
                    if (zoom === undefined) {
                        zoom = 1;
                    }
                    var pxValue = this.unitsToPx(value, units);
                    if (this.unitsToPx(jlfwrk_layout.labelDocument.config.label.labelHeight, 'mm') > pxValue && pxValue >= 0) {
                        //only move if within label
                        $el.css("top", pxValue * zoom);
                        if (units === 'mm') {
                            this._setPropertyStoreSetting($el, 'general', 'top', value);
                        } else {
                            this._setPropertyStoreSetting($el, 'general', 'top', this.pxToMm(pxValue));
                        }
                    }
                },
                setWidth: function ($el, value, units, zoom) {
                    if (zoom === undefined) {
                        zoom = 1;
                    }
                    //console.log('width' + value);

                    if (value === undefined) {
                        //get value from element and store in property
                        this._setPropertyStoreSetting($el, 'general', 'width', this.pxToMm($el.width()));
                    } else {
                        var pxValue = this.unitsToPx(value, units);
                        if (pxValue > 2) {
                            $el.css("width", pxValue * zoom);
                            if (units === 'mm') {
                                this._setPropertyStoreSetting($el, 'general', 'width', value);
                            } else {
                                this._setPropertyStoreSetting($el, 'general', 'width', this.pxToMm(pxValue));
                            }
                            //console.log('done');
                        }
                    }
                },
                setHeight: function ($el, value, units, zoom) {
                    if (zoom === undefined) {
                        zoom = 1;
                    }

                    if (value === undefined) {
                        //get value from element and store in property
                        this._setPropertyStoreSetting($el, 'general', 'height', this.pxToMm($el.height()));
                    } else {
                        var pxValue = this.unitsToPx(value, units);
                        if (pxValue > 2) {
                            $el.css("height", pxValue * zoom);
                            if (units === 'mm') {
                                this._setPropertyStoreSetting($el, 'general', 'height', value);
                            } else {
                                this._setPropertyStoreSetting($el, 'general', 'height', this.pxToMm(pxValue));
                            }

                            this.rerender($el);
                        }
                    }
                },
                unitsToPx: function (value, units) {
                    var pxValue = 0;
                    if (units === 'mm') {
                        pxValue = value * jlfwrk_layout.labelDocument.config.layout.conversion;
                        pxValue = pxValue.toFixed(3);
                        //}else if(units === 'in'){
                    } else {
                        //default = px
                        pxValue = value;
                    }

                    return Number(pxValue);
                },
                handleResize: function ($el) {
                    var width = $el.width();
                    var height = $el.height();
                    //formatting needs to be reset for line height etc.
                    jlfwrk_layout.layout.element.setFormatting();
                    //set image size
                    $el.find("img").height(height + "px");
                    $el.find("img").width(width + "px");
                    //console.log($eObj.height());
                    //console.log("resize: end");
                },
                pxToMm: function (value) {
                    var mmValue = value / jlfwrk_layout.labelDocument.config.layout.conversion;
                    mmValue = mmValue.toFixed(3);
                    return Number(mmValue);
                },
                setValue: function ($el, value) {
                    //jlfwrk_layout.layout.element.setProperty($el, 'general', 'value', value);
                    this._setPropertyStoreSetting($el, 'general', 'value', value);
                    jlfwrk_layout.layout.element.rerender($el);
                },
                setVerticalAlignTop: function ($el) {
                    if ($el === undefined) {
                        //use selected layout element if no element specified
                        $el = jlfwrk_layout.layout._$layoutElement;
                    }
                    if (jQuery.type($el) === "object") {
                        $el.find(".layoutElementContent").css("top", 0);
                        $el.find(".layoutElementContent").css("bottom", "auto");
                        $el.find(".layoutElementContent").css("line-height", "100%");
                        $el.attr("_valign", "top");
                        this._setPropertyStoreSetting($el, 'general', 'verticalAlignment', 'top');
                    }
                    var tools = $("#toolFormat").jqxToolBar("getTools");
                    tools[9].tool.jqxToggleButton("toggled", false);
                    tools[10].tool.jqxToggleButton("toggled", false);
                },
                setVerticalAlignMiddle: function ($el) {
                    if ($el === undefined) {
                        //use selected layout element if no element specified
                        $el = jlfwrk_layout.layout._$layoutElement;
                    }
                    if (jQuery.type($el) === "object") {
                        $el.find(".layoutElementContent").css("top", "auto");
                        $el.find(".layoutElementContent").css("bottom", "auto");
                        $el.find(".layoutElementContent").css("line-height", $el.height() + "px");
                        $el.attr("_valign", "middle");
                        this._setPropertyStoreSetting($el, 'general', 'verticalAlignment', 'middle');
                    }
                    var tools = $("#toolFormat").jqxToolBar("getTools");
                    tools[8].tool.jqxToggleButton("toggled", false);
                    tools[10].tool.jqxToggleButton("toggled", false);
                },
                setVerticalAlignBottom: function ($el) {
                    if ($el === undefined) {
                        //use selected layout element if no element specified
                        $el = jlfwrk_layout.layout._$layoutElement;
                    }
                    if (jQuery.type($el) === "object") {
                        $el.find(".layoutElementContent").css("bottom", 0);
                        $el.find(".layoutElementContent").css("top", "auto");
                        $el.find(".layoutElementContent").css("line-height", "100%");
                        $el.attr("_valign", "bottom");
                        this._setPropertyStoreSetting($el, 'general', 'verticalAlignment', 'bottom');
                    }
                    var tools = $("#toolFormat").jqxToolBar("getTools");
                    tools[8].tool.jqxToggleButton("toggled", false);
                    tools[9].tool.jqxToggleButton("toggled", false);
                },
                setFontSize: function (sizePt) {
                    if (jQuery.type(jlfwrk_layout.layout._$layoutElement) === "object") {
                        /*
                         var mm2point = 0.352778;
                         var sizeInMm = sizePt * mm2point;
                         jlfwrk_layout.layout._$layoutElement.css("font-size", sizeInMm + "mm");
                         */
                        jlfwrk_layout.layout._$layoutElement.css("font-size", sizePt + "pt");
                        jlfwrk_layout.layout._$layoutElement.attr("_fsize", sizePt);
                        this._setPropertyStoreSetting(jlfwrk_layout.layout._$layoutElement, 'general', 'fontSize', sizePt);
                    }
                },
                setFontBold: function (bold) {
                    if (jQuery.type(jlfwrk_layout.layout._$layoutElement) === "object") {
                        if (bold == true) {
                            jlfwrk_layout.layout._$layoutElement.css("font-weight", "bold");
                            jlfwrk_layout.layout._$layoutElement.attr("_bold", "bold");
                        } else {
                            jlfwrk_layout.layout._$layoutElement.css("font-weight", "normal");
                            jlfwrk_layout.layout._$layoutElement.attr("_bold", "normal");
                        }

                        this._setPropertyStoreSetting(jlfwrk_layout.layout._$layoutElement, 'general', 'fontBold', bold);
                    }
                },
                setFontFamily: function (font) {
                    if (jQuery.type(jlfwrk_layout.layout._$layoutElement) === "object") {
                        /*
                         if (font == "Arial") {
                         jlfwrk_layout.layout._$layoutElement.css("font-family", "Arial");
                         } else if (font == "Courier") {
                         jlfwrk_layout.layout._$layoutElement.css("font-family", "Courier");
                         } else {
                         jlfwrk_layout.layout._$layoutElement.css("font-family", "Arial");
                         }
                         */
                        jlfwrk_layout.layout._$layoutElement.css("font-family", font);
                        this._setPropertyStoreSetting(jlfwrk_layout.layout._$layoutElement, 'general', 'fontFamily', font);
                    }
                },
                setFontItalic: function (italic) {
                    if (jQuery.type(jlfwrk_layout.layout._$layoutElement) === "object") {
                        if (italic == true) {
                            jlfwrk_layout.layout._$layoutElement.css("font-style", "italic");
                        } else {
                            jlfwrk_layout.layout._$layoutElement.css("font-style", "normal");
                        }


                        this._setPropertyStoreSetting(jlfwrk_layout.layout._$layoutElement, 'general', 'fontItalic', italic);
                    }
                },
                setFontUnderline: function (underline) {
                    if (jQuery.type(jlfwrk_layout.layout._$layoutElement) === "object") {
                        if (underline == true) {
                            jlfwrk_layout.layout._$layoutElement.css("text-decoration", "underline");
                        } else {
                            jlfwrk_layout.layout._$layoutElement.css("text-decoration", "none");
                        }

                        this._setPropertyStoreSetting(jlfwrk_layout.layout._$layoutElement, 'general', 'fontUnderline', underline);
                    }
                }
            }
        },
        data: {
            _eventEnter: function () {
                ga('send', 'event', 'Labelmanager', 'Daten', 'aufgerufen');
            },
            _eventExit: function () {
                //alert("e");
                this.dataStore();
            },
            dataStore: function () {
                var rows = $('#jqxGrid').jqxGrid('getrows');
                var cols = $('#jqxGrid').jqxGrid('columns').length() - 1;
                //console.log('cols: ' + cols.toString());
                //console.log(cols.toString());

                //console.log(rows);

                var gridData = [];
                $(rows).each(function () {
                    var row = this;
                    var rowData = {};
                    var valSet = false;
                    var i = 0;
                    $.each(row, function (fieldIndex, field) {
                        if (i < cols) {
                            //console.log(fieldIndex);
                            //console.log(field);
                            rowData[fieldIndex] = field;
                            if (field !== "") {
                                valSet = true;
                            }
                        }
                        i++;
                    });
                    /*
                     $.each(jlfwrk_layout.labelDocument.config.layout.elements, function () {
                     var curEl = this.name;
                     //if (value != "") {
                     rowData[curEl] = row[curEl];
                     if (row[curEl] !== "") {
                     valSet = true;
                     }
                     //console.log(row[curEl]);
                     //console.log(value);
                     //}
                     });
                     */
                    if (valSet === true) {
                        //ignore empty rows
                        gridData.push(rowData);
                    }
                    //console.log(this);
                });
                //console.log(gridData);
                jlfwrk_layout.labelDocument.config.layout.data = gridData;
                //console.log(jlfwrk_layout.labelDocument.config.layout);

                if (gridData.length > 0) {
                    ga('send', 'event', 'Labelmanager', 'Daten', 'eingegeben');
                }
            },
            mergedValue: function (field, mergeColumns, row) {
                //if (jQuery.inArray(field, mergeColumns)) {
                if (mergeColumns.indexOf(field) !== -1) {
                    //column should be merged
                    //console.log('merging');
                    //merged value

                    //console.log(jlfwrk_layout.labelDocument.config.layout.data);
                    //console.log('l: ' + jlfwrk_layout.labelDocument.config.layout.data.length);
                    if (jlfwrk_layout.labelDocument.config.layout.data.length > row) {
                        //console.log(jlfwrk_layout.labelDocument.config.layout.data[row]);
                        return jlfwrk_layout.labelDocument.config.layout.data[row][field];
                    } else {
                        return "";
                    }
                } else {
                    //console.log("column not relevant: " + field);
                    //console.log(mergeColumns.indexOf(field + "d"));
                    //console.log(mergeColumns);
                    return "";
                }
            },
            renameColumn: function (arrOld, arrNew) {
                //console.log(jlfwrk_layout.labelDocument.config.layout.data);
                $.each(jlfwrk_layout.labelDocument.config.layout.data, function (rowNo, row) {
                    $.each(arrOld, function (oldIndex, oldProperty) {
                        if (row.hasOwnProperty(oldProperty)) {
                            row[arrNew[oldIndex]] = row[oldProperty];
                            delete row[oldProperty];
                        }
                    });
                    //console.log(row);
                });
                //var a = fruits.indexOf("Apple");
                //console.log(jlfwrk_layout.labelDocument.config.layout.data);
            },
            viewMain: function ($appendTo) {
                var $html = $('<div class="textFrame"><h2>' + l.get("dataTitle") + '</h2><div id="jqxGrid"></div><div id="layoutDataHelp"></div></div>');
                $appendTo.append($html);
                $("#layoutDataHelp").append('<div>' + l.get("dataHelpGeneralTitle") + '</div><div>' + l.get("dataHelpGeneralContent") + '</div>');
                $("#layoutDataHelp").append('<div>' + l.get("dataHelpTextfieldTitle") + '</div><div>' + l.get("dataHelpTextfieldContent") + '</div>');
                $("#layoutDataHelp").append('<div>' + l.get("dataHelpBarcodeTitle") + '</div><div>' + l.get("dataHelpBarcodeContent") + '</div>');
                $("#layoutDataHelp").append('<div>' + l.get("dataHelpArrowTitle") + '</div><div>' + l.get("dataHelpArrowContent") + '</div>');
                $("#layoutDataHelp").jqxNavigationBar({width: 300, height: 260});
            },
            viewMainReload: function (keepData) {
                /*
                 if ($('#jqxGrid').length > 0) {
                 console.log($('#jqxGrid').length);
                 $('#jqxGrid').jqxGrid('destroy');
                 console.log($('#jqxGrid').length);
                 }
                 */

                // renderer for grid cells.
                var numberrenderer = function (row, column, value) {
                    return '<div style="text-align: center; margin-top: 5px;">' + (1 + value) + '</div>';
                }

                // create Grid datafields and columns arrays.
                var datafields = [];
                var columns = [];
                //columns
                //label column
                var cssclass = 'jqx-widget-header';
                if (theme !== '') {
                    cssclass += ' jqx-widget-header-' + theme;
                }
                columns[columns.length] = {pinned: true, exportable: false, text: "", columntype: 'number', cellclassname: cssclass, cellsrenderer: numberrenderer};
                //data columns
                var colNames = [];
                //console.log(jlfwrk_layout.labelDocument.config.layout.elements);

                //walk datafields to create list of columns
                $.each(jlfwrk_layout.labelDocument.config.layout.dataFields, function (fieldIndex, field) {
                    //var text = String.fromCharCode(65 + i);

                    //console.log(field);
                    var fieldID = field.elementId + '-' + field.name;
                    //console.log(fieldID);

                    //datafields[datafields.length] = {name: fieldID};
                    columns[columns.length] = {text: field.label, datafield: fieldID, width: 120, align: 'center'};
                    colNames[colNames.length] = fieldID;
                    //console.log(this.type);
                });
                //existing data?
                var datafields = [];
                var mergeColumns = [];
                if (keepData === true) {
                    //existing data kept as much as possible
                    //console.log(colNames);
                    //console.log(jlfwrk_layout.labelDocument.config.layout.data);
                    $(colNames).each(function (colIndex, curCol) {

                        if (typeof curCol === 'string' || curCol instanceof String) {
                            //console.log('col ' + curCol);
                            //console.log(curCol.toString());
                            //console.log(jlfwrk_layout.labelDocument.config.layout.data);
                            if (jlfwrk_layout.labelDocument.config.layout.data.length > 0) {
                                //alert(jlfwrk_layout.labelDocument.config.layout.data[0][curCol.toString()]);
                                if (jlfwrk_layout.labelDocument.config.layout.data[0][curCol] !== undefined) {
                                    //console.log("column exists");
                                    mergeColumns.push(curCol.toString());
                                    //console.log(mergeColumns);
                                }
                            }
                            /*
                             if (jlfwrk_layout.labelDocument.config.layout.data[0][curCol] !== undefined) {
                             console.log("column exists");
                             }
                             */
                            //console.log('push');
                            datafields.push({name: curCol});
                        }
                        //console.log("merge:");
                        //console.log(mergeColumns);
                        //alert(this);                                                       
                    });
                    //console.log(mergeColumns);
                    //console.log(datafields);

                    //create new dataset
                    var newDS = [];
                    //console.log("columns:");
                    //console.log(colNames);
                    //console.log(jlfwrk_layout.labelDocument.config.layout.data);

                    //var showRows = jlfwrk_layout.labelDocument.config.layout.data.length;
                    var showRows = 999;
                    for (var j = 0; j < showRows; j++) {
                        newDS[j] = {};
                        var curLine = newDS[j];
                        $(colNames).each(function (colIndex, curCol) {
                            if (typeof curCol === 'string' || curCol instanceof String) {
                                //console.log(curCol + ' z' + j);
                                //console.log(j + jlfwrk_layout.data.mergedValue(curCol, mergeColumns, j));
                                curLine[curCol] = jlfwrk_layout.data.mergedValue(curCol, mergeColumns, j);
                            }
                        });
                    }
                    //console.log("new:");
                    //console.log(newDS);
                    //console.log(datafields);

                    // prepare the data
                    var source =
                            {
                                datatype: "json",
                                datafields: datafields,
                                localdata: newDS
                            };
                } else {
                    //empty dataset
                    jlfwrk_layout.labelDocument.config.layout.data = {};
                    var source =
                            {
                                unboundmode: true,
                                totalrecords: 999,
                                datafields: datafields,
                                updaterow: function (rowid, rowdata) {
                                    // synchronize with the server - send update command   
                                }
                            };
                }
                var dataAdapter = new $.jqx.dataAdapter(source);
                // initialize jqxGrid
                $("#jqxGrid").jqxGrid({
                    width: 750,
                    height: 550,
                    source: dataAdapter,
                    editable: true,
                    columnsresize: true,
                    selectionmode: 'multiplecellsadvanced',
                    columns: columns
                });
            }
        },
        preview: {
            _currentStartLabel: 0,
            _zoomFactor: 0.45,
            viewLabelPreview: function ($appendTo) {
                var $html = $('<div id="toolPreview"></div><div class="textFrame"><h2>' + l.get("previewTitle") + '</h2><div id="previewArea"><div id="previewPage"></div></div></div>');
                $appendTo.append($html);
                $("#toolPreview").jqxToolBar({
                    width: 1200, height: 45, tools: 'button button | button | button ',
                    initTools: function (type, index, tool, menuToolIninitialization) {
                        if (type == "button") {
                            var icon = $("<div class='jqx-editor-toolbar-icon jqx-editor-toolbar-icon-" + theme + " buttonIcon'></div>");
                        }
                        switch (index) {
                            case 0:
                                //tool.jqxButton({width: 30, height: 30});
                                icon.addClass("toolbarIcon toolbarPrev");
                                icon.attr("title", l.get("previewPrevious"));
                                tool.append(icon);
                                tool.on("click", function () {
                                    //jlfwrk_layout.previewPreparePrintData();
                                    jlfwrk_layout.preview.pagePrevious();
                                });
                                break;
                            case 1:
                                icon.addClass("toolbarIcon toolbarNext");
                                icon.attr("title", l.get("previewNext"));
                                tool.append(icon);
                                tool.on("click", function () {
                                    //jlfwrk_layout.previewPreparePrintData();
                                    jlfwrk_layout.preview.pageNext();
                                });
                                break;
                            case 2:
                                icon.addClass("toolbarIcon toolbarPrint");
                                icon.attr("title", l.get("previewPrint"));
                                tool.append(icon);
                                tool.on("click", function () {
                                    //jlfwrk_layout.previewPreparePrintData();
                                    jlfwrk_layout.printDialog();
                                });
                                break;
                            case 3:
                                icon.addClass("toolbarIcon toolbarSave");
                                icon.attr("title", l.get("previewSave"));
                                tool.append(icon);
                                tool.on("click", function () {
                                    jlfwrk_layout.labelDocument.labelSaveFile();
                                    ga('send', 'event', 'Labelmanager', 'Vorschau', 'Datei gespeichert - Toolbar');
                                });
                                break;
                        }
                    }
                });
                jlfwrk_layout.preview.viewLabelPreviewReload(); //called from callback
            },
            viewLabelPreviewReload: function (startLabel) {
                var myself = this;
                $("#previewPage").html("");
                if (startLabel === undefined) {
                    startLabel = 0;
                }
                var $html = jlfwrk_layout.preview.pagePreview(startLabel);
                $("#previewPage").append($html);
                var pageInfo;
                var curPage = Math.floor(startLabel / (jlfwrk_layout.labelDocument.config.label.hLabels * jlfwrk_layout.labelDocument.config.label.vLabels)) + 1;
                var numPages = Math.ceil(jlfwrk_layout.labelDocument.config.layout.data.length / (jlfwrk_layout.labelDocument.config.label.hLabels * jlfwrk_layout.labelDocument.config.label.vLabels));
                if (numPages === 0) {
                    numPages = 1; //fix for no data
                }
                if (curPage === undefined) {
                    curPage = 1;
                }
                //pageInfo = "Seite " + curPage + " von " + numPages;

                pageInfo = l.get("previewPageInfo");
                pageInfo = pageInfo.replace("{0}", curPage);
                pageInfo = pageInfo.replace("{1}", numPages);
                $(".textFrame h2").first().html(l.get("previewTitle") + " (" + pageInfo + ")");
                //console.log(pageInfo);
                jlfwrk_layout.preview._currentStartLabel = startLabel;
                //alert($(".label").css('height'));

                //reloadLabels();


            },
            pagePreview: function (startLabel) {
                var confObj = jlfwrk_layout.labelDocument.config.label;
                if (startLabel === undefined) {
                    //show page setup
                } else if (typeof (startLabel) === 'object') {
                    //show page setup for passed format
                    //alert("object");
                    //console.log(startLabel)
                    confObj = startLabel;
                } else {
                    //normal preview with data
                }

                //console.log(startLabel);

                //### page structure ###
                var html = '<div class="pagePreviewItemPageWrap"><div class="pagePreviewItemPage">';
                //console.log(this.label);
                //console.log(confObj);
                for (var vItem = 0; vItem < confObj.vLabels; vItem++) {
                    //walk lines
                    for (var hItem = 0; hItem < confObj.hLabels; hItem++) {
                        //walk columns
                        //$("#previewPage").append('<div class="previewLabel"></div>');

                        //horizontal margin
                        var margin = '';
                        if (hItem !== confObj.hLabels - 1) {
                            margin = 'margin-right: ' + confObj.hSpace * jlfwrk_layout.preview._zoomFactor + 'mm; '
                        }

                        //vertical margin
                        var vMargin = '';
                        if (vItem !== confObj.vLabels - 1) {
                            //console.log(vItem);
                            vMargin = 'margin-bottom: ' + confObj.vSpace * jlfwrk_layout.preview._zoomFactor + 'mm; '
                        } else {
                            //console.log(vItem);
                            //console.log(vMargin);
                        }


                        //console.log(margin);
                        html += '<div class="pagePreviewItemLabel" style="' + margin + vMargin + '"></div>';
//html += '<div class="pagePreviewItemLabel"></div>';
                    }

                    //$("#previewPage").append('<br />');
                    html += '<br />';
                }
                html += '</div></div>';
                var $html = $(html);
                var $previewPage = $html.find('.pagePreviewItemPage');
                $previewPage.css('width', confObj.pageWidth * jlfwrk_layout.preview._zoomFactor + 'mm');
                $previewPage.css('height', confObj.pageHeight * jlfwrk_layout.preview._zoomFactor + 'mm');
                $previewPage.css('padding-left', confObj.marginLeft * jlfwrk_layout.preview._zoomFactor + 'mm');
                $previewPage.css('padding-top', confObj.marginTop * jlfwrk_layout.preview._zoomFactor + 'mm');
                //alert($(".page").css('padding-top'));
                //alert($previewPage.css('width'));

                var $previewLabel = $html.find('.pagePreviewItemLabel');
                $previewLabel.css('width', confObj.labelWidth * jlfwrk_layout.preview._zoomFactor + 'mm');
                $previewLabel.css('height', confObj.labelHeight * jlfwrk_layout.preview._zoomFactor + 'mm');
                $previewLabel.css('line-height', confObj.labelHeight * jlfwrk_layout.preview._zoomFactor + 'mm');
                //font size
                $previewLabel.css('font-size', confObj.fSize * jlfwrk_layout.preview._zoomFactor + 'mm');
                //$previewLabel.css('margin-right', confObj.hSpace * jlfwrk_layout.preview._zoomFactor + 'mm');
                //$previewLabel.css('margin-bottom', confObj.vSpace * jlfwrk_layout.preview._zoomFactor + 'mm');

                //### data ###
                //label content
                //alert(jlfwrk_layout.preview._labelContent());
                var labelCounter = startLabel;
                if (startLabel !== undefined && startLabel >= 0) {
                    //normal data
                    //console.log('normal');
                    $previewLabel.each(function () {
                        $(this).append(jlfwrk_layout.preview._labelContent(labelCounter));
                        labelCounter++;
                        //console.log(labelCounter);
                    });
                } else if (startLabel === undefined) {
                    //show page preview with sample text
                    $previewLabel.each(function () {
                        $(this).append('Sample');
                    });
                }

                return $html;
            },
            _eventEnter: function () {
                jlfwrk_layout.preview.viewLabelPreviewReload();
                ga('send', 'event', 'Labelmanager', 'Vorschau', 'aufgerufen');
            },
            _labelContent: function (labelID) {
                var value;
                var viewData = "data";
                if (labelID !== undefined && labelID < jlfwrk_layout.labelDocument.config.layout.data.length) {
                    var rowData = jlfwrk_layout.labelDocument.config.layout.data[labelID];
                } else {
                    if (labelID !== undefined) {
                        viewData = "none";
                    } else {
                        viewData = "sample";
                    }
                }

                //console.log(jlfwrk_layout.labelDocument.config.layout.elements);
                var $html = $('<div class="previewLabelContent"></div>');
                var elCounter = 0;
                //console.log(jlfwrk_layout.labelDocument.config.layout.elements.length);
                //console.log(Object.keys(jlfwrk_layout.labelDocument.config.layout.elements).length);
                $(jlfwrk_layout.labelDocument.config.layout.elements).each(function (elementIndex, element) {
                    //helpers.looper(jlfwrk_layout.labelDocument.config.layout.elements, function (elementName, element) {
                    var elementName = element._hidden.id;
                    //console.log('label content generated');
                    //alert("i");
                    //console.log(this);
                    //var $newEl = $('<div class="previewLabelContentElement">Beispiel</div>');
                    //alert(this.type);
                    //console.log(element);
                    //console.log(rowData);
                    if (viewData === "data") {
                        //value = rowData[this.name];
                        //console.log(elementName + '-value');
                        /*
                         console.log(element.general);
                         console.log(element.general.name);
                         console.log(element.general.name.value);
                         */
                        value = rowData[elementName + '-value'];
                    } else if (viewData === "sample") {
                        value = l.get("previewSampleData");
                    } else if (viewData === "none") {
                        value = "";
                    }


                    if (viewData !== 'none') {

                        var $newEl = $(jlfwrk_layout.layout.element.renderTemplate(element.general.type.value, value, element));
                        jlfwrk_layout.layout.element.setPosTop($newEl, element.general.top.value, 'mm', jlfwrk_layout.preview._zoomFactor);
                        jlfwrk_layout.layout.element.setPosLeft($newEl, element.general.left.value, 'mm', jlfwrk_layout.preview._zoomFactor);
                        //rerender breaks this:
                        //jlfwrk_layout.layout.element.setHeight($newEl, element.general.height.value, 'mm', jlfwrk_layout.preview._zoomFactor);
                        //jlfwrk_layout.layout.element.setWidth($newEl, element.general.width.value, 'mm', jlfwrk_layout.preview._zoomFactor);
                        $newEl.css("height", jlfwrk_layout.layout.element.unitsToPx(element.general.height.value, 'mm') * jlfwrk_layout.preview._zoomFactor + 'px');
                        $newEl.css("width", jlfwrk_layout.layout.element.unitsToPx(element.general.width.value, 'mm') * jlfwrk_layout.preview._zoomFactor + 'px');
                        //formatting
                        if (element.general.alignment.value === 'left') {
                            jlfwrk_layout.layout.element.setAlignLeft($newEl);
                        } else if (element.general.alignment.value === 'center') {
                            jlfwrk_layout.layout.element.setAlignCenter($newEl);
                        } else if (element.general.alignment.value === 'right') {
                            jlfwrk_layout.layout.element.setAlignRight($newEl);
                        }

                        if (element.general.verticalAlignment.value === 'top') {
                            jlfwrk_layout.layout.element.setVerticalAlignTop($newEl);
                        } else if (element.general.verticalAlignment.value === 'middle') {
                            jlfwrk_layout.layout.element.setVerticalAlignMiddle($newEl);
                        } else if (element.general.verticalAlignment.value === 'bottom') {
                            jlfwrk_layout.layout.element.setVerticalAlignBottom($newEl);
                        }

                        //$newEl.css("line-height", this.height * jlfwrk_layout.preview._zoomFactor + 'px');
                        $newEl.css("font-family", element.general.fontFamily.value);
                        $newEl.css("font-size", element.general.fontSize.value.replace(/[^-\d\.]/g, '') * jlfwrk_layout.preview._zoomFactor + 'px');
                        $newEl.css("font-weight", element.general.fontBold.value);
                        $newEl.css("font-style", element.general.fontItalic.value);
                        $newEl.css("text-decoration", element.general.fontUnderline.value);
                        //Image resizing
                        jlfwrk_layout.layout.element.handleResize($newEl);
                        $html.append($newEl);
                        elCounter++;
                    }
                });
                //console.log($html);

                return $html;
            },
            pageNext: function () {
                var newStart = jlfwrk_layout.preview._currentStartLabel + jlfwrk_layout.labelDocument.config.label.hLabels * jlfwrk_layout.labelDocument.config.label.vLabels;
                if (newStart < jlfwrk_layout.labelDocument.config.layout.data.length) {
                    jlfwrk_layout.preview.viewLabelPreviewReload(newStart);
                }
            },
            pagePrevious: function () {
                var newStart = jlfwrk_layout.preview._currentStartLabel - jlfwrk_layout.labelDocument.config.label.hLabels * jlfwrk_layout.labelDocument.config.label.vLabels;
                if (newStart >= 0) {
                    jlfwrk_layout.preview.viewLabelPreviewReload(newStart);
                }
            }
        },
        tabs: [],
        labelDocument: {
            layoutChanged: false,
            config: {
                fileFormatVersion: 2,
                label: {
                    artNo: "",
                    pageWidth: "",
                    pageHeight: "",
                    marginLeft: "",
                    marginTop: "",
                    labelWidth: "",
                    labelHeight: "",
                    hSpace: "",
                    vSpace: "",
                    hLabels: "",
                    vLabels: ""
                },
                layout: {
                    conversion: 1,
                    elements: [],
                    dataFields: [],
                    data: []
                }
            },
            labelSaveFile: function () {

                var html = '<input type="text" value="' + l.get("saveFileDefault") + '" id="filename" style="width: 100%">';
                //var args = {};
                var $dlg = helpers.dialogShow(l.get("saveFileName"), html, 300, 100, "okCancel", jlfwrk_layout.labelDocument.callbackLabelSaveFile, {});
                $dlg.find("#filename").select();
            },
            labelLoadFile: function () {
                //jlfwrk_layout.previewPreparePrintData();
                //jlfwrk_layout.preview.pagePrevious();
                //alert("open");
                var $dlg = helpers.dialogShow(l.get("openExistingLayout"), '<div id="openFile"></div>', "350px", "200px", "cancel");
                $('#openFile').jqxFileUpload({
                    width: 300,
                    uploadUrl: '../server/uploadlayout.php',
                    fileInputName: 'fileToUpload',
                    autoUpload: true,
                    accept: '.mms',
                    localization: {
                        browseButton: l.get("fileBrowse"),
                        uploadButton: l.get("fileUploadAll"),
                        cancelButton: l.get("fileCancelAll"),
                        uploadFileTooltip: l.get("fileUploadTooltip"),
                        cancelFileTooltip: l.get("fileCancelTooltip")
                    }
                });
                $('#openFile').on('uploadEnd', function (event) {
                    var args = event.args;
                    //var fileName = args.file;
                    //console.log(args);
                    var serverResponse = args.response;
                    if (serverResponse === "ERROR") {
                        alert(l.get("fileUploadError"));
                    } else {
                        $.get("../server/" + serverResponse, function (data) {
                            jlfwrk_layout.labelDocument.labelLoadFileProcessContents(data);

                        });
                    }
                    $dlg.jqxWindow().jqxWindow('close');
                });
                ga('send', 'event', 'Labelmanager', 'Format', 'Datei geöffnet');
            },
            labelLoadFileProcessContents: function (data) {
                //$(".result").html(data);
                //alert("Load was performed.");
                //console.log(data);
                var wrapObj = JSON.parse(data)
                var layoutObj = JSON.parse(wrapObj.labelConfig);
                //console.log(wrapObj);


                //file format version
                var fileFormatVersion;
                if (layoutObj.fileFormatVersion === undefined) {
                    fileFormatVersion = 1;
                } else {
                    fileFormatVersion = layoutObj.fileFormatVersion;
                }

                //console.log(jlfwrk_layout.labelDocument.config.layout);

                //console.log(jlfwrk_layout.labelDocument.config.layout);
                //process loaded data
                //set size
                var $tile = $("#artTile" + layoutObj.label.artNo);
                if ($tile.length > 0) {
                    //jlfwrk_layout.format.formatSet("yes", {$tile: $tile, artObj: layoutObj.label});
                    //$tile.trigger("click");
                    jlfwrk_layout.format.loadData = layoutObj;
                    if (layoutObj)
                        jlfwrk_layout.format._eventArticleTileClick($tile, layoutObj.label, jlfwrk_layout.format["callbackLayoutLoadV" + fileFormatVersion]);
                } else {
                    //tile doesn't exist. custom format?
                    //alert(l.get("fileProcessError"));
                    helpers.debug('article tile doesnt exist. maybe custom format?');
                    //lets see if it works anyway...if doesnt seem to ever go here...ignore for now
                    if (layoutObj)
                        jlfwrk_layout.format._eventArticleTileClick($tile, layoutObj.label, jlfwrk_layout.format["callbackLayoutLoadV" + fileFormatVersion]);
                }

            },
            callbackDialogSaveChanges: function (dialogResult, args, $dialog) {
                if (dialogResult !== "cancel") {
                    //save changes
                    if (dialogResult === "yes") {
                        jlfwrk_layout.labelDocument.labelSaveFile();
                        ga('send', 'event', 'Labelmanager', 'Format', 'Änderungen gespeichert');
                    }

                    //load new layout
                    jlfwrk_layout.format.formatSet(args);
                    //console.log("changing");

                    //callback if set
                    if (args.callback !== undefined) {
                        //console.log("callback");
                        args.callback();
                    }

                    //auto select layout tab
                    $('#jqxTabs').jqxTabs('select', 1);
                }
                if ($dialog !== undefined) {
                    $dialog.remove();
                }
            },
            callbackLabelSaveFile: function (dialogResult, args, $dialog) {
                if (dialogResult === "yes") {

                    var filename = $dialog.find("#filename").val().trim();
                    if (filename.indexOf("/") === -1) {
                        if (filename.substr(-4, 4) !== ".mms") {
                            filename += ".mms";
                        }
                    } else {
                        alert(l.get("saveFileInvalid"));
                    }

                    //var pObj = $.extend({}, jlfwrk_layout.labelDocument.config.layout);
                    var pObj = $.extend({}, jlfwrk_layout.labelDocument.config);
                    //pObj.label = this.label;
                    //pObj.label = jlfwrk_layout.labelDocument.config.label;
                    //console.log(pObj);
                    var pData = {
                        labelConfig: JSON.stringify(pObj)
                    }

                    var $html = $('<form action="../server/savelayout.php" method="POST" id="saveForm"></form>');
                    $html.append('<input type="hidden" name="saveData">');
                    $html.find('input').val(JSON.stringify(pData));
                    $html.append('<input type="hidden" name="filename" value="' + filename + '">');
                    $("body").append($html);
                    $("#saveForm").submit();
                    //reset changes
                    jlfwrk_layout.labelDocument.layoutChanged = false;
                    /*
                     $.post("../server/savelayout.php", pData, function (rData) {
                     console.log(rData);
                     });
                     */
                } else {
                    helpers.debug('save file aborted');
                }

                $dialog.remove();
            }
        },
        settings: {},
        tabAdd: function (label, view) {
            var $tabObj = $('#jqxTabs');
            //console.log("tabs")

            //console.log(this.tabs.length);
            var navHtml = '<input type="button" class="butPrev" value="' + l.get("back") + '"><input type="button" class="butNext" value="' + l.get("next") + '">';
            var navFunction = "next";
            if (this.tabs.length == 0) {
                //last tab
                navHtml = '<input type="button" class="butPrev" value="' + l.get("back") + '"><input type="button" class="butNext" value="' + l.get("print") + '">';
                navFunction = "print";
            } else if (this.tabs.length == 3) {
                //HARDCODED!!!
                navHtml = '<input type="hidden"><input type="button" class="butNext" value="' + l.get("next") + '">';
            }

            this.tabs.push({label: label, view: view});
            //this.tabs = $.extend(true, {}, this.tabs, {label: label, view: view});
            //console.log(this.tabs);
            var html = '<div class="tabContent">\
                            <div class="tabTop"></div>\
                            <div class="tabNav">' + navHtml + '</div>\
                        </div>';
            //console.log(html);
            //view($tabObj.children(".tabContent .tabTop").last(), this);
            //view($html, this);
            $tabObj.jqxTabs('addFirst', label, html);
            //alert($tabObj.find(".tabTop").last().length);
            view($tabObj.find(".tabContent .tabTop").last(), this);
            //button handlers
            var $butNext = $tabObj.find(".tabContent .tabNav .butNext").last();
            var $butPrev = $tabObj.find(".tabContent .tabNav .butPrev").last();
            if (navFunction == "next") {
                $butNext.on("click", function () {
                    var selectedItem = $('#jqxTabs').jqxTabs('selectedItem');
                    $('#jqxTabs').jqxTabs('select', selectedItem + 1);
                });
            } else {
                //print
                $butNext.on("click", function () {
                    jlfwrk_layout.printDialog();
                });
            }
            $butNext.jqxButton();
            $butPrev.on("click", function () {
                var selectedItem = $('#jqxTabs').jqxTabs('selectedItem');
                $('#jqxTabs').jqxTabs('select', selectedItem - 1);
            });
            $butPrev.jqxButton();
            /*
             $tabObj.children("ul").append("<li>" + label + "</li>");
             $tabObj.append(html);
             view($tabObj.children(".tabContent .tabTop").last(), this);
             */
        },
        callbackDialogNewLayout: function (eventData, callbackArg, $dialog) {
            //console.log(eventData);
            var args = {artObj: {artNo: ''}};
            if (eventData == 'yes') {

                var artObj = helpers.formToArrayById($dialog, '.layoutNewFormFieldInput', 'layoutNewForm');
                //console.log(formData);

                artObj['artNo'] = '';
                /*
                 $.each(formData, function (index, value) {
                 //console.log($(this).attr('id') + ' ' + $(this).val());
                 //alert(index);
                 var fieldName = index;
                 if (fieldName.substring(0, 13) == 'layoutNewForm') {
                 //console.log(fieldName.substring(13));
                 args['artObj'][fieldName.substring(13)] = value;
                 }
                 //console.log(fieldName);
                 //args[fieldName] = $(this).val()
                 });
                 */
                args['artObj'] = artObj;
                //console.log(args);
                //load new layout
                jlfwrk_layout.format.formatSet(args);
                //auto select layout tab
                $('#jqxTabs').jqxTabs('select', 1);
            }
        },
        printPreparePDF: function ($dialog) {
            var pObj = $.extend({}, jlfwrk_layout.labelDocument.config.layout);
            //pObj.label = this.label;
            pObj.label = jlfwrk_layout.labelDocument.config.label;
            //console.log(pObj);


            var pData = {
                labelConfig: JSON.stringify(pObj)
            }

            /*
             var pData = {
             labelConfig: pObj
             }
             */

            //console.log(pObj);
            //console.log(pData);
            helpers.debug(pData);
            var jqxhr = $.post("../server/pdf_create2.php", pData, function (rData) {
                //$("#pageDialog .pageDialogWindowContent").html('<h2>Ihre Druckdaten wurden erstellt</h2>Klicken sie auf weiter um die PDF Datei zu öffnen und auszudrucken.<br /><br /><b>Bitte beachten:</b><br />Beim Ausdrucken keine automatische Größenanpassung wählen.');
                //$("#pageDialog .pageDialogWindowNav").append('<input type="button"  value="weiter" onClick="printOpenPDF(\'' + rData + '\'); $(\'#pageDialog\').remove()">');
                //alert(rData);
                //console.log(rData);
                var pluginInfo = jlfwrk_layout.printCheckPDFViewer();
                if ($dialog !== undefined) {
                    var newContent = '<div class="printDialogPrint">' + l.get("printDataCreated") + '<br /><input type="button" value="' + l.get("printDataOpen") + '" onClick="jlfwrk_layout.printDialogPrint(\'' + rData + '\',\'' + pluginInfo.openType + '\');"></div><br /><br />';
                    newContent += '<div class="printDialogInfo">' + l.get("printDataWarning") + '<br /><br />';
                    newContent += pluginInfo.message;
                    newContent += '<br /><br />' + l.get("printDataWarning2");
                    newContent += '</div>';
                    //newContent += '<br /><br /><div class="printDialogSave">Möchten sie Ihr erstelltes Etikett vielleicht später weiterverwenden? Speichern Sie eine Kopie des Etiketts auf Ihrem PC:<br />';
                    //newContent += '<input type="button" value="Layout speichern" onClick="jlfwrk_layout.labelDocument.labelSaveFile();"></div>';

                    $dialog.jqxWindow({content: newContent});
                    $dialog.find("input").jqxButton({width: 150, height: 25});
                }
            })
                    .done(function () {
                        //alert("second success");
                    })
                    .fail(function () {
                        //alert("error");
                        var newContent = '<div class="printDialogPrint">' + l.get("printDataFailed") + '</div>';
                        newContent += '<br /><br /><div class="printDialogSave">' + l.get("printDataFailed2") + '<br />';
                        newContent += '<input type="button" value="' + l.get("printDataFailedSave") + '" onClick="jlfwrk_layout.labelDocument.labelSaveFile();"></div>';
                        $dialog.jqxWindow({content: newContent});
                        $dialog.find("input").jqxButton({width: 150, height: 25});
                        ga('send', 'event', 'Labelmanager', 'Vorschau', 'Fehler bei PDF Erstellung');
                    })
                    .always(function () {
                        //alert("finished");
                    });
        },
        printCheckPDFViewer: function () {
            var info = getAcrobatInfo();
            //console.log(info);
            //console.log(navigator);
            var pluginInfo = Array();
            if (info.acrobat === "installed") {
                //plugin installed
                //alert(info.browser + " " + info.acrobat + " " + info.acrobatVersion);
                if (info.acrobatVersion == "Edge PDF Viewer") {
                    pluginInfo["message"] = l.get("printBrowserEdge");
                    pluginInfo["openType"] = 'download';
                } else if (info.acrobatVersion == "Chrome PDF Viewer") {
                    pluginInfo["message"] = l.get("printBrowserChrome");
                    pluginInfo["openType"] = 'inline';
                } else if (info.acrobatVersion == "WebKit built-in PDF") {
                    //pluginInfo += "WebKit";
                    pluginInfo["message"] = l.get("printBrowserWebkit");
                    pluginInfo["openType"] = 'download';
                } else {
                    //others
                    //pluginInfo += "OK" + info.acrobatVersion;
                    pluginInfo["message"] = l.get("printBrowserAcrobat");
                    pluginInfo["openType"] = 'inline';
                }

            } else {
                //no viewer plugin installed
                pluginInfo["message"] = "";
                pluginInfo["openType"] = 'download';
            }
            //alert(pluginInfo);
            return pluginInfo;
        },
        printOpenPDF: function (pdfFile, action) {
            if (action === undefined) {
                //default:
                action = "inline";
            }
            //window.open('../server/' + pdfFile, "_blank", "toolbar=no,scrollbars=yes,resizable=yes,width=1024,height=768");
            window.open('../server/pdf_download.php?action=' + action + '&file=' + pdfFile, "_blank", "toolbar=no,scrollbars=yes,resizable=yes,width=1024,height=768");
            ga('send', 'event', 'Labelmanager', 'Vorschau', 'PDF geöffnet');
        },
        /*previewReloadLabels: function (startLabel) {
         if (typeof startLabel === 'undefined') {
         startLabel = 0;
         }
         
         var lines = $("#dataList").val().split('\n');
         var curLabel = startLabel;
         jlfwrk_layout.preview._currentStartLabel = startLabel;
         $.each($(".label"), function () {
         
         if (lines.length > curLabel) {
         //only change value if data is available
         $(this).html(encodeEntities(lines[curLabel]));
         } else {
         $(this).html("");
         }
         curLabel++;
         });
         //update page data
         var pageInfo;
         var curPage = Math.floor(startLabel / (hLabels * vLabels)) + 1;
         var numPages = Math.ceil(lines.length / (hLabels * vLabels));
         pageInfo = "Seite " + curPage + " von " + numPages;
         $(".pageInfo").html(pageInfo);
         },*/
        printDialogPrint: function (pdfFile, action) {
            //alert("change dialog");
            var $dialog = helpers.dialogGet();
            if ($dialog !== undefined) {
                var newContent = l.get("printThankyou");
                newContent += '<br /><br /><b>' + l.get("printActionsTitle") + '</b><br />';
                newContent += '<div class="imgButton" id="actionSave"><img style="width: 64px; height: 64px;" src="images/toolbars/save.png" /><br /><div style="margin: 4px;">' + l.get("printActionSave") + '</div></div>';
                newContent += '<div class="imgButton" id="actionNew"><img style="width: 64px; height: 64px;" src="images/icons/new.png" /><br /><div style="margin: 4px;">' + l.get("printActionNew") + '</div></div>';
                newContent += '<div class="imgButton" id="actionExit"><img style="width: 64px; height: 64px;" src="images/icons/exit.png" /><br /><div style="margin: 4px;">' + l.get("printActionExit") + '</div></div>';
                newContent += '<input type="button" id="actionContinue" value="' + l.get("printActionContinue") + '">';
                //<input type="button" value="Layout speichern" onClick="jlfwrk_layout.labelDocument.labelSaveFile();">';
                $dialog.jqxWindow({content: newContent});
                //$dialog.find("input").jqxButton({width: 150, height: 25});
                $dialog.find(".imgButton").jqxButton({width: 145, height: 110});
                $dialog.find("#actionContinue").jqxButton({width: 480, height: 50});
                $("#actionSave").on("click", function () {
                    jlfwrk_layout.labelDocument.labelSaveFile();
                    ga('send', 'event', 'Labelmanager', 'Vorschau', 'Datei gespeichert - Druckdialog');
                });
                $("#actionNew").on("click", function () {
                    document.location.reload();
                    ga('send', 'event', 'Labelmanager', 'Vorschau', 'Neues Layout');
                });
                $("#actionExit").on("click", function () {
                    ga('send', 'event', 'Labelmanager', 'Vorschau', 'Labeldesigner beendet');
                    window.close();
                });
                $("#actionContinue").on("click", function () {
                    ga('send', 'event', 'Labelmanager', 'Vorschau', 'Layout weiter bearbeitet');
                    $dialog.jqxWindow('close');
                });
            }
            this.printOpenPDF(pdfFile, action);
        },
        printDialog: function () {
            var $dlg = helpers.dialogShow(l.get("previewPrint"), l.get("printDataPreparation"), "500px", "300px", "cancel");
            //var dialogHtml = '<div id="pageDialog"><div class="pageDialogFrame"></div><div class="pageDialogWindow"><div class="pageDialogWindowContent"></div><div class="pageDialogWindowNav"></div></div></div>';
            //$("body").append(dialogHtml);
            //$("#pageDialog .pageDialogWindowNav").append('<input type="button"  value="abbrechen" onClick="$(\'#pageDialog\').remove();">');
            //$("#pageDialog .pageDialogWindowContent").append('<h2>Ihre Druckdaten werden vorbereitet</h2>Bitte warten sie einen Moment.<br /><br />Anschließend erhalten Sie eine PDF Datei die Sie ausdrucken können.<br /><br /><b>Bitte beachten:</b><br />Beim Ausdrucken keine automatische Größenanpassung wählen.');
            //printPreparePDF();



            this.printPreparePDF($dlg);
            ga('send', 'event', 'Labelmanager', 'Vorschau', 'Druckdialog');
        },
        init: function () {
            $('body').append('<div id="jqxLoader"></div>');
            $("#jqxLoader").jqxLoader({width: 100, height: 60, imagePosition: 'top'});
            $('#jqxLoader').jqxLoader('open');
            //settings
            var myself = this;
            if (mainSettings.app == undefined) {
                //wait for settings
                helpers.debug("wait for settings");
                //$.getJSON("settings.json", function (data) {
                $.getJSON("../server/loadsettings.php", function (data) {
                    //console.log(data);
                    mainSettings = data
                    myself.settings = data;
                    //console.log("json done");
                    //console.log(myself.settings);
                    myself.init2();
                });
            } else {
                //settings already loaded
                helpers.debug("settings ok");
                myself.settings = mainSettings;
                myself.init2();
            }

        },
        init2: function () {
            //load logos
            var logo1 = jlfwrk_layout.settings.app.logo1;
            if (logo1 == "") {
                logo1 = "images/logo.png";
            }
            var logo2 = jlfwrk_layout.settings.app.logo2;
            if (logo2 == "") {
                logo2 = "images/logo2.png";
            }
            $("#titleBar").append('<img src="' + logo2 + '" /><img src="' + logo1 + '" />');
            //### start: tabs
            //$('#jqxTabs').jqxTabs({min - width: 1200, min - height: 750, width:"100%", height:"100%", position: 'top'});
            $('#jqxTabs').jqxTabs({width: 1200, height: 750, position: 'top'});
            $('#jqxTabs').jqxTabs('removeFirst');
            this.tabAdd("4. " + l.get("step4"), jlfwrk_layout.preview.viewLabelPreview);
            this.tabAdd("3. " + l.get("step3"), jlfwrk_layout.data.viewMain);
            this.tabAdd("2. " + l.get("step2"), jlfwrk_layout.layout.appendTo);
            this.tabAdd("1. " + l.get("step1"), jlfwrk_layout.format.viewMain);
            $('#jqxTabs').on('unselecting', function (event) {
                jlfwrk_layout.eventTabUnselect(event.args.item);
            });
            $('#jqxTabs').on('selecting', function (event) {
                jlfwrk_layout.eventTabSelect(event.args.item);
            });
            //### end: tabs ###

            //context menu
            $("body").append(jlfwrk_layout.layout.element._contextMenuHtml());
            jlfwrk_layout.eventLoadingComplete();
        },
        eventTabUnselect: function (tab) {
            //console.log("unselect: " + tab);
            if (tab == 1) {
                //layout tab
                jlfwrk_layout.layout._eventExit();
            } else if (tab == 2) {
                //data tab
                jlfwrk_layout.data._eventExit();
            }
        },
        eventTabSelect: function (tab) {
            //console.log("data:");
            //console.log(jlfwrk_layout.labelDocument.config.layout.data);

            //console.log("select: " + tab);
            var myself = this;
            if (tab === 3) {
                //preview tab
                jlfwrk_layout.preview._eventEnter();
            } else if (tab === 1) {
                //layout tab
                myself.layout._eventEnter();
            } else if (tab === 2) {
                //data tab
                jlfwrk_layout.data._eventEnter();
            }
        },
        eventLoadingComplete: function () {
            $('#jqxLoader').jqxLoader('close');
        }
    };
    //### Start: LAYOUT ###
    jlfwrk_layout.init();
    //### End: LAYOUT ###


    //load document if passed
    var loadFile = helpers.getUrlVars()["loadFile"];
    if (loadFile != undefined && loadFile !== "") {
        //console.log(loadFile);
        var url = 'https://www.labeldesigner.de/labeldesigner/files/' + loadFile;
        //console.log(url);

        $.get(url, function (data) {
            //alert(data);
            jlfwrk_layout.labelDocument.labelLoadFileProcessContents(data);
        })
                /*.done(function () {
                 alert("second success");
                 })*/
                .fail(function () {
                    alert("Datei konnte nicht geladen werden!");
                })
                /*
                 .always(function () {
                 alert("finished");
                 })*/;
    }
}

//$.jqx.theme = 'light';
function language(selLang)
{
    var __construct = function () {
        helpers.debug("loading language");
        if (typeof selLang === 'undefined')
        {
            selLang = "en";
        }

        helpers.debug("  selected language: " + selLang);
        //load language
        var languageFile = "lang." + selLang + ".js";
        $.getScript(languageFile, function (data, textStatus, jqxhr) {
            //helpers.debug(data); // Data returned
            //helpers.debug(textStatus); // Success
            //helpers.debug(jqxhr.status); // 200
            helpers.debug("  language data loaded");
            setTimeout(startDesigner, 1);
        }).fail(function (jqxhr, settings, exception) {
            helpers.debug("  error loading language file: " + languageFile);
            helpers.debug(exception);
        });
        return;
    }();
    this.get = function (key) {

        if (typeof key !== 'undefined') {
            if (typeof lang[key] !== 'undefined') {
                return lang[key];
            } else {
                return "Key not found: " + key;
            }
        } else {
            return "String not specified";
        }
    }
}
;
var l;
$(document).ready(function () {
//language
//Country Code
    var countryCode = "";
    var domStr = document.domain;
    var domParts = domStr.split(".");
    if (domStr.substr(0, 2) == "fr" || domStr.substr(0, 2) == "nl") {
//Temp Domains
        countryCode = domStr.substr(0, 2);
    } else {
        countryCode = domParts[domParts.length - 1];
    }

	countryCode = 'fr';

//End: Country Code


    l = new language(countryCode);
    //IE Array fix (find function)
    if (!Array.prototype.find) {
        Object.defineProperty(Array.prototype, "find", {
            value: function (predicate) {
                if (this === null) {
                    throw new TypeError('Array.prototype.find called on null or undefined');
                }
                if (typeof predicate !== 'function') {
                    throw new TypeError('predicate must be a function');
                }
                var list = Object(this);
                var length = list.length >>> 0;
                var thisArg = arguments[1];
                var value;
                for (var i = 0; i < length; i++) {
                    value = list[i];
                    if (predicate.call(thisArg, value, i, list)) {
                        return value;
                    }
                }
                return undefined;
            }
        });
    }



});
//
// http://thecodeabode.blogspot.com
// @author: Ben Kitzelman
// @license:  FreeBSD: (http://opensource.org/licenses/BSD-2-Clause) Do whatever you like with it
// @updated: 03-03-2013
//
var getAcrobatInfo = function () {

    var getBrowserName = function () {
        return this.name = this.name || function () {
            var userAgent = navigator ? navigator.userAgent.toLowerCase() : "other";
            if (userAgent.indexOf("chrome") > -1)
                return "chrome";
            else if (userAgent.indexOf("safari") > -1)
                return "safari";
            else if (userAgent.indexOf("edge") > -1)
                return "edge";
            else if (userAgent.indexOf("msie") > -1)
                return "ie";
            else if (userAgent.indexOf("firefox") > -1)
                return "firefox";
            return userAgent;
        }();
    };
    var getActiveXObject = function (name) {
        try {
            return new ActiveXObject(name);
        } catch (e) {
        }
    };
    var getNavigatorPlugin = function (name) {
        for (key in navigator.plugins) {
            var plugin = navigator.plugins[key];
            if (plugin.name == name)
                return plugin;
        }
    };
    var getPDFPlugin = function () {
        return this.plugin = this.plugin || function () {
            if (getBrowserName() == 'ie') {
                //
                // load the activeX control
                // AcroPDF.PDF is used by version 7 and later
                // PDF.PdfCtrl is used by version 6 and earlier
                return getActiveXObject('AcroPDF.PDF') || getActiveXObject('PDF.PdfCtrl');
            } else {
                return getNavigatorPlugin('Adobe Acrobat') || getNavigatorPlugin('Chrome PDF Viewer') || getNavigatorPlugin('WebKit built-in PDF') || getNavigatorPlugin('Edge PDF Viewer');
            }
        }();
    };
    var isAcrobatInstalled = function () {
        return !!getPDFPlugin();
    };
    var getAcrobatVersion = function () {
        try {
            var plugin = getPDFPlugin();
            if (getBrowserName() == 'ie') {
                var versions = plugin.GetVersions().split(',');
                var latest = versions[0].split('=');
                return parseFloat(latest[1]);
            }

            if (plugin.version)
                return parseInt(plugin.version);
            return plugin.name

        } catch (e) {
            return null;
        }
    }

    //
    // The returned object
    // 
    return {
        browser: getBrowserName(),
        acrobat: isAcrobatInstalled() ? 'installed' : false,
        acrobatVersion: getAcrobatVersion()
    };
};

