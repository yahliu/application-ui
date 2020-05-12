'use strict';

var _resolve = require('eslint-module-utils/resolve');

var _resolve2 = _interopRequireDefault(_resolve);

var _ModuleCache = require('eslint-module-utils/ModuleCache');

var _ModuleCache2 = _interopRequireDefault(_ModuleCache);

var _moduleVisitor = require('eslint-module-utils/moduleVisitor');

var _moduleVisitor2 = _interopRequireDefault(_moduleVisitor);

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @fileOverview Ensures that an imported path exists, given resolution rules.
 * @author Ben Mosher
 */

module.exports = {
  meta: {
    docs: {
      url: (0, _docsUrl2.default)('no-unresolved')
    },

    schema: [(0, _moduleVisitor.makeOptionsSchema)({
      caseSensitive: { type: 'boolean', default: true }
    })]
  },

  create: function (context) {

    function checkSourceValue(source) {
      const shouldCheckCase = !_resolve.CASE_SENSITIVE_FS && (!context.options[0] || context.options[0].caseSensitive !== false);

      const resolvedPath = (0, _resolve2.default)(source.value, context);

      if (resolvedPath === undefined) {
        context.report(source, `Unable to resolve path to module '${source.value}'.`);
      } else if (shouldCheckCase) {
        const cacheSettings = _ModuleCache2.default.getSettings(context.settings);
        if (!(0, _resolve.fileExistsWithCaseSync)(resolvedPath, cacheSettings)) {
          context.report(source, `Casing of ${source.value} does not match the underlying filesystem.`);
        }
      }
    }

    return (0, _moduleVisitor2.default)(checkSourceValue, context.options[0]);
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bGVzL25vLXVucmVzb2x2ZWQuanMiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsIm1ldGEiLCJkb2NzIiwidXJsIiwic2NoZW1hIiwiY2FzZVNlbnNpdGl2ZSIsInR5cGUiLCJkZWZhdWx0IiwiY3JlYXRlIiwiY29udGV4dCIsImNoZWNrU291cmNlVmFsdWUiLCJzb3VyY2UiLCJzaG91bGRDaGVja0Nhc2UiLCJvcHRpb25zIiwicmVzb2x2ZWRQYXRoIiwidmFsdWUiLCJ1bmRlZmluZWQiLCJyZXBvcnQiLCJjYWNoZVNldHRpbmdzIiwiZ2V0U2V0dGluZ3MiLCJzZXR0aW5ncyJdLCJtYXBwaW5ncyI6Ijs7QUFLQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBUkE7Ozs7O0FBVUFBLE9BQU9DLE9BQVAsR0FBaUI7QUFDZkMsUUFBTTtBQUNKQyxVQUFNO0FBQ0pDLFdBQUssdUJBQVEsZUFBUjtBQURELEtBREY7O0FBS0pDLFlBQVEsQ0FBRSxzQ0FBa0I7QUFDMUJDLHFCQUFlLEVBQUVDLE1BQU0sU0FBUixFQUFtQkMsU0FBUyxJQUE1QjtBQURXLEtBQWxCLENBQUY7QUFMSixHQURTOztBQVdmQyxVQUFRLFVBQVVDLE9BQVYsRUFBbUI7O0FBRXpCLGFBQVNDLGdCQUFULENBQTBCQyxNQUExQixFQUFrQztBQUNoQyxZQUFNQyxrQkFBa0IsZ0NBQ3JCLENBQUNILFFBQVFJLE9BQVIsQ0FBZ0IsQ0FBaEIsQ0FBRCxJQUF1QkosUUFBUUksT0FBUixDQUFnQixDQUFoQixFQUFtQlIsYUFBbkIsS0FBcUMsS0FEdkMsQ0FBeEI7O0FBR0EsWUFBTVMsZUFBZSx1QkFBUUgsT0FBT0ksS0FBZixFQUFzQk4sT0FBdEIsQ0FBckI7O0FBRUEsVUFBSUssaUJBQWlCRSxTQUFyQixFQUFnQztBQUM5QlAsZ0JBQVFRLE1BQVIsQ0FBZU4sTUFBZixFQUNHLHFDQUFvQ0EsT0FBT0ksS0FBTSxJQURwRDtBQUVELE9BSEQsTUFLSyxJQUFJSCxlQUFKLEVBQXFCO0FBQ3hCLGNBQU1NLGdCQUFnQixzQkFBWUMsV0FBWixDQUF3QlYsUUFBUVcsUUFBaEMsQ0FBdEI7QUFDQSxZQUFJLENBQUMscUNBQXVCTixZQUF2QixFQUFxQ0ksYUFBckMsQ0FBTCxFQUEwRDtBQUN4RFQsa0JBQVFRLE1BQVIsQ0FBZU4sTUFBZixFQUNHLGFBQVlBLE9BQU9JLEtBQU0sNENBRDVCO0FBRUQ7QUFFRjtBQUNGOztBQUVELFdBQU8sNkJBQWNMLGdCQUFkLEVBQWdDRCxRQUFRSSxPQUFSLENBQWdCLENBQWhCLENBQWhDLENBQVA7QUFFRDtBQXBDYyxDQUFqQiIsImZpbGUiOiJydWxlcy9uby11bnJlc29sdmVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZU92ZXJ2aWV3IEVuc3VyZXMgdGhhdCBhbiBpbXBvcnRlZCBwYXRoIGV4aXN0cywgZ2l2ZW4gcmVzb2x1dGlvbiBydWxlcy5cbiAqIEBhdXRob3IgQmVuIE1vc2hlclxuICovXG5cbmltcG9ydCByZXNvbHZlLCB7IENBU0VfU0VOU0lUSVZFX0ZTLCBmaWxlRXhpc3RzV2l0aENhc2VTeW5jIH0gZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9yZXNvbHZlJ1xuaW1wb3J0IE1vZHVsZUNhY2hlIGZyb20gJ2VzbGludC1tb2R1bGUtdXRpbHMvTW9kdWxlQ2FjaGUnXG5pbXBvcnQgbW9kdWxlVmlzaXRvciwgeyBtYWtlT3B0aW9uc1NjaGVtYSB9IGZyb20gJ2VzbGludC1tb2R1bGUtdXRpbHMvbW9kdWxlVmlzaXRvcidcbmltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBtZXRhOiB7XG4gICAgZG9jczoge1xuICAgICAgdXJsOiBkb2NzVXJsKCduby11bnJlc29sdmVkJyksXG4gICAgfSxcblxuICAgIHNjaGVtYTogWyBtYWtlT3B0aW9uc1NjaGVtYSh7XG4gICAgICBjYXNlU2Vuc2l0aXZlOiB7IHR5cGU6ICdib29sZWFuJywgZGVmYXVsdDogdHJ1ZSB9LFxuICAgIH0pXSxcbiAgfSxcblxuICBjcmVhdGU6IGZ1bmN0aW9uIChjb250ZXh0KSB7XG5cbiAgICBmdW5jdGlvbiBjaGVja1NvdXJjZVZhbHVlKHNvdXJjZSkge1xuICAgICAgY29uc3Qgc2hvdWxkQ2hlY2tDYXNlID0gIUNBU0VfU0VOU0lUSVZFX0ZTICYmXG4gICAgICAgICghY29udGV4dC5vcHRpb25zWzBdIHx8IGNvbnRleHQub3B0aW9uc1swXS5jYXNlU2Vuc2l0aXZlICE9PSBmYWxzZSlcblxuICAgICAgY29uc3QgcmVzb2x2ZWRQYXRoID0gcmVzb2x2ZShzb3VyY2UudmFsdWUsIGNvbnRleHQpXG5cbiAgICAgIGlmIChyZXNvbHZlZFBhdGggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb250ZXh0LnJlcG9ydChzb3VyY2UsXG4gICAgICAgICAgYFVuYWJsZSB0byByZXNvbHZlIHBhdGggdG8gbW9kdWxlICcke3NvdXJjZS52YWx1ZX0nLmApXG4gICAgICB9XG5cbiAgICAgIGVsc2UgaWYgKHNob3VsZENoZWNrQ2FzZSkge1xuICAgICAgICBjb25zdCBjYWNoZVNldHRpbmdzID0gTW9kdWxlQ2FjaGUuZ2V0U2V0dGluZ3MoY29udGV4dC5zZXR0aW5ncylcbiAgICAgICAgaWYgKCFmaWxlRXhpc3RzV2l0aENhc2VTeW5jKHJlc29sdmVkUGF0aCwgY2FjaGVTZXR0aW5ncykpIHtcbiAgICAgICAgICBjb250ZXh0LnJlcG9ydChzb3VyY2UsXG4gICAgICAgICAgICBgQ2FzaW5nIG9mICR7c291cmNlLnZhbHVlfSBkb2VzIG5vdCBtYXRjaCB0aGUgdW5kZXJseWluZyBmaWxlc3lzdGVtLmApXG4gICAgICAgIH1cblxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtb2R1bGVWaXNpdG9yKGNoZWNrU291cmNlVmFsdWUsIGNvbnRleHQub3B0aW9uc1swXSlcblxuICB9LFxufVxuIl19