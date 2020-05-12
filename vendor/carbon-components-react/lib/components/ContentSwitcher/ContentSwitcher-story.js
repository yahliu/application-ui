"use strict";

var _react = _interopRequireDefault(require("react"));

var _react2 = require("@storybook/react");

var _addonActions = require("@storybook/addon-actions");

var _addonKnobs = require("@storybook/addon-knobs");

var _carbonIcons = require("carbon-icons");

var _Icon = _interopRequireDefault(require("../Icon"));

var _ContentSwitcher = _interopRequireDefault(require("../ContentSwitcher"));

var _Switch = _interopRequireDefault(require("../Switch"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var icons = {
  None: 'None',
  'Add with filled circle (iconAddSolid from `carbon-icons`)': 'iconAddSolid',
  'Search (iconSearch from `carbon-icons`)': 'iconSearch'
};
var iconMap = {
  iconAddSolid: _react.default.createElement(_Icon.default, {
    icon: _carbonIcons.iconAddSolid
  }),
  iconSearch: _react.default.createElement(_Icon.default, {
    icon: _carbonIcons.iconSearch
  })
};
var kinds = {
  'Anchor (anchor)': 'anchor',
  'Button (button)': 'button'
};
var props = {
  contentSwitcher: function contentSwitcher() {
    return {
      onChange: (0, _addonActions.action)('onChange')
    };
  },
  switch: function _switch() {
    return {
      onClick: (0, _addonActions.action)('onClick - Switch'),
      kind: (0, _addonKnobs.select)('Button kind (kind in <Switch>)', kinds, 'anchor'),
      href: (0, _addonKnobs.text)('The link href (href in <Switch>)', ''),
      icon: iconMap[(0, _addonKnobs.select)('Icon (icon in <Switch>)', icons, 'none')]
    };
  }
};
(0, _react2.storiesOf)('ContentSwitcher', module).addDecorator(_addonKnobs.withKnobs).add('Default', function () {
  var switchProps = props.switch();
  return _react.default.createElement(_ContentSwitcher.default, props.contentSwitcher(), _react.default.createElement(_Switch.default, _extends({
    name: "one",
    text: "First section"
  }, switchProps)), _react.default.createElement(_Switch.default, _extends({
    name: "two",
    text: "Second section"
  }, switchProps)), _react.default.createElement(_Switch.default, _extends({
    name: "three",
    text: "Third section"
  }, switchProps)));
}, {
  info: {
    text: "\n            The Content Switcher component manipulates the content shown following an exclusive or \u201Ceither/or\u201D pattern.\n            Create Switch components for each section in the content switcher.\n          "
  }
}).add('Selected', function () {
  var switchProps = props.switch();
  return _react.default.createElement(_ContentSwitcher.default, _extends({}, props.contentSwitcher(), {
    selectedIndex: 1
  }), _react.default.createElement(_Switch.default, _extends({
    name: "one",
    text: "First section"
  }, switchProps)), _react.default.createElement(_Switch.default, _extends({
    name: "two",
    text: "Second section"
  }, switchProps)), _react.default.createElement(_Switch.default, _extends({
    name: "three",
    text: "Third section"
  }, switchProps)));
}, {
  info: {
    text: "\n             Render the Content Switcher with a different section automatically selected\n           "
  }
});