import React from 'react';
import { storiesOf } from '@storybook/react';
import FormLabel from './FormLabel';
import Tooltip from '../Tooltip';
var additionalProps = {
  className: 'some-class'
};
storiesOf('FormLabel', module).add('Default', function () {
  return React.createElement(FormLabel, additionalProps, "Label");
}, {
  info: {
    text: 'Form label.'
  }
}).add('With tooltip', function () {
  return React.createElement(FormLabel, additionalProps, React.createElement(Tooltip, {
    triggerText: "Label"
  }, "This is the content of the tooltip."));
}, {
  info: {
    text: 'Form label with tooltip.'
  }
});