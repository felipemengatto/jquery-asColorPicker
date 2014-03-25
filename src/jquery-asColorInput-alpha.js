// alpha

(function($) {
    $.asColorInput.registerComponent('alpha', {
        height: 150,
        data: {},
        init: function(api) {
            var self = this;

            this.$alpha = $('<div class="' + api.namespace + '-alpha drag-disable"><i class="drag-disable"></i></div>').appendTo(api.$picker);
            this.$handle = this.$alpha.children('i');

            this.height = this.$alpha.height();

            //bind action
            this.$alpha.on('mousedown.asColorInput', function(e) {
                var rightclick = (e.which) ? (e.which === 3) : (e.button === 2);
                if (rightclick) {
                    return false;
                }
                $.proxy(self.mousedown, self)(api, e);
            });

            api.$element.on('asColorInput::ready', function() {
                self.height = self.$alpha.height();
                self.step = self.height / 100;
                self.update(api);
                self.keyboard(api);
            });
        },
        mousedown: function(api, e) {
            var offset = this.$alpha.offset();

            this.data.startY = e.pageY;
            this.data.top = e.pageY - offset.top;
            this.move(api, this.data.top);

            api.makeUnselectable();

            this.mousemove = function(e) {
                var position = this.data.top + (e.pageY || this.data.startY) - this.data.startY;
                this.move(api, position);
                return false;
            };

            this.mouseup = function() {
                $(document).off({
                    mousemove: this.mousemove,
                    mouseup: this.mouseup
                });
                this.data.top = this.data.cach;
                api.cancelUnselectable();
                return false;
            };

            $(document).on({
                mousemove: $.proxy(this.mousemove, this),
                mouseup: $.proxy(this.mouseup, this)
            });
            return false;
        },
        move: function(api, position, alpha, update) {
            position = Math.max(0, Math.min(this.height, position));
            this.data.cach = position;
            if (typeof alpha === 'undefined') {
                alpha = 1 - (position / this.height);
            }
            alpha = Math.max(0, Math.min(1, alpha));
            this.$handle.css({
                top: position
            });
            if (update !== false) {
                api.update({
                    a: Math.round(alpha * 100) / 100
                }, 'alpha');
            }
        },
        moveUp: function(api) {
            var step = this.step,
                data = this.data;
            data.top = data.top - step;
            // see https://github.com/amazingSurge/jquery-asColorInput/issues/8
            data.top = Math.max(0, Math.min(this.width, data.top));
            this.move(api, data.top);
        },
        moveDown: function(api) {
            var step = this.step,
                data = this.data;
            data.top = data.top + step;
            // see https://github.com/amazingSurge/jquery-asColorInput/issues/8
            data.top = Math.max(0, Math.min(this.width, data.top));
            this.move(api, data.top);
        },
        keyboard: function(api) {
            var keyboard, self = this;
            if (api._keyboard) {
                keyboard = $.extend(true, {}, api._keyboard);
            } else {
                return false;
            }

            this.$alpha.attr('tabindex', '0').on('focus', function() {
                keyboard.attach({
                    up: function() {
                        self.moveUp.call(self, api);
                    },
                    down: function() {
                        self.moveDown.call(self, api);
                    }
                });
                return false;
            }).on('blur', function() {
                keyboard.detach();
            });
        },
        update: function(api) {
            var position = this.height * (1 - api.color.value.a);
            this.$alpha.css('backgroundColor', api.color.toHEX());

            this.move(api, position, api.color.value.a, false);
        },
        destroy: function() {
            $(document).off({
                mousemove: this.mousemove,
                mouseup: this.mouseup
            });
        }
    });
})(jQuery);