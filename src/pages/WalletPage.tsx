'use client';

import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Space,
  Alert,
  Tag,
  Statistic,
} from 'antd';
import {
  WalletOutlined,
  DisconnectOutlined,
  CopyOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import MainLayout from '../components/common/Layout/MainLayout';

const { Title, Text, Paragraph } = Typography;

export default function WalletPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  // 가상의 지갑 데이터
  const walletData = {
    address:
      'addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj0vs2qd4a5cpjgkgsrq4n4v',
    balance: '125.450000',
    networkId: 0,
    network: 'Preview Testnet',
  };

  const availableWallets = [
    { name: 'Nami', icon: '🦎', installed: true },
    { name: 'Eternl', icon: '♾️', installed: true },
    { name: 'Lace', icon: '🃏', installed: false },
  ];

  const handleConnect = async (walletName: string) => {
    setIsConnecting(true);
    setSelectedWallet(walletName);

    // 가상의 연결 프로세스
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
    }, 2000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setSelectedWallet(null);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletData.address);
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
          <WalletOutlined /> 지갑 관리
        </Title>

        {!isConnected ? (
          // 지갑 연결 화면
          <>
            <Alert
              message='지갑 연결이 필요합니다'
              description='카르다노 dApp을 사용하기 위해서는 지갑을 연결해야 합니다. 아래에서 사용 가능한 지갑을 선택해주세요.'
              type='info'
              showIcon
              style={{ marginBottom: '24px' }}
            />

            <Card title='사용 가능한 지갑' style={{ marginBottom: '24px' }}>
              <Row gutter={[16, 16]}>
                {availableWallets.map(wallet => (
                  <Col xs={24} sm={8} key={wallet.name}>
                    <Card
                      hoverable={wallet.installed}
                      style={{
                        textAlign: 'center',
                        opacity: wallet.installed ? 1 : 0.6,
                        cursor: wallet.installed ? 'pointer' : 'not-allowed',
                      }}
                      onClick={() =>
                        wallet.installed && handleConnect(wallet.name)
                      }
                    >
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                        {wallet.icon}
                      </div>
                      <Title level={4}>{wallet.name}</Title>
                      {wallet.installed ? (
                        <Tag color='green'>설치됨</Tag>
                      ) : (
                        <Tag color='red'>미설치</Tag>
                      )}
                      {isConnecting && selectedWallet === wallet.name && (
                        <div style={{ marginTop: '16px' }}>
                          <Button loading>연결 중...</Button>
                        </div>
                      )}
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>

            <Card title='지갑 설치 가이드'>
              <Paragraph>
                <Text strong>지갑이 설치되지 않은 경우:</Text>
              </Paragraph>
              <ul>
                <li>
                  <a
                    href='https://namiwallet.io'
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{ color: '#8b5cf6' }}
                  >
                    Nami Wallet
                  </a>{' '}
                  - 가장 인기있는 카르다노 지갑
                </li>
                <li>
                  <a
                    href='https://eternl.io'
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{ color: '#8b5cf6' }}
                  >
                    Eternl Wallet
                  </a>{' '}
                  - 고급 기능을 제공하는 지갑
                </li>
                <li>
                  <a
                    href='https://www.lace.io'
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{ color: '#8b5cf6' }}
                  >
                    Lace Wallet
                  </a>{' '}
                  - IOG에서 개발한 공식 지갑
                </li>
              </ul>
            </Card>
          </>
        ) : (
          // 지갑 연결됨 화면
          <>
            <Alert
              message='지갑이 성공적으로 연결되었습니다!'
              description={`${selectedWallet} 지갑이 연결되어 있습니다.`}
              type='success'
              showIcon
              style={{ marginBottom: '24px' }}
            />

            {/* 지갑 정보 카드 */}
            <Card
              title={
                <Space>
                  <CheckCircleOutlined style={{ color: '#10b981' }} />
                  연결된 지갑: {selectedWallet}
                </Space>
              }
              extra={
                <Button
                  danger
                  icon={<DisconnectOutlined />}
                  onClick={handleDisconnect}
                >
                  연결 해제
                </Button>
              }
              style={{ marginBottom: '24px' }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Card size='small'>
                    <Statistic
                      title='ADA 잔액'
                      value={walletData.balance}
                      suffix='ADA'
                      precision={6}
                      valueStyle={{ color: '#10b981' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card size='small'>
                    <Statistic
                      title='네트워크'
                      value={walletData.network}
                      valueStyle={{ color: '#8b5cf6' }}
                    />
                  </Card>
                </Col>
              </Row>
            </Card>

            {/* 지갑 주소 카드 */}
            <Card title='지갑 주소' style={{ marginBottom: '24px' }}>
              <Space direction='vertical' style={{ width: '100%' }}>
                <Text
                  code
                  style={{
                    wordBreak: 'break-all',
                    fontSize: '12px',
                    padding: '8px',
                    borderRadius: '4px',
                    display: 'block',
                  }}
                >
                  {walletData.address}
                </Text>
                <Button
                  icon={<CopyOutlined />}
                  onClick={copyAddress}
                  style={{ width: '100%' }}
                >
                  주소 복사
                </Button>
              </Space>
            </Card>

            {/* 빠른 액션 */}
            <Card title='빠른 액션'>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Button
                    type='primary'
                    size='large'
                    style={{ width: '100%', height: '60px' }}
                    href='/send'
                  >
                    ADA 송금
                  </Button>
                </Col>
                <Col xs={24} sm={8}>
                  <Button
                    size='large'
                    style={{ width: '100%', height: '60px' }}
                    href='/history'
                  >
                    거래 내역
                  </Button>
                </Col>
                <Col xs={24} sm={8}>
                  <Button
                    icon={<ReloadOutlined />}
                    size='large'
                    style={{ width: '100%', height: '60px' }}
                  >
                    잔액 새로고침
                  </Button>
                </Col>
              </Row>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
}
