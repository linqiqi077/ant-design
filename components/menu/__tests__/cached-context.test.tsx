import React, { memo, useContext, useRef, useState } from 'react';
import { fireEvent, render } from '../../../tests/utils';
import Menu from '../index';
import MenuContext from '../MenuContext';

// we use'memo' here in order to only render inner component while context changed.
const CacheInner = memo(() => {
  const countRef = useRef(0);
  countRef.current++;
  // subscribe anchor context
  useContext(MenuContext);
  return (
    <div>
      Child Rendering Count: <span id="child_count">{countRef.current}</span>
    </div>
  );
});

const CacheOuter = () => {
  // We use 'useState' here in order to trigger parent component rendering.
  const [count, setCount] = useState(1);
  const handleClick = () => {
    setCount(count + 1);
  };
  // During each rendering phase, the cached context value returned from method 'Menu#getMemoizedContextValue' will take effect.
  // So 'CacheInner' component won't rerender.
  return (
    <div>
      <button type="button" onClick={handleClick} id="parent_btn">
        Click
      </button>
      Parent Rendering Count: <span id="parent_count">{count}</span>
      <Menu>
        <Menu.Item key="test">
          <CacheInner />
        </Menu.Item>
      </Menu>
    </div>
  );
};

it("Rendering on Menu without changed MenuContext won't trigger rendering on child component.", () => {
  const { container, unmount } = render(<CacheOuter />);
  const childCount = container.querySelector('#child_count')!.textContent;
  fireEvent.click(container.querySelector('#parent_btn')!);

  expect(container.querySelector('#parent_count')?.textContent).toBe('2');
  // child component won't rerender
  expect(container.querySelector('#child_count')?.textContent).toBe(childCount);
  fireEvent.click(container.querySelector('#parent_btn')!);
  expect(container.querySelector('#parent_count')?.textContent).toBe('3');
  // child component won't rerender
  expect(container.querySelector('#child_count')?.textContent).toBe(childCount);
  // in order to depress warning "Warning: An update to Menu inside a test was not wrapped in act(...)."
  unmount();
});
