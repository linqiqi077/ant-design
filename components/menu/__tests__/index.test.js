import { InboxOutlined, MailOutlined, PieChartOutlined, UserOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { act } from 'react-dom/test-utils';
import Menu from '..';
import mountTest from '../../../tests/shared/mountTest';
import rtlTest from '../../../tests/shared/rtlTest';
import { fireEvent, render } from '../../../tests/utils';
import Layout from '../../layout';
import collapseMotion from '../../_util/motion';
import { noop } from '../../_util/warning';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const { SubMenu } = Menu;

describe('Menu', () => {
  function triggerAllTimer() {
    for (let i = 0; i < 10; i += 1) {
      act(() => {
        jest.runAllTimers();
      });
    }
  }

  const expectSubMenuBehavior = (defaultProps, instance, enter = noop, leave = noop) => {
    const { container } = instance;

    expect(container.querySelectorAll('ul.ant-menu-sub')).toHaveLength(0);
    const AnimationClassNames = {
      horizontal: 'ant-slide-up-leave',
      inline: 'ant-motion-collapse-leave',
      vertical: 'ant-zoom-big-leave',
    };
    const mode = defaultProps.mode || 'horizontal';

    act(() => {
      enter();
    });

    // React concurrent may delay creat this
    triggerAllTimer();

    function getSubMenu() {
      if (mode === 'inline') {
        return container.querySelector('ul.ant-menu-sub.ant-menu-inline');
      }
      return container.querySelector('div.ant-menu-submenu-popup');
    }

    expect(
      getSubMenu().classList.contains('ant-menu-hidden') ||
        getSubMenu().classList.contains(AnimationClassNames[mode]),
    ).toBeFalsy();

    act(() => {
      leave();
    });

    // React concurrent may delay creat this
    triggerAllTimer();

    if (getSubMenu()) {
      expect(
        getSubMenu().classList.contains('ant-menu-hidden') ||
          getSubMenu().classList.contains(AnimationClassNames[mode]),
      ).toBeTruthy();
    }
  };

  // window.requestAnimationFrame = callback => window.setTimeout(callback, 16);
  // window.cancelAnimationFrame = window.clearTimeout;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  mountTest(() => (
    <Menu>
      <Menu.Item />
      <Menu.ItemGroup />
      <Menu.SubMenu />
    </Menu>
  ));

  mountTest(() => (
    <Menu>
      <Menu.Item />
      <>
        <Menu.ItemGroup />
        <Menu.SubMenu />
        {null}
      </>
      {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
      <>
        <Menu.Item />
      </>
      {undefined}
      {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
      <>
        {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
        <>
          <Menu.Item />
        </>
      </>
    </Menu>
  ));

  rtlTest(() => (
    <Menu>
      <Menu.Item />
      <Menu.ItemGroup />
      <Menu.SubMenu />
    </Menu>
  ));

  let div;

  beforeEach(() => {
    div = document.createElement('div');
    document.body.appendChild(div);
  });

  afterEach(() => {
    document.body.removeChild(div);
  });

  it('If has select nested submenu item ,the menu items on the grandfather level should be highlight', () => {
    const items = [
      {
        label: 'submenu1',
        key: '1',
        children: [
          {
            label: 'Option 1',
            key: '1-1',
          },
          {
            label: 'Option 2',
            key: '1-2',
          },
          {
            label: 'submenu1-3',
            key: '1-3',
            children: [
              {
                label: 'Option 3',
                key: '1-3-1',
              },
              {
                label: 'Option 4',
                key: '1-3-2',
              },
            ],
          },
        ],
      },
    ];
    const { container } = render(
      <Menu defaultSelectedKeys={['1-3-2']} mode="vertical" items={items} />,
    );
    expect(container.querySelectorAll('li.ant-menu-submenu-selected')).toHaveLength(1);
  });

  it('forceSubMenuRender', () => {
    const items = [
      {
        label: 'submenu1',
        key: '1',
        children: [
          {
            label: <span className="bamboo" />,
            key: '1-1',
          },
        ],
      },
    ];
    const { container, rerender } = render(<Menu mode="horizontal" items={items} />);
    expect(container.querySelectorAll('.bamboo')).toHaveLength(0);
    rerender(<Menu mode="horizontal" forceSubMenuRender items={items} />);
    expect(container.querySelectorAll('.bamboo')).toHaveLength(1);
  });

  it('should accept defaultOpenKeys in mode horizontal', () => {
    const items = [
      {
        label: 'submenu1',
        key: '1',
        children: [
          {
            label: 'Option 1',
            key: 'submenu1',
          },
          {
            label: 'Option 2',
            key: 'submenu2',
          },
        ],
      },
      {
        label: 'menu2',
        key: '2',
      },
    ];
    const { container } = render(<Menu defaultOpenKeys={['1']} mode="horizontal" items={items} />);
    expect(container.querySelector('.ant-menu-sub')).toBeFalsy();
  });

  it('should accept defaultOpenKeys in mode inline', () => {
    const items = [
      {
        label: 'submenu1',
        key: '1',
        children: [
          {
            label: 'Option 1',
            key: 'submenu1',
          },
          {
            label: 'Option 2',
            key: 'submenu2',
          },
        ],
      },
      {
        label: 'menu2',
        key: '2',
      },
    ];
    const { container } = render(<Menu defaultOpenKeys={['1']} mode="inline" items={items} />);

    expect(container.querySelector('.ant-menu-sub').className.includes('ant-menu-hidden')).not.toBe(
      true,
    );
  });

  it('should accept defaultOpenKeys in mode vertical', () => {
    const items = [
      {
        label: 'submenu1',
        key: '1',
        children: [
          {
            label: 'Option 1',
            key: 'submenu1',
          },
          {
            label: 'Option 2',
            key: 'submenu2',
          },
        ],
      },
      {
        label: 'menu2',
        key: '2',
      },
    ];
    const { container } = render(
      <Menu defaultOpenKeys={['1']} mode="vertical" items={items} />,
      // @ts-ignore
      { legacyRoot: true },
    );
    expect(
      container.querySelector('.ant-menu-submenu').className.includes('ant-menu-submenu-open'),
    ).toBe(true);
  });

  it('should accept openKeys in mode horizontal', () => {
    const items = [
      {
        label: 'submenu1',
        key: '1',
        children: [
          {
            label: 'Option 1',
            key: 'submenu1',
          },
          {
            label: 'Option 2',
            key: 'submenu2',
          },
        ],
      },
      {
        label: 'menu2',
        key: '2',
      },
    ];
    const { container } = render(<Menu openKeys={['1']} mode="horizontal" items={items} />);
    expect(
      container.querySelector('.ant-menu-submenu').className.includes('ant-menu-submenu-open'),
    ).toBe(true);
  });

  it('should accept openKeys in mode inline', () => {
    const items = [
      {
        label: 'submenu1',
        key: '1',
        children: [
          {
            label: 'Option 1',
            key: 'submenu1',
          },
          {
            label: 'Option 2',
            key: 'submenu2',
          },
        ],
      },
      {
        label: 'menu2',
        key: '2',
      },
    ];
    const { container } = render(<Menu openKeys={['1']} mode="inline" items={items} />);
    expect(
      container.querySelector('.ant-menu-submenu').className.includes('ant-menu-submenu-open'),
    ).toBe(true);
  });

  it('should accept openKeys in mode vertical', () => {
    const items = [
      {
        label: 'submenu1',
        key: '1',
        children: [
          {
            label: 'Option 1',
            key: 'submenu1',
          },
          {
            label: 'Option 2',
            key: 'submenu2',
          },
        ],
      },
      {
        label: 'menu2',
        key: '2',
      },
    ];
    const { container } = render(<Menu openKeys={['1']} mode="vertical" items={items} />);
    expect(
      container.querySelector('.ant-menu-submenu').className.includes('ant-menu-submenu-open'),
    ).toBe(true);
  });

  it('test submenu in mode horizontal', async () => {
    const items = [
      {
        label: 'submenu1',
        key: '1',
        children: [
          {
            label: 'Option 1',
            key: 'submenu1',
          },
          {
            label: 'Option 2',
            key: 'submenu2',
          },
        ],
      },
      {
        label: 'menu2',
        key: '2',
      },
    ];
    const defaultProps = {
      mode: 'horizontal',
    };

    const Demo = props => <Menu {...defaultProps} {...props} items={items} />;

    const instance = render(<Demo />);

    expectSubMenuBehavior(
      defaultProps,
      instance,
      () => instance.rerender(<Demo openKeys={['1']} />),
      () => instance.rerender(<Demo openKeys={[]} />),
    );

    instance.rerender(<Demo openKeys={['1']} />);
  });

  it('test submenu in mode inline', () => {
    const items = [
      {
        label: 'submenu1',
        key: '1',
        children: [
          {
            label: 'Option 1',
            key: 'submenu1',
          },
          {
            label: 'Option 2',
            key: 'submenu2',
          },
        ],
      },
      {
        label: 'menu2',
        key: '2',
      },
    ];
    const defaultProps = { mode: 'inline' };

    const Demo = props => <Menu {...defaultProps} {...props} items={items} />;
    const instance = render(<Demo />);
    expectSubMenuBehavior(
      defaultProps,
      instance,
      () => instance.rerender(<Demo openKeys={['1']} />),
      () => instance.rerender(<Demo openKeys={[]} />),
    );
  });

  it('test submenu in mode vertical', () => {
    const items = [
      {
        label: 'submenu1',
        key: '1',
        children: [
          {
            label: 'Option 1',
            key: 'submenu1',
          },
          {
            label: 'Option 2',
            key: 'submenu2',
          },
        ],
      },
      {
        label: 'menu2',
        key: '2',
      },
    ];
    const defaultProps = { mode: 'vertical', openTransitionName: '' };

    const Demo = props => <Menu {...defaultProps} {...props} items={items} />;

    const instance = render(<Demo />);
    expectSubMenuBehavior(
      defaultProps,
      instance,
      () => instance.rerender(<Demo openKeys={['1']} />),
      () => instance.rerender(<Demo openKeys={[]} />),
    );
  });

  describe('allows the overriding of theme at the popup submenu level', () => {
    const items = [
      {
        label: 'submenu1',
        key: '1',
        theme: 'light',
        children: [
          {
            label: 'Option 1',
            key: 'submenu1',
          },
          {
            label: 'Option 2',
            key: 'submenu2',
          },
        ],
      },
      {
        label: 'menu2',
        key: '2',
      },
    ];
    const menuModesWithPopupSubMenu = ['horizontal', 'vertical'];

    menuModesWithPopupSubMenu.forEach(menuMode => {
      it(`when menu is mode ${menuMode}`, () => {
        const { container } = render(
          <Menu mode={menuMode} openKeys={['1']} theme="dark" items={items} />,
        );

        act(() => {
          jest.runAllTimers();
        });

        expect(container.querySelector('ul.ant-menu-root')).toHaveClass('ant-menu-dark');
        expect(container.querySelector('div.ant-menu-submenu-popup')).toHaveClass('ant-menu-light');
      });
    });
  });

  // https://github.com/ant-design/ant-design/pulls/4677
  // https://github.com/ant-design/ant-design/issues/4692
  // TypeError: Cannot read property 'indexOf' of undefined
  it('pr #4677 and issue #4692', () => {
    const items = [
      {
        label: 'submenu1',
        children: [
          {
            label: 'menu1',
            key: '1',
          },
          {
            label: 'menu2',
            key: '2',
          },
        ],
      },
    ];
    render(<Menu mode="horizontal" items={items} />);

    act(() => {
      jest.runAllTimers();
    });
    // just expect no error emit
  });

  it('should always follow openKeys when mode is switched', () => {
    const items = [
      {
        label: 'submenu1',
        key: '1',
        children: [
          {
            label: 'Option 1',
            key: 'submenu1',
          },
          {
            label: 'Option 2',
            key: 'submenu2',
          },
        ],
      },
      {
        label: 'menu2',
        key: '2',
      },
    ];
    const Demo = props => <Menu openKeys={['1']} mode="inline" {...props} items={items} />;

    const { container, rerender } = render(<Demo />);
    expect(container.querySelector('ul.ant-menu-sub')).not.toHaveClass('ant-menu-hidden');

    rerender(<Demo mode="vertical" />);
    expect(container.querySelector('ul.ant-menu-sub')).not.toHaveClass('ant-menu-hidden');

    rerender(<Demo mode="inline" />);
    expect(container.querySelector('ul.ant-menu-sub')).not.toHaveClass('ant-menu-hidden');
  });

  it('should always follow openKeys when inlineCollapsed is switched', () => {
    const { container, rerender } = render(
      <Menu defaultOpenKeys={['1']} mode="inline">
        <Menu.Item key="menu1" icon={<InboxOutlined />}>
          Option
        </Menu.Item>
        <SubMenu key="1" title="submenu1">
          <Menu.Item key="submenu1">Option</Menu.Item>
          <Menu.Item key="submenu2">Option</Menu.Item>
        </SubMenu>
      </Menu>,
    );

    expect(
      container.querySelector('.ant-menu-submenu').className.includes('ant-menu-submenu-open'),
    ).toBe(true);

    // inlineCollapsed
    rerender(
      <Menu defaultOpenKeys={['1']} mode="inline" inlineCollapsed>
        <Menu.Item key="menu1" icon={<InboxOutlined />}>
          Option
        </Menu.Item>
        <SubMenu key="1" title="submenu1">
          <Menu.Item key="submenu1">Option</Menu.Item>
          <Menu.Item key="submenu2">Option</Menu.Item>
        </SubMenu>
      </Menu>,
    );
    act(() => {
      jest.runAllTimers();
    });

    expect(container.querySelector('ul.ant-menu-root')).toHaveClass('ant-menu-vertical');
    expect(document.querySelector('.ant-menu-submenu')).not.toHaveClass('ant-menu-submenu-hidden');

    // !inlineCollapsed
    rerender(
      <Menu defaultOpenKeys={['1']} mode="inline" inlineCollapsed={false}>
        <Menu.Item key="menu1" icon={<InboxOutlined />}>
          Option
        </Menu.Item>
        <SubMenu key="1" title="submenu1">
          <Menu.Item key="submenu1">Option</Menu.Item>
          <Menu.Item key="submenu2">Option</Menu.Item>
        </SubMenu>
      </Menu>,
    );
    act(() => {
      jest.runAllTimers();
    });
    const len = container.querySelectorAll('ul.ant-menu-sub').length;
    expect(container.querySelectorAll('ul.ant-menu-sub')[len - 1]).toHaveClass('ant-menu-inline');
    expect(
      container.querySelector('.ant-menu-submenu').className.includes('ant-menu-submenu-open'),
    ).toBe(true);
  });

  it('inlineCollapsed should works well when specify a not existed default openKeys', () => {
    const Demo = props => (
      <Menu defaultOpenKeys={['not-existed']} mode="inline" {...props}>
        <Menu.Item key="menu1" icon={<InboxOutlined />}>
          Option
        </Menu.Item>
        <SubMenu key="1" title="submenu1">
          <Menu.Item key="submenu1">Option</Menu.Item>
          <Menu.Item key="submenu2">Option</Menu.Item>
        </SubMenu>
      </Menu>
    );
    const { container, rerender } = render(<Demo />);

    expect(container.querySelectorAll('.ant-menu-sub')).toHaveLength(0);

    rerender(<Demo inlineCollapsed />);
    act(() => {
      jest.runAllTimers();
    });

    const transitionEndEvent = new Event('transitionend');
    fireEvent(container.querySelector('ul'), transitionEndEvent);
    act(() => {
      jest.runAllTimers();
    });

    fireEvent.mouseEnter(container.querySelector('.ant-menu-submenu-title'));
    triggerAllTimer();

    expect(container.querySelector('.ant-menu-submenu')).toHaveClass('ant-menu-submenu-vertical');
    expect(container.querySelector('.ant-menu-submenu')).toHaveClass('ant-menu-submenu-open');
    expect(container.querySelector('ul.ant-menu-sub')).toHaveClass('ant-menu-vertical');
    expect(container.querySelector('ul.ant-menu-sub')).not.toHaveClass('ant-menu-hidden');
  });

  it('inlineCollapsed Menu.Item Tooltip can be removed', () => {
    const { container } = render(
      <Menu
        defaultOpenKeys={['not-existed']}
        mode="inline"
        inlineCollapsed
        getPopupContainer={node => node.parentNode}
      >
        <Menu.Item key="menu1">item</Menu.Item>
        <Menu.Item key="menu2" title="title">
          item
        </Menu.Item>
        <Menu.Item key="menu3" title={undefined}>
          item
        </Menu.Item>
        <Menu.Item key="menu4" title={null}>
          item
        </Menu.Item>
        <Menu.Item key="menu5" title="">
          item
        </Menu.Item>
        <Menu.Item key="menu6" title={false}>
          item
        </Menu.Item>
      </Menu>,
    );

    const itemList = container.querySelectorAll('.ant-menu-item');
    fireEvent.mouseEnter(itemList[0]);
    triggerAllTimer();
    expect(document.body.querySelectorAll('.ant-tooltip-inner')[0].textContent).toBe('item');
    fireEvent.mouseEnter(itemList[1]);
    triggerAllTimer();
    expect(document.body.querySelectorAll('.ant-tooltip-inner')[1].textContent).toBe('title');
    fireEvent.mouseEnter(itemList[2]);
    triggerAllTimer();
    expect(document.body.querySelectorAll('.ant-tooltip-inner')[2].textContent).toBe('item');
    fireEvent.mouseEnter(itemList[3]);
    triggerAllTimer();
    expect(document.body.querySelectorAll('.ant-tooltip-inner')[3]).toBe(undefined);
    fireEvent.mouseEnter(itemList[4]);
    triggerAllTimer();
    expect(document.body.querySelectorAll('.ant-tooltip-inner')[4]).toBe(undefined);
  });

  describe('open submenu when click submenu title', () => {
    const toggleMenu = (instance, index, event) => {
      fireEvent[event](instance.container.querySelectorAll('.ant-menu-submenu-title')[index]);

      triggerAllTimer();
    };

    it('inline', () => {
      const items = [
        {
          label: 'submenu1',
          key: '1',
          children: [
            {
              label: 'Option 1',
              key: 'submenu1',
            },
            {
              label: 'Option 2',
              key: 'submenu2',
            },
          ],
        },
        {
          label: 'menu2',
          key: '2',
        },
      ];
      const defaultProps = { mode: 'inline' };

      const Demo = props => <Menu {...defaultProps} {...props} items={items} />;

      const instance = render(<Demo />);

      expectSubMenuBehavior(
        defaultProps,
        instance,
        () => toggleMenu(instance, 0, 'click'),
        () => toggleMenu(instance, 0, 'click'),
      );
    });

    it('inline menu collapseMotion should be triggered', async () => {
      const items = [
        {
          label: 'submenu1',
          key: '1',
          children: [
            {
              label: 'Option 1',
              key: 'submenu1',
            },
            {
              label: 'Option 2',
              key: 'submenu2',
            },
          ],
        },
        {
          label: 'menu2',
          key: '2',
        },
      ];
      const cloneMotion = {
        ...collapseMotion,
        motionDeadline: 1,
      };

      const onOpenChange = jest.fn();
      const onEnterEnd = jest.spyOn(cloneMotion, 'onEnterEnd');

      const { container } = render(
        <Menu mode="inline" motion={cloneMotion} onOpenChange={onOpenChange} items={items} />,
      );

      fireEvent.click(container.querySelector('.ant-menu-submenu-title'));

      triggerAllTimer();

      expect(onOpenChange).toHaveBeenCalled();
      expect(onEnterEnd).toHaveBeenCalledTimes(1);
    });

    it('vertical with hover(default)', () => {
      const items = [
        {
          label: 'submenu1',
          key: '1',
          children: [
            {
              label: 'Option 1',
              key: 'submenu1',
            },
            {
              label: 'Option 2',
              key: 'submenu2',
            },
          ],
        },
        {
          label: 'menu2',
          key: '2',
        },
      ];
      const defaultProps = { mode: 'vertical' };

      const Demo = () => <Menu {...defaultProps} items={items} />;

      const instance = render(<Demo />);

      expectSubMenuBehavior(
        defaultProps,
        instance,
        () => toggleMenu(instance, 0, 'mouseEnter'),
        () => toggleMenu(instance, 0, 'mouseLeave'),
      );
    });

    it('vertical with click', () => {
      const items = [
        {
          label: 'submenu1',
          key: '1',
          children: [
            {
              label: 'Option 1',
              key: 'submenu1',
            },
            {
              label: 'Option 2',
              key: 'submenu2',
            },
          ],
        },
        {
          label: 'menu2',
          key: '2',
        },
      ];
      const defaultProps = { mode: 'vertical', triggerSubMenuAction: 'click' };
      const Demo = () => <Menu {...defaultProps} items={items} />;

      const instance = render(<Demo />);

      expectSubMenuBehavior(
        defaultProps,
        instance,
        () => toggleMenu(instance, 0, 'click'),
        () => toggleMenu(instance, 0, 'click'),
      );
    });

    it('horizontal with hover(default)', () => {
      const items = [
        {
          label: 'submenu1',
          key: '1',
          children: [
            {
              label: 'Option 1',
              key: 'submenu1',
            },
            {
              label: 'Option 2',
              key: 'submenu2',
            },
          ],
        },
        {
          label: 'menu2',
          key: '2',
        },
      ];
      const defaultProps = { mode: 'horizontal' };
      const Demo = () => <Menu {...defaultProps} items={items} />;

      const instance = render(<Demo />);

      expectSubMenuBehavior(
        defaultProps,
        instance,
        () => toggleMenu(instance, 0, 'mouseEnter'),
        () => toggleMenu(instance, 0, 'mouseLeave'),
      );
    });

    it('horizontal with click', () => {
      const items = [
        {
          label: 'submenu1',
          key: '1',
          children: [
            {
              label: 'Option 1',
              key: 'submenu1',
            },
            {
              label: 'Option 2',
              key: 'submenu2',
            },
          ],
        },
        {
          label: 'menu2',
          key: '2',
        },
      ];
      const defaultProps = { mode: 'horizontal', triggerSubMenuAction: 'click' };
      const Demo = () => <Menu {...defaultProps} items={items} />;

      const instance = render(<Demo />);

      expectSubMenuBehavior(
        defaultProps,
        instance,
        () => toggleMenu(instance, 0, 'click'),
        () => toggleMenu(instance, 0, 'click'),
      );
    });
  });

  it('inline title', () => {
    const items = [
      {
        key: '1',
        label: 'bamboo lucky',
        icon: <PieChartOutlined />,
      },
    ];
    const { container } = render(<Menu mode="inline" inlineCollapsed items={items} />);
    fireEvent.mouseEnter(container.querySelector('.ant-menu-item'));
    triggerAllTimer();

    const text = container.querySelector('.ant-tooltip-inner').textContent;
    expect(text).toBe('bamboo lucky');
  });

  it('render correctly when using with Layout.Sider', () => {
    const items = [
      {
        label: 'User',
        key: 'sub1',
        icon: <UserOutlined />,
        children: [
          {
            label: 'Tom',
            key: '3',
          },
          {
            label: 'Bill',
            key: '4',
          },
          {
            label: 'Alex',
            key: '5',
          },
        ],
      },
    ];
    class Demo extends React.Component {
      state = {
        collapsed: false,
      };

      onCollapse = collapsed => this.setState({ collapsed });

      render() {
        const { collapsed } = this.state;
        return (
          <Layout style={{ minHeight: '100vh' }}>
            <Layout.Sider collapsible collapsed={collapsed} onCollapse={this.onCollapse}>
              <div className="logo" />
              <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} />
            </Layout.Sider>
          </Layout>
        );
      }
    }
    const { container } = render(<Demo />);
    expect(container.querySelector('.ant-menu')).toHaveClass('ant-menu-inline');
    fireEvent.click(container.querySelector('.ant-menu-submenu-title'));
    fireEvent.click(container.querySelector('.ant-layout-sider-trigger'));
    triggerAllTimer();
    expect(container.querySelector('.ant-menu')).toHaveClass('ant-menu-inline-collapsed');
    fireEvent.mouseEnter(container.querySelector('.ant-menu'));
    expect(container.querySelector('.ant-menu')).not.toHaveClass('ant-menu-inline');
    expect(container.querySelector('.ant-menu')).toHaveClass('ant-menu-vertical');
  });

  it('onMouseEnter should work', () => {
    const items = [
      {
        label: 'Navigation One',
        key: 'test1',
      },
      {
        label: 'Navigation Two',
        key: 'test2',
      },
    ];
    const onMouseEnter = jest.fn();
    const { container } = render(
      <Menu onMouseEnter={onMouseEnter} defaultSelectedKeys={['test1']} items={items} />,
    );
    fireEvent.mouseEnter(container.querySelector('ul.ant-menu-root'));
    expect(onMouseEnter).toHaveBeenCalled();
  });

  it('MenuItem should not render Tooltip when inlineCollapsed is false', () => {
    const items = [
      {
        label: 'Navigation One',
        key: 'mail',
      },
      {
        label: 'Navigation Two',
        key: 'app',
      },
      {
        label: (
          <a href="https://ant.design" target="_blank" rel="noopener noreferrer">
            Navigation Four - Link
          </a>
        ),
        key: 'alipay',
      },
    ];

    const { container } = render(
      <Menu
        defaultSelectedKeys={['mail']}
        defaultOpenKeys={['mail']}
        mode="horizontal"
        items={items}
      />,
      { attachTo: div },
    );

    fireEvent.mouseEnter(container.querySelector('li.ant-menu-item'));

    act(() => {
      jest.runAllTimers();
    });

    expect(container.querySelectorAll('.ant-tooltip-inner')).toHaveLength(0);
  });

  it('MenuItem should render icon and icon should be the first child when icon exists', () => {
    const items = [
      {
        key: 'mail',
        icon: <MailOutlined />,
        label: 'Navigation One',
      },
    ];
    const { container } = render(<Menu items={items} />);
    expect(container.querySelector('.ant-menu-item .anticon')).toHaveClass('anticon-mail');
  });

  it('should controlled collapse work', () => {
    const items = [
      {
        key: '1',
        icon: <PieChartOutlined />,
        label: 'Option 1',
      },
    ];
    const { asFragment, rerender } = render(<Menu mode="inline" items={items} />);
    expect(asFragment().firstChild).toMatchSnapshot();
    rerender(<Menu mode="inline" inlineCollapsed items={items} />);
    expect(asFragment().firstChild).toMatchSnapshot();
  });

  it('not title if not collapsed', () => {
    const items = [
      {
        key: '1',
        icon: <PieChartOutlined />,
        label: 'Option 1',
      },
    ];
    jest.useFakeTimers();
    const { container } = render(<Menu mode="inline" inlineCollapsed={false} items={items} />);
    fireEvent.mouseEnter(container.querySelector('.ant-menu-item'));
    act(() => {
      jest.runAllTimers();
    });
    expect(container.querySelectorAll('.ant-tooltip-inner').length).toBeFalsy();
    jest.useRealTimers();
  });

  it('props#onOpen and props#onClose do not warn anymore', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const onOpen = jest.fn();
    const onClose = jest.fn();
    render(
      <Menu
        defaultOpenKeys={['1']}
        mode="inline"
        onOpen={onOpen}
        onClose={onClose}
        items={[
          {
            key: '1',
            label: 'submenu1',
            children: [
              { key: 'submenu1', label: 'Option 1' },
              { key: 'submenu2', label: 'Option 2' },
            ],
          },
          { key: '2', label: 'menu2' },
        ]}
      />,
    );

    expect(errorSpy.mock.calls.length).toBe(1);
    expect(errorSpy.mock.calls[0][0]).not.toContain(
      '`onOpen` and `onClose` are removed, please use `onOpenChange` instead, see: https://u.ant.design/menu-on-open-change.',
    );
    expect(onOpen).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  // https://github.com/ant-design/ant-design/issues/18825
  // https://github.com/ant-design/ant-design/issues/8587
  it('should keep selectedKeys in state when collapsed to 0px', () => {
    const items = [
      {
        key: '1',
        label: 'Option 1',
      },
      {
        key: '2',
        label: 'Option 2',
      },
      {
        key: '3',
        label: 'Option 3',
        children: [
          {
            key: '4',
            label: 'Option 4',
          },
        ],
      },
    ];
    jest.useFakeTimers();
    const { container, rerender } = render(
      <Menu
        mode="inline"
        inlineCollapsed={false}
        defaultSelectedKeys={['1']}
        collapsedWidth={0}
        openKeys={['3']}
        items={items}
      />,
    );
    expect(container.querySelector('li.ant-menu-item-selected').textContent).toBe('Option 1');
    fireEvent.click(container.querySelectorAll('li.ant-menu-item')[1]);
    expect(container.querySelector('li.ant-menu-item-selected').textContent).toBe('Option 2');
    rerender(
      <Menu
        mode="inline"
        inlineCollapsed
        defaultSelectedKeys={['1']}
        collapsedWidth={0}
        openKeys={['3']}
        items={items}
      />,
    );
    act(() => {
      jest.runAllTimers();
    });
    expect(container.querySelectorAll('.ant-menu-submenu-hidden').length).toBe(0);
    rerender(
      <Menu
        mode="inline"
        inlineCollapsed={false}
        defaultSelectedKeys={['1']}
        collapsedWidth={0}
        openKeys={['3']}
        items={items}
      />,
    );
    expect(container.querySelector('.ant-menu-item-selected').textContent).toBe('Option 2');
    act(() => {
      jest.useRealTimers();
    });
  });

  it('Menu.Item with icon children auto wrap span', () => {
    const items = [
      {
        key: '1',
        label: 'Navigation One',
        icon: <MailOutlined />,
      },
      {
        key: '2',
        label: <span>Navigation One</span>,
        icon: <MailOutlined />,
      },
      {
        key: '3',
        label: 'Navigation One',
        icon: <MailOutlined />,
        children: [],
      },
      {
        key: '4',
        label: <span>Navigation One</span>,
        icon: <MailOutlined />,
        children: [],
      },
    ];
    const { asFragment } = render(<Menu items={items} />);
    expect(asFragment().firstChild).toMatchSnapshot();
  });

  // https://github.com/ant-design/ant-design/issues/23755
  it('should trigger onOpenChange when collapse inline menu', () => {
    const items = [
      {
        key: '1',
        label: 'menu',
        children: [
          {
            key: '1-1',
            label: 'menu',
          },
          {
            key: '1-2',
            label: 'menu',
          },
        ],
      },
    ];
    const onOpenChange = jest.fn();
    function App() {
      const [inlineCollapsed, setInlineCollapsed] = useState(false);
      return (
        <>
          <button
            type="button"
            onClick={() => {
              setInlineCollapsed(!inlineCollapsed);
            }}
          >
            collapse menu
          </button>
          <Menu
            mode="inline"
            onOpenChange={onOpenChange}
            inlineCollapsed={inlineCollapsed}
            items={items}
          />
        </>
      );
    }
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('button'));
    expect(onOpenChange).toHaveBeenCalledWith([]);
  });

  it('Use first char as Icon when collapsed', () => {
    const items = [
      {
        label: 'Light',
        children: [],
      },
      {
        label: 'Bamboo',
      },
    ];
    const { container } = render(<Menu mode="inline" inlineCollapsed items={items} />);

    expect(container.querySelector('.ant-menu-inline-collapsed-noicon').textContent).toEqual('L');
    const len = container.querySelectorAll('.ant-menu-inline-collapsed-noicon').length;
    expect(
      container.querySelectorAll('.ant-menu-inline-collapsed-noicon')[len - 1].textContent,
    ).toEqual('B');
  });

  it('divider should show', () => {
    const items = [
      {
        key: 'sub1',
        label: 'Navigation One',
        children: [
          {
            key: '1',
            label: 'Option 1',
          },
        ],
      },
      {
        type: 'divider',
        dashed: true,
      },
      {
        key: 'sub2',
        label: 'Navigation Two',
        children: [
          {
            key: '2',
            label: 'Option 2',
          },
        ],
      },
      {
        type: 'divider',
      },
      {
        key: 'sub3',
        label: 'Navigation Three',
        children: [
          {
            key: '3',
            label: 'Option 3',
          },
        ],
      },
    ];
    const { container } = render(<Menu mode="vertical" items={items} />);

    expect(container.querySelectorAll('li.ant-menu-item-divider')).toHaveLength(2);
    expect(container.querySelectorAll('li.ant-menu-item-divider-dashed')).toHaveLength(1);
  });

  it('should support ref', async () => {
    const items = [
      {
        key: '1',
        label: 'Option 1',
      },
    ];
    const ref = React.createRef();
    const { container } = render(<Menu ref={ref} items={items} />);
    expect(ref.current?.menu?.list).toBe(container.querySelector('ul'));
    ref.current?.focus();
    expect(document.activeElement).toBe(container.querySelector('li'));
  });

  it('expandIcon', () => {
    const items = [
      {
        key: '1',
        label: 'submenu1',
        children: [
          {
            key: 'submenu1',
            label: 'Option 1',
          },
        ],
      },
    ];
    const { container } = render(
      <Menu
        defaultOpenKeys={['1']}
        mode="inline"
        expandIcon={() => <span className="bamboo" />}
        items={items}
      />,
    );

    expect(container.querySelector('.bamboo')).toBeTruthy();
  });

  it('all types must be available in the "items" syntax', () => {
    const { asFragment } = render(
      <Menu
        mode="inline"
        defaultOpenKeys={['submenu', 'group-submenu']}
        items={[
          {
            key: 'submenu',
            label: 'Submenu',
            children: [
              { key: 'submenu-item1', label: 'SubmenuItem 1' },
              { key: 'submenu-item2', label: 'SubmenuItem 2' },
            ],
          },
          { key: 'divider', type: 'divider' },
          {
            key: 'group',
            type: 'group',
            label: 'Group',
            children: [
              {
                key: 'group-item',
                label: 'GroupItem',
              },
              { key: 'group-divider', type: 'divider' },
              {
                key: 'group-submenu',
                label: 'GroupSubmenu',
                children: [
                  { key: 'group-submenu-item1', label: 'GroupSubmenuItem 1' },
                  { key: 'group-submenu-item2', label: 'GroupSubmenuItem 2' },
                ],
              },
            ],
          },
        ]}
      />,
    );
    expect(asFragment().firstChild).toMatchSnapshot();
  });

  it('should not warning deprecated message when items={undefined}', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<Menu items={undefined} />);
    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('`children` will be removed in next major version'),
    );
    errorSpy.mockRestore();
  });
});
