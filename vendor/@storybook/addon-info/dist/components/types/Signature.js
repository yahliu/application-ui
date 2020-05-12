'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _proptypes = require('./proptypes');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Signature = function Signature(_ref) {
  var propType = _ref.propType;
  return _react2.default.createElement(
    'span',
    null,
    propType.raw
  );
};

Signature.propTypes = {
  propType: _proptypes.TypeInfo.isRequired
};

exports.default = Signature;