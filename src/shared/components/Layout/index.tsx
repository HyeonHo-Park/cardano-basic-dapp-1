'use client';

import React, { useState } from 'react';
import { Layout, Menu, Button, Typography, Space, App } from 'antd';
import {
  WalletOutlined,
  SendOutlined,
  HistoryOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '홈',
    },
    {
      key: '/wallet',
      icon: <WalletOutlined />,
      label: '지갑 관리',
    },
    {
      key: '/send',
      icon: <SendOutlined />,
      label: 'ADA 송금',
    },
    {
      key: '/history',
      icon: <HistoryOutlined />,
      label: '거래 내역',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
  };

  return (
    <App>
      <Layout className='layout'>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          className='sider'
        >
          <div className='logoSection'>
            <Title
              level={4}
              className={`logoTitle ${collapsed ? 'logoTitleCollapsed' : 'logoTitleExpanded'}`}
            >
              {collapsed ? 'C' : 'Cardano'}
            </Title>
          </div>

          <Menu
            mode='inline'
            selectedKeys={pathname ? [pathname] : []}
            items={menuItems}
            onClick={handleMenuClick}
            className='menu'
          />
        </Sider>

        <Layout>
          <Header className='header'>
            <Space>
              <Button
                type='text'
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className='menuButton'
              />

              <Title level={4} className='headerTitle'>
                Cardano dApp Basic - 1
              </Title>
            </Space>
          </Header>

          <Content className='content'>{children}</Content>
        </Layout>
      </Layout>
    </App>
  );
}
