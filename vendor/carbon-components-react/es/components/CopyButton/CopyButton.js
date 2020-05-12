function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import { settings } from 'carbon-components';
import { iconCopy } from 'carbon-icons';
import Icon from '../Icon';
var prefix = settings.prefix;

var CopyButton =
/*#__PURE__*/
function (_Component) {
  _inherits(CopyButton, _Component);

  function CopyButton() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, CopyButton);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(CopyButton)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "state", {
      showFeedback: false
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "handleClick", function (evt) {
      _this.setState({
        showFeedback: true
      });

      _this.timeoutId = setTimeout(function () {
        _this.setState({
          showFeedback: false
        });
      }, _this.props.feedbackTimeout);

      _this.props.onClick(evt);
    });

    return _this;
  }

  _createClass(CopyButton, [{
    key: "componentWillUnmount",

    /* istanbul ignore next */
    value: function componentWillUnmount() {
      if (typeof this.timeoutId !== 'undefined') {
        clearTimeout(this.timeoutId);
        delete this.timeoutId;
      }
    }
  }, {
    key: "render",
    // eslint-disable-line no-unused-vars
    value: function render() {
      var _this$props = this.props,
          iconDescription = _this$props.iconDescription,
          className = _this$props.className,
          feedback = _this$props.feedback,
          feedbackTimeout = _this$props.feedbackTimeout,
          onClick = _this$props.onClick,
          other = _objectWithoutProperties(_this$props, ["iconDescription", "className", "feedback", "feedbackTimeout", "onClick"]);

      var classNames = classnames("".concat(prefix, "--snippet-button"), className);
      var feedbackClassNames = classnames("".concat(prefix, "--btn--copy__feedback"), _defineProperty({}, "".concat(prefix, "--btn--copy__feedback--displayed"), this.state.showFeedback));
      return React.createElement("button", _extends({
        type: "button",
        className: classNames,
        onClick: this.handleClick
      }, other), React.createElement(Icon, {
        className: "".concat(prefix, "--snippet__icon"),
        icon: iconCopy,
        description: iconDescription
      }), React.createElement("div", {
        className: feedbackClassNames,
        "data-feedback": feedback
      }));
    }
  }]);

  return CopyButton;
}(Component);

_defineProperty(CopyButton, "propTypes", {
  /**
   * Specify an optional className to be applied to the underlying <button>
   */
  className: PropTypes.string,

  /**
   * Provide a description for the icon representing the copy action that can
   * be read by screen readers
   */
  iconDescription: PropTypes.string,

  /**
   * Specify the string that is displayed when the button is clicked and the
   * content is copied
   */
  feedback: PropTypes.string,

  /**
   * Specify the time it takes for the feedback message to timeout
   */
  feedbackTimeout: PropTypes.number,

  /**
   * Specify an optional `onClick` handler that is called when the underlying
   * <button> is clicked
   */
  onClick: PropTypes.func
});

_defineProperty(CopyButton, "defaultProps", {
  iconDescription: 'Copy to clipboard',
  feedback: 'Copied!',
  feedbackTimeout: 2000,
  onClick: function onClick() {}
});

export { CopyButton as default };