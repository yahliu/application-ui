"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty = require("babel-runtime/core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

exports.default = muteProperty;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function muteProperty(key, value) {
  return (0, _defineProperty2.default)(value, key, { enumerable: false });
}