import React from 'react';
import { Tag, Typography, Space } from 'antd';
import { Card, Button } from '../../../shared/components';

const { Title } = Typography;

interface WalletOption {
  name: string;
  key: string;
  icon: string;
  downloadUrl: string;
  description: string;
  isInstalled: boolean;
}

interface WalletConnectProps {
  wallets: WalletOption[];
  isConnecting: boolean;
  connectingWallet: string | null;
  onConnect: (walletKey: string) => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  wallets,
  isConnecting,
  connectingWallet,
  onConnect,
}) => {
  const wallet = wallets[0]; // Lace 지갑만 사용

  if (!wallet) {
    return null;
  }

  return (
    <Card title='Lace 지갑 연결' padding='large'>
      <div className='container'>
        <Card
          variant={wallet.isInstalled ? 'interactive' : 'default'}
          className='walletCard'
          style={{
            opacity: wallet.isInstalled ? 1 : 0.6,
            cursor: wallet.isInstalled ? 'pointer' : 'not-allowed',
          }}
          onClick={() => wallet.isInstalled && onConnect(wallet.key)}
        >
          <Space direction='vertical' size='large' className='walletSpace'>
            <div className='walletIcon'>{wallet.icon}</div>

            <Title level={3} className='walletTitle'>
              {wallet.name}
            </Title>

            <div>
              {wallet.isInstalled ? (
                <Tag color='green' className='statusBadgeInstalled'>
                  설치됨
                </Tag>
              ) : (
                <Tag color='red' className='statusBadgeInstalled'>
                  미설치
                </Tag>
              )}
            </div>

            <p
              style={{
                fontSize: '14px',
                color: '#666',
                margin: 0,
                lineHeight: '1.5',
              }}
            >
              {wallet.description}
            </p>

            {isConnecting && connectingWallet === wallet.key ? (
              <Button
                loading
                variant='primary'
                size='large'
                style={{ width: '100%' }}
              >
                연결 중...
              </Button>
            ) : wallet.isInstalled ? (
              <Button
                variant='primary'
                size='large'
                style={{ width: '100%' }}
                disabled={isConnecting}
              >
                Lace 지갑 연결하기
              </Button>
            ) : (
              <Button
                variant='secondary'
                size='large'
                style={{ width: '100%' }}
                onClick={e => {
                  e.stopPropagation();
                  window.open(wallet.downloadUrl, '_blank');
                }}
              >
                Lace 지갑 설치하기
              </Button>
            )}
          </Space>
        </Card>
      </div>
    </Card>
  );
};
