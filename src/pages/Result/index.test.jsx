import React from 'react';
import renderer from 'react-test-renderer';

import Result from 'pages/Result/index.jsx';



test('Link changes the class when hovered', () => {
  const component = renderer.create(
    <Result resultID="1"/>,
  );

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

  // manually trigger the callback
  tree.props.onMouseEnter();
  // re-rendering
  tree = component.toJSON();
  expect(tree).toMatchSnapshot();

  // manually trigger the callback
  tree.props.onMouseLeave();
  // re-rendering
  tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});