'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.codeRenderer = codeRenderer;
exports.default = createRenderer;

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

var _he = require('he');

var _he2 = _interopRequireDefault(_he);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function codeRenderer(tracker, options) {
  function CodeComponent(props) {
    return options.createElement('pre', null,
    // eslint-disable-next-line react/no-danger-with-children
    options.createElement('code', {
      className: 'language-' + props.language,
      dangerouslySetInnerHTML: options.highlight ? { __html: options.highlight(props.language, props.code) } : null
    }, options.highlight ? null : props.code));
  }

  return function (code, language) {
    // eslint-disable-next-line no-plusplus, no-param-reassign
    var elementId = tracker.nextElementId++;

    // eslint-disable-next-line no-param-reassign
    tracker.elements[elementId] = options.createElement(options.elements && options.elements.code || CodeComponent, { key: elementId, code: code, language: language });

    tracker.tree.push(tracker.elements[elementId]);

    return '{{' + elementId + '}}';
  };
}

function createRenderer(tracker, options) {
  var overrides = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var renderer = new _marked2.default.Renderer();

  function getTocPosition(toc, level) {
    var currentLevel = toc.children;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (!currentLevel.length || currentLevel[currentLevel.length - 1].level === level) {
        return currentLevel;
      }
      currentLevel = currentLevel[currentLevel.length - 1].children;
    }
  }

  function populateInlineContent() {
    var content = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    var contentArray = content.split(/(\{\{.*?\}\})/);
    var extractedElements = contentArray.map(function (text) {
      var elementIdMatch = text.match(/\{\{(.*)\}\}/);
      if (elementIdMatch) {
        tracker.tree.splice(tracker.tree.indexOf(tracker.elements[elementIdMatch[1]]), 1);
        return tracker.elements[elementIdMatch[1]];
      } else if (text !== '') {
        return _he2.default.decode(text);
      }

      return null;
    });

    return extractedElements;
  }

  function addElement(tag) {
    var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var children = arguments[2];
    var type = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : tag;

    // eslint-disable-next-line no-plusplus, no-param-reassign
    var elementId = tracker.nextElementId++;
    var inlineContent = null;

    var elementType = options.elements && options.elements[type];

    if (children) {
      inlineContent = Array.isArray(children) ? children.map(populateInlineContent) : populateInlineContent(children);
    }

    // eslint-disable-next-line no-param-reassign
    tracker.elements[elementId] = options.createElement(elementType || tag, Object.assign({
      key: elementId
    }, props, elementType ? { context: tracker.context } : {}), inlineContent);

    tracker.tree.push(tracker.elements[elementId]);

    return '{{' + elementId + '}}';
  }

  renderer.code = overrides.code || codeRenderer(tracker, options);

  renderer.html = overrides.html || function (html) {
    // eslint-disable-next-line no-plusplus, no-param-reassign
    var elementId = tracker.nextElementId++;

    tracker.tree.push(options.createElement('div', {
      key: elementId,
      dangerouslySetInnerHTML: {
        __html: html
      }
    }));
  };

  renderer.paragraph = overrides.paragraph || function (text) {
    return addElement('p', null, text);
  };

  renderer.blockquote = overrides.blockquote || function (text) {
    return addElement('blockquote', null, text);
  };

  renderer.link = overrides.link || function (href, title, text) {
    return addElement('a', { href: href, title: title }, text);
  };

  renderer.br = overrides.br || function () {
    return addElement('br');
  };

  renderer.hr = overrides.hr || function () {
    return addElement('hr');
  };

  renderer.strong = overrides.strong || function (text) {
    return addElement('strong', null, text);
  };

  renderer.del = overrides.del || function (text) {
    return addElement('del', null, text);
  };

  renderer.em = overrides.em || function (text) {
    return addElement('em', null, text);
  };

  renderer.heading = overrides.heading || function (text, level) {
    // eslint-disable-next-line no-param-reassign
    tracker.currentId = tracker.currentId.slice(0, level - 1);
    tracker.currentId.push(text.replace(/\s/g, '-').toLowerCase());

    var id = tracker.currentId.join('-');
    var lastToc = tracker.toc[tracker.toc.length - 1];

    if (!lastToc || lastToc.level > level) {
      tracker.toc.push({
        id: id,
        title: text,
        level: level,
        children: []
      });
    } else {
      var tocPosition = getTocPosition(lastToc, level);

      tocPosition.push({
        id: id,
        title: text,
        level: level,
        children: []
      });
    }

    return addElement('h' + level, {
      id: id
    }, text);
  };

  renderer.list = overrides.list || function (body, ordered) {
    return addElement(ordered ? 'ol' : 'ul', null, body);
  };

  renderer.listitem = overrides.listitem || function (text) {
    return addElement('li', null, text);
  };

  renderer.table = overrides.table || function (header, body) {
    return addElement('table', null, [addElement('thead', null, header), addElement('tbody', null, body)]);
  };

  renderer.thead = overrides.thead || function (content) {
    return addElement('thead', null, content);
  };

  renderer.tbody = overrides.tbody || function (content) {
    return addElement('tbody', null, content);
  };

  renderer.tablerow = overrides.tablerow || function (content) {
    return addElement('tr', null, content);
  };

  renderer.tablecell = overrides.tablecell || function (content, flag) {
    var tag = flag.header ? 'th' : 'td';
    return addElement(tag, { className: flag.align ? 'text-' + flag.align : undefined }, content);
  };

  renderer.codespan = overrides.codespan || function (text) {
    return addElement('code', null, text, 'codespan');
  };

  renderer.image = overrides.image || function (href, title, text) {
    return addElement('img', { src: href, alt: text });
  };

  return renderer;
}
//# sourceMappingURL=createRenderer.js.map