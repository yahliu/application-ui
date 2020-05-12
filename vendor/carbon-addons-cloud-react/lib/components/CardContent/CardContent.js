'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _carbonComponentsReact = require('carbon-components-react');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var CardContent = function CardContent(_ref) {
  var className = _ref.className,
      children = _ref.children,
      cardIcon = _ref.cardIcon,
      cardTitle = _ref.cardTitle,
      cardLink = _ref.cardLink,
      cardInfo = _ref.cardInfo,
      iconDescription = _ref.iconDescription,
      other = _objectWithoutProperties(_ref, ['className', 'children', 'cardIcon', 'cardTitle', 'cardLink', 'cardInfo', 'iconDescription']);

  var cardContentClasses = (0, _classnames2.default)(_defineProperty({
    'bx--card__card-overview': true
  }, className, className));

  var cardLinkContent = cardLink ? cardLink.map(function (link, key) {
    return _react2.default.createElement(
      'a',
      { key: key, href: link, className: 'bx--about__title--link' },
      link
    );
  }) : '';

  var cardInfoContent = cardInfo ? cardInfo.map(function (info, key) {
    return _react2.default.createElement(
      'h4',
      { key: key, className: 'bx--about__title--additional-info' },
      info
    );
  }) : '';

  var cardLinkContentArray = Object.keys(cardLinkContent);
  var cardInfoContentArray = Object.keys(cardInfoContent);

  return _react2.default.createElement(
    'div',
    _extends({}, other, { className: cardContentClasses }),
    children,
    _react2.default.createElement(
      'div',
      { className: 'bx--card-overview__about' },
      _react2.default.createElement(
        'div',
        { className: 'bx--about__icon' },
        _react2.default.createElement(_carbonComponentsReact.Icon, {
          className: 'bx--about__icon--img',
          name: cardIcon,
          description: iconDescription
        })
      ),
      _react2.default.createElement(
        'div',
        { className: 'bx--about__title' },
        _react2.default.createElement(
          'p',
          { id: 'card-app-title', className: 'bx--about__title--name' },
          cardTitle
        ),
        cardLinkContentArray.map(function (info, key) {
          return cardLinkContent[key];
        }),
        cardInfoContentArray.map(function (info, key) {
          return cardInfoContent[key];
        })
      )
    )
  );
};

CardContent.propTypes = {
  children: _propTypes2.default.node,
  cardIcon: _propTypes2.default.string,
  cardTitle: _propTypes2.default.string,
  cardLink: _propTypes2.default.node,
  cardInfo: _propTypes2.default.array,
  className: _propTypes2.default.string,
  iconDescription: _propTypes2.default.string
};

CardContent.defaultProps = {
  iconDescription: 'card icon',
  cardIcon: 'app-services',
  cardTitle: 'card title'
};

exports.default = CardContent;