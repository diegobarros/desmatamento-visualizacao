// SmartSlider modificado por Bruno Schneider (Jun/2013)
// - Adicionado suporte para minVal > 0
// - Adicionado suporte para rotulos grandes via minVal e maxVal
// - Ao clicar no slider, o meio do gripper fica na posicao

﻿(function($) {
    $.fn.extend({
        strackbar: function(options) {
            var settings = $.extend({
                style: 'style1',
                defaultValue: 0,
                sliderHeight: 4,
                sliderWidth: 200,
                gripperHeight: 20,
                gripperWidth: 19,
                minValue: 0,
                maxValue: 10,
                borderWidth: 1,
                animate: true,
                ticks: true,
                labels: true,
                callback: null
            }, options);
            return this.each(function() {
                var mousecaptured = false;
                var mouseDown = false;
                var previousMousePosition = 0;
                var currentValue = settings.minValue;
                var sliderLeft = 0;
                var sliderRight = 0;
                var minvallabel = $('<div></div>').attr('id', 'min-val')
                                  .css('display','inline').css('float', 'left');
                var maxvallabel = $('<div></div>').attr('id', 'max-val')
                                  .css('display','inline').css('float', 'left');
                var wrapper = $('<div></div>').css('display', 'inline').css('float', 'left');
                // contents = slider + gripper + ticks
                var contents = $('<div></div>').attr('id', 'jscroll').addClass('jscroller');
                var slider = $('<div></div>').attr('id', 'slider').addClass('slider');
                var selection = $('<div></div>').attr('id', 'inner').html('&nbsp').addClass('inner');
                var gripper = $('<div></div>').attr('id', 'lgripper').addClass('lgripper');
                gripper.css('cursor', 'move').css('left', '0');
                gripper.css('height', settings.gripperHeight + 'px').css('width', settings.gripperWidth + 'px');
                contents.append(slider);
                slider.append(selection);
                contents.append(gripper);

                slider.css('border-width', settings.borderWidth + 'px');
                slider.css('width', settings.sliderWidth + 'px');
                slider.css('height', settings.sliderHeight + 'px');
                slider.css('-moz-border-radius', (settings.sliderHeight) + 'px');
                slider.css('-webkit-border-radius', (settings.sliderHeight) + 'px');
                slider.css('border-radius', (settings.sliderHeight) + 'px');
                selection.css('-moz-border-radius', (settings.sliderHeight) + 'px');
                selection.css('-webkit-border-radius', (settings.sliderHeight) + 'px');
                selection.css('border-radius', (settings.sliderHeight) + 'px');
                selection.css('cursor', 'pointer');
                slider.addClass(settings.style);
                selection.addClass(settings.style);
                gripper.addClass(settings.style);
                contents.addClass(settings.style);

                //element.css('padding-top', settings.gripperHeight / 2);
                var wrapperWidth = 2 * settings.borderWidth + settings.sliderWidth;
                wrapper.css('width', wrapperWidth + 'px');
                maxvallabel.html(settings.maxValue).css('padding-left', '7px').css('margin-top', '-2px');
                minvallabel.html(settings.minValue).css('padding-right', '5px').css('margin-top', '-2px');
                wrapper.append(contents);
                var element = $(this);
                if (settings.labels)
                    element.append(minvallabel);
                element.append(wrapper);
                if (settings.labels)
                    element.append(maxvallabel);
                var clear = $('<div></div>');
                clear.css('clear', 'both');
                element.append(clear);
                var elementWidth = settings.sliderWidth + maxvallabel.clientWidth + 100;
                console.log('elementWidth: ' + elementWidth);
                console.log('maxvallabel: ' + maxvallabel.clientWidth);
                //element.css('width', 'auto');
                var sliderBottom = settings.sliderHeight;
                sliderLeft = slider.offset().left;
                sliderRight = sliderLeft + settings.sliderWidth;
                var gTop = (settings.gripperHeight / 2) - settings.sliderHeight / 2;
                previousMousePosition = sliderLeft;

                /*generates tick marks */
                var ticks = $("<ul></ul>");
                ticks.css('position', 'absolute');
                var height = slider.get(0).offsetHeight - 4;
                //var height = settings.sliderHeight;
                var sliderBorder = slider.get(0).offsetHeight - settings.sliderHeight;
                gTop -= sliderBorder / 2;
                ticks.css('top', height + 'px')
                ticks.attr('id', 'ticks');
                ticks.addClass('ticks');
                var range = settings.maxValue - settings.minValue;
                var gripperOffset = settings.gripperWidth / 2;
                var stepValue = (settings.sliderWidth - settings.gripperWidth) / range;
                ticks.css('width', settings.sliderWidth + stepValue + 'px');
                ticks.css('margin-left', gripperOffset - 3 + 'px');
                //ticks.css('margin-left', '0px');
                ticks.css('margin-top', '0px');
                //ticks.css('border', 'thin solid red');

                for (var count = 0; count <= range; count++) {
                    var tick = $('<li><span>|</span></li>');
                    tick.css('width', stepValue + 'px');
                    ticks.append(tick);
                }
                if (settings.ticks)
                    slider.after(ticks);
                gripper.css('top', -gTop + 'px');
                //set the default position
                if (settings.defaultValue != 0) {
                    var value = settings.defaultValue - settings.minValue;
                    setPosition(value * stepValue);
                    previousMousePosition = sliderLeft + value * stepValue;
                    if (settings.callback != null)
                        settings.callback(settings.defaultValue);
                }
                gripper.mousedown(function(e) {
                    mousecaptured = true;
                    previousMousePosition = e.pageX;
                    $(this).css('cursor', 'ew-resize');
                });

                gripper.mouseup(function(e) {
                    mousecaptured = false;
                    $(this).css('cursor', 'move');
                });

                $(document).mouseup(function() {
                    mousecaptured = false;
                    $(this).css('cursor', 'default');
                });
                $(document).mousemove(function(e) {
                    if (mousecaptured) {
                        setGripperPosition(e.pageX);
                        e.stopPropagation();
                        e.preventDefault(); 
                        e.stopImmediatePropagation();
                    }
                });
                slider.mouseenter(function(e) { $(this).css('cursor', 'pointer'); });
                slider.mouseout(function(e) { $(this).css('cursor', 'default'); });
                slider.mousedown(function(e) {
                    if (!mouseDown) {
                        mouseDown = true;
                        $(this).css('cursor', 'pointer');
                        mousecaptured = false;
                        setGripperPosition(e.pageX);
                    }
                });

                function getPositionValue(pos) {
                    var val = parseInt(pos.replace('px', ''));
                    return val;
                }
                function getDragAmount(cursorCurrentPosition, cursorPreviousPosition) {
                    var dragAmount = cursorCurrentPosition - cursorPreviousPosition;
                    if (cursorPreviousPosition <= 0) {
                        dragAmount = cursorCurrentPosition - sliderLeft;
                        previousMousePosition = sliderLeft + dragAmount;
                    }
                    if (cursorPreviousPosition > cursorCurrentPosition)
                        dragAmount = cursorPreviousPosition - cursorCurrentPosition;

                    return dragAmount;
                }
                function isForwardDirection(cursorCurrentPosition, cursorPreviousPosition) {
                    if (cursorCurrentPosition > cursorPreviousPosition)
                        return true;
                    else
                        return false;
                }
                function validatePosition(position) {
                    if (position >= 0 && position <= settings.sliderWidth)
                        return true;
                    else
                        return false;
                }
                function setPosition(position) {
                    if (validatePosition(position)) {
                        var selectionWidth = getPositionValue(gripper.css('left'));
                        if (settings.animate && !mousecaptured) {
                            gripper.animate({ 'left': position + 'px' }, 500, function() {
                                selectionWidth = getPositionValue(gripper.css('left'));
                                selection.css('width', selectionWidth + 'px');
                                mouseDown = false;
                            });
                            /*settings.animate = false;*/
                        }
                        else {
                            gripper.css('left', position + 'px');
                            selectionWidth = getPositionValue(gripper.css('left')) + gripperOffset;
                            selection.css('width', selectionWidth + 'px');
                            mouseDown = false;
                        }
                    }
                }
                function setGripperPosition(cursorPosition) {
                    cursorPosition -= settings.gripperWidth / 2;
                    var dragAmount = getDragAmount(cursorPosition, previousMousePosition);
                    var isForward = isForwardDirection(cursorPosition, previousMousePosition);

                    var gripperPosition = getPositionValue(gripper.css('left'));
                    if (cursorPosition >= sliderLeft && cursorPosition <= (sliderRight - stepValue / 10)) {
                        if (gripperPosition >= 0 && gripperPosition <= settings.sliderWidth - stepValue / 10) {
                            if (isForward)
                                gripperPosition += dragAmount;
                            else
                                gripperPosition -= dragAmount;
                            setPosition(gripperPosition);

                            var newPosition = cursorPosition - sliderLeft;
                            var cVal = (newPosition / stepValue) + settings.minValue;
                            currentValue = parseInt(cVal);
                            if (gripperPosition > (settings.sliderWidth - stepValue) + stepValue / 10) {
                                currentValue = settings.maxValue;
                            }
                            if (settings.callback != null)
                                settings.callback(currentValue);
                        }
                        previousMousePosition = cursorPosition;
                    }
                }
            });
        }
    });
})(jQuery);
