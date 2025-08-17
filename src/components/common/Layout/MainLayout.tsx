'use client';

import React, { useState } from 'react';
import { Layout, Menu, Button, Typography, Space } from 'antd';
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
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          borderRight: '1px solid #404040',
        }}
      >
        <div
          style={{
            padding: '16px',
            textAlign: 'center',
            borderBottom: '1px solid #404040',
          }}
        >
          <Title
            level={4}
            style={{
              color: '#8b5cf6',
              margin: 0,
              fontSize: collapsed ? '14px' : '18px',
            }}
          >
            {collapsed ? 'C' : 'Cardano'}
          </Title>
        </div>

        <Menu
          mode='inline'
          selectedKeys={pathname ? [pathname] : []}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            border: 'none',
          }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: '0 16px',
            borderBottom: '1px solid #404040',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Space>
            <Button
              type='text'
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />

            <Title level={4} style={{ margin: 0 }}>
              카르다노 dApp
            </Title>
          </Space>

          <Space>
            {/* 지갑 연결 상태 표시 영역 */}
            <Button type='primary' icon={<WalletOutlined />} size='large'>
              지갑 연결
            </Button>
          </Space>
        </Header>

        <Content
          style={{
            margin: '16px',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #404040',
            overflow: 'auto',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
