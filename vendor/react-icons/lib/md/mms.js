'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactIconBase = require('react-icon-base');

var _reactIconBase2 = _interopRequireDefault(_reactIconBase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MdMms = function MdMms(props) {
    return _react2.default.createElement(
        _reactIconBase2.default,
        _extends({ viewBox: '0 0 40 40' }, props),
        _react2.default.createElement(
            'g',
            null,
            _react2.default.createElement('path', { d: 'm8.4 23.4h23.2l-7.5-10-5.7 7.5-4.3-5z m25-20c1.8 0 3.2 1.4 3.2 3.2v20c0 1.8-1.4 3.4-3.2 3.4h-23.4l-6.6 6.6v-30c0-1.8 1.4-3.2 3.2-3.2h26.8z' })
        )
    );
};

exports.default = MdMms;
module.exports = exports['default'];