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

import settings from '../../globals/js/settings';
import mixin from '../../globals/js/misc/mixin';
import createComponent from '../../globals/js/mixins/create-component';
import initComponentBySearch from '../../globals/js/mixins/init-component-by-search';
import handles from '../../globals/js/mixins/handles';
import eventMatches from '../../globals/js/misc/event-matches';
import on from '../../globals/js/misc/on';

var TextInput =
/*#__PURE__*/
function (_mixin) {
  _inherits(TextInput, _mixin);
  /**
   * Text Input.
   * @extends CreateComponent
   * @extends InitComponentBySearch
   * @extends Handles
   * @param {HTMLElement} element - The element functioning as a text field.
   */


  function TextInput(_element, options) {
    var _this;

    _classCallCheck(this, TextInput);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(TextInput).call(this, _element, options));

    _this._setIconVisibility = function (_ref) {
      var iconVisibilityOn = _ref.iconVisibilityOn,
          iconVisibilityOff = _ref.iconVisibilityOff,
          passwordIsVisible = _ref.passwordIsVisible,
          selectorPasswordVisibilityButton = _ref.selectorPasswordVisibilityButton;

      if (passwordIsVisible) {
        iconVisibilityOn.setAttribute('hidden', true);
        iconVisibilityOff.removeAttribute('hidden');
        selectorPasswordVisibilityButton.setAttribute('aria-label', 'Hide password');
        return;
      }

      iconVisibilityOn.removeAttribute('hidden');
      iconVisibilityOff.setAttribute('hidden', true);
      selectorPasswordVisibilityButton.setAttribute('aria-label', 'Show password');
    };

    _this._toggle = function (_ref2) {
      var element = _ref2.element,
          button = _ref2.button; // toggle action must come before querying the classList

      element.classList.toggle(_this.options.passwordIsVisible);
      var passwordIsVisible = element.classList.contains(_this.options.passwordIsVisible);
      var iconVisibilityOn = button.querySelector(_this.options.svgIconVisibilityOn);
      var iconVisibilityOff = button.querySelector(_this.options.svgIconVisibilityOff);
      var input = element.querySelector(_this.options.selectorPasswordField);
      var selectorPasswordVisibilityButton = element.querySelector(_this.options.selectorPasswordVisibilityButton);

      _this._setIconVisibility({
        iconVisibilityOn: iconVisibilityOn,
        iconVisibilityOff: iconVisibilityOff,
        passwordIsVisible: passwordIsVisible,
        selectorPasswordVisibilityButton: selectorPasswordVisibilityButton
      });

      input.type = passwordIsVisible ? 'text' : 'password';
    };

    _this.manage(on(_this.element, 'click', function (event) {
      var toggleVisibilityButton = eventMatches(event, _this.options.selectorPasswordVisibilityButton);

      if (toggleVisibilityButton) {
        _this._toggle({
          element: _element,
          button: toggleVisibilityButton
        });
      }
    }));

    return _this;
  }
  /**
   *
   * @param {Object} obj - Object containing selectors and visibility status
   * @param {HTMLElement} obj.iconVisibilityOn - The element functioning as
   * the SVG icon for visibility on
   * @param {HTMLElement} obj.iconVisibilityOff - The element functioning as
   * the SVG icon for visibility off
   * @param {boolean} obj.passwordIsVisible - The visibility of the password in the
   * input field
   */


  _createClass(TextInput, null, [{
    key: "options",

    /**
     * The component options.
     *
     * If `options` is specified in the constructor,
     * {@linkcode TextInput.create .create()},
     * or {@linkcode TextInput.init .init()},
     * properties in this object are overriden for the instance being
     * created and how {@linkcode TextInput.init .init()} works.
     * @property {string} selectorInit The CSS selector to find text input UIs.
     */
    get: function get() {
      var prefix = settings.prefix;
      return {
        selectorInit: '[data-text-input]',
        selectorPasswordField: ".".concat(prefix, "--text-input[data-toggle-password-visibility]"),
        selectorPasswordVisibilityButton: ".".concat(prefix, "--text-input--password__visibility"),
        passwordIsVisible: "".concat(prefix, "--text-input--password-visible"),
        svgIconVisibilityOn: 'svg.icon--visibility-on',
        svgIconVisibilityOff: 'svg.icon--visibility-off'
      };
    }
    /**
     * The map associating DOM element and text input UI instance.
     * @type {WeakMap}
     */

  }]);

  TextInput.components = new WeakMap();
  return TextInput;
}(mixin(createComponent, initComponentBySearch, handles));

export { TextInput as default };