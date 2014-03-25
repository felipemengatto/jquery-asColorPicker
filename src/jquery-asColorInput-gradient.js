// gradient

(function($) {
    $.asColorInput.registerComponent('gradient', {
        degree: 1,
        count: 0,
        markers: [],
        current: null,
        init: function(api) {
            var self = this;
            var template = '<div class="' + api.namespace + '-gradient-controll">' +
                '<a href="#" class="' + api.namespace + '-gradient-trigger">Gradient</a>' +
                '<a href="#" class="' + api.namespace + '-gradient-cancel">Cancel</a>' +
                '</div>' +
                '<div class="' + api.namespace + '-gradient">' +
                '<div class="' + api.namespace + '-gradient-panel">' +
                '<div class="' + api.namespace + '-gradient-markers"></div>' +
                '</div>' +
                '<div class="' + api.namespace + '-gradient-wheel">' +
                '<i></i>' +
                '</div>' +
                '<input class="' + api.namespace + '-gradient-degree" type="text" value="360" size="3" />' +
                '</div>';
            this.api = api;
            this.classes = {
                show: api.namespace + '-gradient' + '_show',
                marker: api.namespace + '-gradient-marker',
                active: api.namespace + '-gradient-marker_active'
            };
            this.isOpened = false;
            this.initialized = false;
            this.$doc = $(document);

            this.$template = $(template).appendTo(api.$picker);
            this.$controll = this.$template.eq(0);
            this.$trigger = this.$controll.find('.' + api.namespace + '-gradient-trigger');
            this.$cancel = this.$controll.find('.' + api.namespace + '-gradient-cancel');
            this.$gradient = this.$template.eq(1);
            this.$panel = this.$gradient.find('.' + api.namespace + '-gradient-panel');
            this.$markers = this.$gradient.find('.' + api.namespace + '-gradient-markers');
            this.$wheel = this.$gradient.find('.' + api.namespace + '-gradient-wheel');
            this.$pointer = this.$wheel.find('i');
            this.$degree = this.$gradient.find('.' + api.namespace + '-gradient-degree');

            this.$trigger.on('click', function() {
                if (self.isOpened) {
                    self.$gradient.removeClass(self.classes.show);
                    self.setGradient();
                    api.isGradient = false;
                    api.set(api.originalColor);
                } else {
                    self.$gradient.addClass(self.classes.show);
                    api.isGradient = true;
                    self.makeGradient();
                }
                self.isOpened = !self.isOpened;
                return false;
            });
            this.$cancel.on('click', function() {
                api.color.from(api.originalColor);
                api.update({});
                self.retrieve();
                return false;
            });

            // create new marker
            this.$markers.on('mousedown.asColorInput', function(e) {
                var rightclick = (e.which) ? (e.which === 3) : (e.button === 2);
                if (rightclick) {
                    return false;
                }
                var position = e.pageX - self.$markers.offset().left;
                var percent = Math.round((position / self.width) * 100);
                self.makeMarker('#fff', percent);
                self.makeGradient();
                return false;
            });
            this.$wheel.on('mousedown.asColorInput', function(e) {
                var rightclick = (e.which) ? (e.which === 3) : (e.button === 2);
                if (rightclick) {
                    return false;
                }
                self.wheelMousedown(e);
                return false;
            });

            api.$element.on('asColorInput::ready', function() {
                self.width = self.$markers.width();
            });
            api.$element.on('asColorInput::change', function(event, instance) {
                if (self.current && api.isGradient) {
                    self.current.setColor(instance.color.toRGBA());
                    self.makeGradient();
                }
            });
            api.$element.on('asColorInput::close', function() {
                if (api.isGradient) {
                    self.setGradient();
                }
                return false;
            });
            this.$degree.on('blur.asColorInput', function() {
                var deg = parseInt(this.value, 10);
                self.setDegree(deg);
                return false;
            }).on('keydown.asColorInput', function(e) {
                var key = e.keyCode || e.which;
                if (key === 13) {
                    $(this).blur();
                    return false;
                }
            });

            this.makeMarker('#fff', 0);
            this.makeMarker('#000', 100);
            setTimeout(function() {
                self.setDegree(0);
                self.initialized = true;
            }, 0);
        },
        mousedown: function(e, dom) {
            // get current marker
            var id = $(dom).data('id');
            var instance;
            $.each(this.markers, function(key, marker) {
                if (marker._id === id) {
                    instance = marker;
                }
            });
            this.current = instance;

            // get marker current position
            var begining = $(dom).position().left,
                start = e.pageX,
                api = this.api,
                end;

            api.makeUnselectable();
            api.set(instance.color);

            this.mousemove = function(e) {
                end = e.pageX || start;
                var position = begining + end - start;
                this.move(instance, position);
                return false;
            };

            this.mouseup = function() {
                $(document).off({
                    mousemove: this.mousemove,
                    mouseup: this.mouseup
                });
                api.cancelUnselectable();
                return false;
            };

            $(document).on({
                mousemove: $.proxy(this.mousemove, this),
                mouseup: $.proxy(this.mouseup, this)
            });
            $(dom).focus();
            return false;
        },
        move: function(marker, position) {
            position = Math.max(0, Math.min(this.width, position));
            var percent = Math.round((position / this.width) * 100);

            marker.setPercent(percent);
            this.makeGradient();
        },
        makeMarker: function(color, percent) {
            var self = this;
            var $doc = this.$doc;
            var Marker = function() {
                this.color = color;
                this.percent = percent;
                this._id = ++self.count;
                this.$element = $('<span class="' + self.classes.marker + '"><i></i></span>').attr('tabindex', 0).data('id', this._id);
                this.$element.appendTo(self.$markers);
                this.$element.on('mousedown.asColorInput', function(e) {
                    var rightclick = (e.which) ? (e.which === 3) : (e.button === 2);
                    if (rightclick) {
                        return false;
                    }
                    self.mousedown.call(self, e, this);
                    return false;
                });
            };
            Marker.prototype.setColor = function(color) {
                this.color = color;
                this.$element.find('i').css({
                    background: color
                });
            };
            Marker.prototype.setPercent = function(percent) {
                this.percent = percent;
                this.$element.css({
                    left: percent + '%'
                });
            };

            var marker = new Marker();
            marker.setPercent(percent);
            marker.setColor(color);
            this.markers.push(marker);
            this.current = marker;
            marker.hasBinded = false;
            marker.$element.on('focus', function() {
                if (!marker.hasBinded) {
                    $doc.on('keydown.' + marker._id, function(e) {
                        var key = e.keyCode || e.which;
                        if (key === 46) {
                            self.del(marker);
                            self.makeGradient();
                        }
                    });
                    marker.$element.addClass(self.classes.active);
                    marker.hasBinded = true;
                }
            }).on('blur', function() {
                $doc.off('keydown.' + marker._id);
                marker.$element.removeClass(self.classes.active);
                marker.hasBinded = false;
            });

            return marker;
        },
        makeGradient: function() {
            var markers = this.markers,
                api = this.api,
                self = this,
                gradient = 'gradient(' + this.degree + 'deg,',
                f1 = '',
                f2 = '';
            // sort array by percent 
            markers.sort(function(a, b) {
                return a.percent > b.percent;
            });
            markers.map(function(marker, key, markers) {
                gradient += marker.color + ' ' + marker.percent + '%,';
                if (key === (markers.length - 1)) {
                    f1 += 'color-stop(' + marker.percent / 100 + ',' + marker.color + ')';
                    f2 += marker.color + ' ' + marker.percent + '%';
                } else {
                    f1 += 'color-stop(' + marker.percent / 100 + ',' + marker.color + '),';
                    f2 += marker.color + ' ' + marker.percent + '%,';
                }
            });
            gradient = gradient.substring(0, gradient.length - 1);
            gradient += ')';
            api.gradient = gradient;
            api._trigger('gradientChange', gradient);

            // show value on input element
            api.$element.val(gradient);

            var gradientArray = ['-moz-linear-gradient(left, ' + f2 + ')', '-webkit-gradient(linear, left top, right top, ' + f1 + ')', '-webkit-linear-gradient(left, ' + f2 + ')', '-o-linear-gradient(left, ' + f2 + ')'];
            $.each(gradientArray, function(key, value) {
                self.$panel[0].style.backgroundImage = value;
            });
            return gradient;
        },
        setGradient: function() {
            var self = this;
            // copy array with object element
            this.origin = {};
            this.origin.markers = [];
            this.markers.map(function(marker) {
                var copy = {
                    color: marker.color,
                    percent: marker.percent
                };
                self.origin.markers.push(copy);
            });
            this.origin.degree = this.degree;
        },
        retrieve: function() {
            var self = this;
            self.markers.map(function(marker) {
                marker.$element.blur();
                marker.$element.remove();
            });
            self.markers = [];
            if (!self.origin) {
                self.makeMarker('#fff', 0);
                self.makeMarker('#000', 100);
                self.setDegree(0);
            } else {
                self.origin.markers.map(function(marker) {
                    self.makeMarker(marker.color, marker.percent);
                });
                self.setDegree(self.origin.degree);
            }
        },
        // wheel method
        getPosition: function(a, b) {
            var r = this.r;
            var x = a / Math.sqrt(a * a + b * b) * r;
            var y = b / Math.sqrt(a * a + b * b) * r;
            return {
                x: x,
                y: y
            };
        },
        calDegree: function(x, y) {
            var deg = Math.round(Math.atan(Math.abs(y / x)) * (180 / Math.PI));
            if (x <= 0 && y > 0) {
                return 180 - deg;
            }
            if (x <= 0 && y <= 0) {
                return deg + 180;
            }
            if (x > 0 && y <= 0) {
                return 360 - deg;
            }
            if (x > 0 && y > 0) {
                return deg;
            }
        },
        _setDegree: function(deg) {
            this.degree = deg;
            this.$degree.val(deg);
            if (this.initialized) {
                // avoid setting value on input element when init
                this.makeGradient();
            }
        },
        setDegree: function(deg) {
            if (this.degree === deg) {
                return false;
            }
            var r = this.r || this.$wheel.width() / 2;
            var pos = this.calPointer(deg, r);
            this.$pointer.css({
                left: pos.x,
                top: pos.y
            });
            this._setDegree(deg);
        },
        calPointer: function(deg, r) {
            var x = Math.cos(deg * Math.PI / 180) * r;
            var y = Math.sin(deg * Math.PI / 180) * r;
            return {
                x: r + x,
                y: r - y
            };
        },
        wheelMousedown: function(e) {
            var offset = this.$wheel.offset();
            var r = this.$wheel.width() / 2;
            var startX = offset.left + r;
            var startY = offset.top + r;
            var $doc = this.$doc;

            this.r = r;

            this.wheelMove = function(e) {
                var x = e.pageX - startX;
                var y = startY - e.pageY;
                var position = this.getPosition(x, y);
                var deg = this.calDegree(position.x, position.y);
                this._setDegree(deg);
                var pos = this.calPointer(deg, r);
                this.$pointer.css({
                    left: pos.x,
                    top: pos.y
                });
            };
            this.wheelMouseup = function() {
                $doc.off({
                    mousemove: this.wheelMove,
                    mouseup: this.wheelMouseup
                });
                return false;
            };
            $doc.on({
                mousemove: $.proxy(this.wheelMove, this),
                mouseup: $.proxy(this.wheelMouseup, this)
            });

            // set value first
            this.wheelMove(e);
        },
        del: function(marker) {
            marker.$element.blur();
            marker.$element.remove();
            this.markers.splice(this.markers.indexOf(marker), 1);
        },
        destory: function() {
            this.$element.off('click');
            this.$element.remove();
        }
    });
})(jQuery);