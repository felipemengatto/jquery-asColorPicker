// preview
export default {
  defaults: {
    template(namespace) {
      return `<ul class="${namespace}-preview"><li class="${namespace}-preview-current"><span /></li></ul>`;
    }
  },

  init: function(api, options) {
    const that = this;
    this.options = $.extend(this.defaults, options);
    this.$preview = $(this.options.template.call(that, api.namespace)).appendTo(api.$dropdown);
    this.$current = this.$preview.find(`.${api.namespace}-preview-current span`);
    this.$previous = this.$preview.find(`.${api.namespace}-preview-previous span`);

    api.$element.on('asColorPicker::firstOpen', () => {
      that.$previous.on('click', function() {
        api.set($(this).data('color'));
        return false;
      });
    });

    api.$element.on('asColorPicker::setup', (e, api, color) => {
      that.updateCurrent(color);
    });
    api.$element.on('asColorPicker::update', (e, api, color) => {
      that.updateCurrent(color);
    });
  },

  updateCurrent: function(color) {
    this.$current.css('backgroundColor', color.toRGBA());
  }
};
