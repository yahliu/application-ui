(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports !== "undefined") {
    factory();
  } else {
    var mod = {
      exports: {}
    };
    factory();
    global.listBoxConfig = mod.exports;
  }
})(this, function () {
  'use strict';

  var featureFlags = require('../../globals/js/feature-flags');

  var _require = require('../../globals/js/settings'),
      prefix = _require.prefix;

  var items = [{
    id: 'downshift-1-item-0',
    label: 'Option 1',
    selected: true
  }, {
    id: 'downshift-1-item-1',
    label: 'Option 2'
  }, {
    id: 'downshift-1-item-2',
    label: 'Option 3'
  }, {
    id: 'downshift-1-item-3',
    label: 'Option 4'
  }];
  module.exports = {
    context: {
      featureFlags: featureFlags,
      prefix: prefix
    },
    variants: [{
      name: 'default',
      label: 'List Box',
      context: {
        items: items
      }
    }, {
      name: 'inline',
      label: 'Inline',
      context: {
        inline: true,
        items: items
      }
    }, {
      name: 'light',
      label: 'Light',
      context: {
        light: true,
        items: items
      }
    }]
  };
});