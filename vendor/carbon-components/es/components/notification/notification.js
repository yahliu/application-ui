function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

import mixin from '../../globals/js/misc/mixin';
import createComponent from '../../globals/js/mixins/create-component';
import initComponentBySearch from '../../globals/js/mixins/init-component-by-search';
import eventedState from '../../globals/js/mixins/evented-state';
import handles from '../../globals/js/mixins/handles';
import on from '../../globals/js/misc/on';

var Notification =
/*#__PURE__*/
function (_mixin) {
  _inherits(Notification, _mixin);
  /**
   * InlineNotification.
   * @extends CreateComponent
   * @extends InitComponentBySearch
   * @extends Handles
   * @param {HTMLElement} element The element working as a InlineNotification.
   */


  function Notification(element, options) {
    var _this;

    _classCallCheck(this, Notification);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Notification).call(this, element, options));

    _this._changeState = function (state, callback) {
      if (state === 'delete-notification') {
        _this.element.parentNode.removeChild(_this.element);

        _this.release();
      }

      callback();
    };

    _this.button = element.querySelector(_this.options.selectorButton);

    if (_this.button) {
      _this.manage(on(_this.button, 'click', function (evt) {
        if (evt.currentTarget === _this.button) {
          _this.remove();
        }
      }));
    }

    return _this;
  }

  _createClass(Notification, [{
    key: "remove",
    value: function remove() {
      this.changeState('delete-notification');
    }
    /**
     * The map associating DOM element and accordion UI instance.
     * @type {WeakMap}
     */

  }]);

  Notification.components = new WeakMap();
  Notification.options = {
    selectorInit: '[data-notification]',
    selectorButton: '[data-notification-btn]',
    eventBeforeDeleteNotification: 'notification-before-delete',
    eventAfterDeleteNotification: 'notification-after-delete'
  };
  return Notification;
}(mixin(createComponent, initComponentBySearch, eventedState, handles));

export default Notification;