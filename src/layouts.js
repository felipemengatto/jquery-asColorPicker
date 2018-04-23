import $ from 'jquery';

class Layouts {

  constructor() {
  }

  static createByModesName(mode, nameItem, newDropdown, currentDropdown) {

    if (mode === 'flat-design') {

      if (nameItem === 'preview' || nameItem === 'hex') {

        var existDiv = currentDropdown.find(`.flat-design-preview`);

        if (existDiv.length > 0) {
          newDropdown = existDiv;
        } else {
          newDropdown = $('<div/>');
          newDropdown.addClass(`flat-design-preview`);
        }

        currentDropdown.append(newDropdown);
      }

      if (nameItem === 'palettes') {
        newDropdown = $('<div/>');
        newDropdown.addClass(`flat-design-${nameItem}`);
        currentDropdown.append('<h5 class="asColorPicker-dropdown-title"> Cores Recentes: </h5>');
        currentDropdown.append(newDropdown);
      }

      if (nameItem === 'saturation' || nameItem === 'hue' || nameItem === 'alpha') {

        var existDiv = currentDropdown.find(`.flat-design-options`);

        if (existDiv.length > 0) {
          newDropdown = existDiv;
        } else {
          newDropdown = $('<div/>');
          currentDropdown.append('<h5 class="asColorPicker-dropdown-title"> Selecione uma nova cor: </h5>');
          newDropdown.addClass(`flat-design-options`);
        }

        currentDropdown.append(newDropdown);
      }

    }

    return newDropdown;
  }
}

export default Layouts;
