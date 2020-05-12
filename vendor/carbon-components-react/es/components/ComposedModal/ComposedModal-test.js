import React from 'react';
import { shallow, mount } from 'enzyme';
import ComposedModal, { ModalHeader, ModalBody, ModalFooter } from '../ComposedModal';
describe('<ModalHeader />', function () {
  describe('Renders as expected', function () {
    var titleWrapper = shallow(React.createElement(ModalHeader, {
      title: "Something"
    }));
    var labelWrapper = shallow(React.createElement(ModalHeader, {
      label: "Something"
    }));
    it('does not render title if no title', function () {
      expect(labelWrapper.find('.bx--modal-header__heading').exists()).toBe(false);
    });
    it('does not render label if no label', function () {
      expect(titleWrapper.find('.bx--modal-header__label').exists()).toBe(false);
    });
    it('renders title if title text', function () {
      expect(titleWrapper.find('.bx--modal-header__heading').exists()).toBe(true);
    });
    it('renders label if label text', function () {
      expect(labelWrapper.find('.bx--modal-header__label').exists()).toBe(true);
    });
  });
});
describe('<ModalBody />', function () {
  describe('Renders as expected', function () {
    var wrapper = shallow(React.createElement(ModalBody, {
      className: "extra-class"
    }, React.createElement("p", null, "Test")));
    it('renders children as expected', function () {
      expect(wrapper.find('p').length).toBe(1);
    });
    it('renders wrapper as expected', function () {
      expect(wrapper.length).toBe(1);
    });
    it('has the expected classes', function () {
      expect(wrapper.hasClass('bx--modal-content')).toEqual(true);
    });
    it('renders extra classes passed in via className', function () {
      expect(wrapper.hasClass('extra-class')).toEqual(true);
    });
  });
});
describe('<ModalFooter />', function () {
  describe('Renders as expected', function () {
    var wrapper = shallow(React.createElement(ModalFooter, {
      className: "extra-class"
    }, React.createElement("p", null, "Test")));
    it('renders children as expected', function () {
      expect(wrapper.find('p').length).toBe(1);
    });
    it('renders wrapper as expected', function () {
      expect(wrapper.length).toBe(1);
    });
    it('has the expected classes', function () {
      expect(wrapper.hasClass('bx--modal-footer')).toEqual(true);
    });
    it('renders extra classes passed in via className', function () {
      expect(wrapper.hasClass('extra-class')).toEqual(true);
    });
  });
  describe('Should render buttons only if appropriate prop passed in in', function () {
    var wrapper = shallow(React.createElement(ModalFooter, {
      className: "extra-class"
    }, React.createElement("p", null, "Test")));
    var primaryWrapper = shallow(React.createElement(ModalFooter, {
      primaryButtonText: "test"
    }));
    var secondaryWrapper = shallow(React.createElement(ModalFooter, {
      secondaryButtonText: "test"
    }));
    it('does not render primary button if no primary text', function () {
      expect(wrapper.find('.bx--btn--primary').exists()).toBe(false);
    });
    it('does not render secondary button if no secondary text', function () {
      expect(wrapper.find('.bx--btn--secondary').exists()).toBe(false);
    });
    it('renders primary button if primary text', function () {
      var buttonComponent = primaryWrapper.find('Button');
      expect(buttonComponent.exists()).toBe(true);
      expect(buttonComponent.props().kind).toBe('primary');
    });
    it('renders primary button if secondary text', function () {
      var buttonComponent = secondaryWrapper.find('Button');
      expect(buttonComponent.exists()).toBe(true);
      expect(buttonComponent.props().kind).toBe('secondary');
    });
  });
  describe('Should render the appropriate buttons when `danger` prop is true', function () {
    var primaryWrapper = shallow(React.createElement(ModalFooter, {
      primaryButtonText: "test",
      danger: true
    }));
    var secondaryWrapper = shallow(React.createElement(ModalFooter, {
      secondaryButtonText: "test",
      danger: true
    }));
    it('renders danger--primary button if primary text && danger', function () {
      var buttonComponent = primaryWrapper.find('Button');
      expect(buttonComponent.exists()).toBe(true);
      expect(buttonComponent.props().kind).toBe('danger--primary');
    });
    it('renders tertiary button if secondary text && danger', function () {
      var buttonComponent = secondaryWrapper.find('Button');
      expect(buttonComponent.exists()).toBe(true);
      expect(buttonComponent.props().kind).toBe('tertiary');
    });
  });
});
describe('<ComposedModal />', function () {
  it('renders', function () {
    var wrapper = mount(React.createElement(ComposedModal, {
      open: true
    }));
    expect(wrapper).toMatchSnapshot();
  });
  it('changes the open state upon change in props', function () {
    var wrapper = mount(React.createElement(ComposedModal, {
      open: true
    }));
    expect(wrapper.state().open).toEqual(true);
    wrapper.setProps({
      open: false
    });
    expect(wrapper.state().open).toEqual(false);
  });
  it('avoids change the open state upon setting props, unless there the value actually changes', function () {
    var wrapper = shallow(React.createElement(ComposedModal, null));
    wrapper.setProps({
      open: true
    });
    wrapper.setState({
      open: false
    });
    wrapper.setProps({
      open: true
    });
    expect(wrapper.state().open).toEqual(false);
  });
  it('calls onClick upon user-initiated closing', function () {
    var onClose = jest.fn();
    var wrapper = mount(React.createElement(ComposedModal, {
      open: true,
      onClose: onClose
    }, React.createElement(ModalHeader, null)));
    var button = wrapper.find('.bx--modal-close').first();
    button.simulate('click');
    expect(wrapper.state().open).toEqual(false);
    expect(onClose.mock.calls.length).toBe(1);
  });
  it('provides a way to prevent upon user-initiated closing', function () {
    var onClose = jest.fn(function () {
      return false;
    });
    var wrapper = mount(React.createElement(ComposedModal, {
      open: true,
      onClose: onClose
    }, React.createElement(ModalHeader, null)));
    var button = wrapper.find('.bx--modal-close').first();
    button.simulate('click');
    expect(wrapper.state().open).toEqual(true);
  });
  it('should focus on the primary actionable button in ModalFooter by default', function () {
    mount(React.createElement(ComposedModal, {
      open: true
    }, React.createElement(ModalFooter, {
      primaryButtonText: "Save"
    })));
    expect(document.activeElement.classList.contains('bx--btn--primary')).toEqual(true);
  });
  it('should focus on the element that matches selectorPrimaryFocus', function () {
    mount(React.createElement(ComposedModal, {
      open: true,
      selectorPrimaryFocus: ".bx--modal-close"
    }, React.createElement(ModalHeader, {
      label: "Optional Label",
      title: "Example"
    }), React.createElement(ModalFooter, {
      primaryButtonText: "Save"
    })));
    expect(document.activeElement.classList.contains('bx--modal-close')).toEqual(true);
  });
});