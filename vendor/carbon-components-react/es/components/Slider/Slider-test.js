import React from 'react';
import Slider from '../Slider';
import SliderSkeleton from '../Slider/Slider.Skeleton';
import { mount, shallow } from 'enzyme';
import 'requestanimationframe';
describe('Slider', function () {
  describe('Renders as expected', function () {
    var mockFn = jest.fn();
    var wrapper = mount(React.createElement(Slider, {
      id: "slider",
      className: "extra-class",
      value: 50,
      min: 0,
      max: 100,
      step: 1,
      onChange: mockFn
    }));
    it('renders children as expected', function () {
      expect(wrapper.find('.bx--text-input').length).toBe(1);
    });
    it('has the expected classes', function () {
      expect(wrapper.find('.bx--slider').length).toBe(1);
    });
    it('renders extra classes passed in via className', function () {
      expect(wrapper.find('.bx--slider').hasClass('extra-class')).toEqual(true);
    });
    it('can be disabled', function () {
      wrapper.setProps({
        disabled: true
      });
      expect(wrapper.props().disabled).toEqual(true);
    });
    it('can set value via props', function () {
      wrapper.setProps({
        value: 55
      });
      expect(wrapper.props().value).toEqual(55);
    });
    it('should specify light version as expected', function () {
      expect(wrapper.props().light).toEqual(false);
      wrapper.setProps({
        light: true
      });
      expect(wrapper.props().light).toEqual(true);
    });
  });
  describe('Supporting label', function () {
    it('concatenates the value and the label by default', function () {
      var wrapper = mount(React.createElement(Slider, {
        min: 0,
        minLabel: "min",
        max: 100,
        maxLabel: "max",
        value: 0
      }));
      expect(wrapper.find('.bx--slider__range-label').first().text()).toBe('0min');
      expect(wrapper.find('.bx--slider__range-label').last().text()).toBe('100max');
    });
    it('supports custom formatting of the label', function () {
      var wrapper = mount(React.createElement(Slider, {
        min: 0,
        minLabel: "min",
        max: 100,
        maxLabel: "max",
        formatLabel: function formatLabel(value, label) {
          return "".concat(value, "-").concat(label);
        },
        value: 0
      }));
      expect(wrapper.find('.bx--slider__range-label').first().text()).toBe('0-min');
      expect(wrapper.find('.bx--slider__range-label').last().text()).toBe('100-max');
    });
  });
  describe('updatePosition method', function () {
    var mockFn = jest.fn();
    var wrapper = mount(React.createElement(Slider, {
      id: "slider",
      className: "extra-class",
      value: 50,
      min: 0,
      max: 100,
      step: 1,
      onChange: mockFn
    }));
    it('sets correct state from event with a right/up keydown', function () {
      var evt = {
        type: 'keydown',
        which: '38'
      };
      wrapper.instance().updatePosition(evt);
      expect(mockFn).lastCalledWith({
        value: 51
      });
      expect(wrapper.state().value).toEqual(51);
    });
    it('sets correct state from event with a left/down keydown', function () {
      var evt = {
        type: 'keydown',
        which: '40'
      };
      wrapper.instance().updatePosition(evt);
      expect(mockFn).lastCalledWith({
        value: 50
      });
      expect(wrapper.state().value).toEqual(50);
    });
    it('sets correct state from event with a clientX', function () {
      var evt = {
        type: 'click',
        clientX: '1000'
      };
      wrapper.instance().updatePosition(evt);
      expect(mockFn).lastCalledWith({
        value: 100
      });
      expect(wrapper.state().value).toEqual(100);
    });
  });
});
describe('SliderSkeleton', function () {
  describe('Renders as expected', function () {
    var wrapper = shallow(React.createElement(SliderSkeleton, null));
    var slider = wrapper.find('.bx--slider-container');
    it('Has the expected classes', function () {
      expect(slider.hasClass('bx--skeleton')).toEqual(true);
    });
  });
});