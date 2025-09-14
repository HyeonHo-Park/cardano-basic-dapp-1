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
      <div className='wallet-connect-container'>
        <Card
          variant={wallet.isInstalled ? 'interactive' : 'default'}
          className={`wallet-connect-card ${!wallet.isInstalled ? 'wallet-card-disabled' : ''}`}
          onClick={() => wallet.isInstalled && onConnect(wallet.key)}
        >
          <Space
            direction='vertical'
            size='large'
            className='wallet-connect-space'
          >
            <div className='wallet-connect-icon'>{wallet.icon}</div>

            <Title level={3} className='wallet-connect-title'>
              {wallet.name}
            </Title>

            <div>
              {wallet.isInstalled ? (
                <Tag className='wallet-status-installed'>설치됨</Tag>
              ) : (
                <Tag className='wallet-status-not-installed'>미설치</Tag>
              )}
            </div>

            <p className='wallet-connect-description'>{wallet.description}</p>

            {isConnecting && connectingWallet === wallet.key ? (
              <Button
                loading
                variant='primary'
                size='large'
                className='wallet-connect-button'
              >
                연결 중...
              </Button>
            ) : wallet.isInstalled ? (
              <Button
                variant='primary'
                size='large'
                className='wallet-connect-button'
                disabled={isConnecting}
              >
                Lace 지갑 연결하기
              </Button>
            ) : (
              <Button
                variant='secondary'
                size='large'
                className='wallet-connect-button'
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
