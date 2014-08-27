// hex

(function($) {
    "use strict";

    $.asColorInput.registerComponent('hex', function() {
        return {
            init: function(api) {
                var template = '<input type="text" class="' + api.namespace + '-hex" />';
                this.$hex = $(template).appendTo(api.$dropdown);

                this.$hex.on('change', function() {
                    api.set(this.value);
                });

                var self = this;
                api.$element.on('asColorInput::update asColorInput::setup', function(e, color) {
                    self.update(color);
                });
            },
            update: function(color) {
                this.$hex.val(color.toHEX());
            }
        };
    });
})(jQuery);