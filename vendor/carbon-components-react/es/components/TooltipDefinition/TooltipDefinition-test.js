function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React from 'react';
import { mount } from 'enzyme';
import TooltipDefinition from '../TooltipDefinition';
describe('TooltipDefinition', function () {
  var mockProps;
  beforeEach(function () {
    mockProps = {
      direction: 'bottom',
      children: 'tooltip trigger',
      className: 'custom-class',
      tooltipText: 'tooltip text'
    };
  });
  it('should render', function () {
    var wrapper = mount(React.createElement(TooltipDefinition, mockProps));
    expect(wrapper).toMatchSnapshot();
  });
  it('should allow the user to specify the direction', function () {
    var wrapper = mount(React.createElement(TooltipDefinition, _extends({}, mockProps, {
      direction: "top"
    })));
    expect(wrapper).toMatchSnapshot();
  });
});