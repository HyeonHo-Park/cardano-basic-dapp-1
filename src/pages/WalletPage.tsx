'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Alert, notification } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import { MainLayout } from '../components/common';
import { WalletConnect } from '../components/wallet/WalletConnect';
import { WalletInfo } from '../components/wallet/WalletInfo';
import { useWallet } from '../hooks/useWallet';

const { Title } = Typography;

export default function WalletPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

  const {
    isConnected,
    isConnecting,
    connectedWallet,
    address,
    balance,
    networkId,
    error,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    getAvailableWallets,
    clearError,
  } = useWallet();

  // 클라이언트 마운트 감지
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const availableWallets = getAvailableWallets();

  const handleConnect = async (walletKey: string) => {
    setConnectingWallet(walletKey);
    clearError();

    try {
      await connectWallet(walletKey);
      notification.success({
        message: '지갑 연결 성공',
        description: '지갑이 성공적으로 연결되었습니다!',
        placement: 'topRight',
      });
    } catch (error) {
      notification.error({
        message: '지갑 연결 실패',
        description:
          error instanceof Error ? error.message : '지갑 연결에 실패했습니다',
        placement: 'topRight',
      });
    } finally {
      setConnectingWallet(null);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    notification.success({
      message: '지갑 연결 해제',
      description: '지갑 연결이 해제되었습니다',
      placement: 'topRight',
    });
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      notification.success({
        message: '주소 복사 완료',
        description: '주소가 클립보드에 복사되었습니다',
        placement: 'topRight',
      });
    }
  };

  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    try {
      await refreshBalance();
      notification.success({
        message: '잔액 새로고침 완료',
        description: '잔액이 새로고침되었습니다',
        placement: 'topRight',
      });
    } catch (error) {
      console.log('잔액 새로고침 실패: ', error);
      notification.error({
        message: '잔액 새로고침 실패',
        description: '잔액 새로고침에 실패했습니다',
        placement: 'topRight',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // SSR 중에는 기본 로딩 화면 표시
  if (!isMounted) {
    return (
      <MainLayout>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Title
            level={2}
            style={{ textAlign: 'center', marginBottom: '32px' }}
          >
            <WalletOutlined /> 지갑 관리
          </Title>
          <Alert
            message='지갑 정보를 불러오는 중...'
            type='info'
            showIcon
            style={{ marginBottom: '24px' }}
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
          <WalletOutlined /> 지갑 관리
        </Title>

        {/* 에러 알림 */}
        {error && (
          <Alert
            message='지갑 연결 오류'
            description={error}
            type='error'
            showIcon
            closable
            onClose={clearError}
            style={{ marginBottom: '24px' }}
          />
        )}

        {!isConnected ? (
          // 지갑 연결 화면
          <>
            <Alert
              message='Lace 지갑 연결이 필요합니다'
              description='카르다노 dApp을 사용하기 위해서는 Lace 지갑을 연결해야 합니다. IOG에서 개발한 공식 지갑입니다.'
              type='info'
              showIcon
              style={{ marginBottom: '24px' }}
            />

            <WalletConnect
              wallets={availableWallets}
              isConnecting={isConnecting}
              connectingWallet={connectingWallet}
              onConnect={handleConnect}
            />
          </>
        ) : (
          // 지갑 연결됨 화면
          <>
            <Alert
              message='지갑이 성공적으로 연결되었습니다!'
              description={`${connectedWallet} 지갑이 연결되어 있습니다.`}
              type='success'
              showIcon
              style={{ marginBottom: '24px' }}
            />

            <WalletInfo
              walletName={connectedWallet!}
              address={address!}
              balance={balance!}
              networkId={networkId!}
              onDisconnect={handleDisconnect}
              onCopyAddress={handleCopyAddress}
              onRefreshBalance={handleRefreshBalance}
              isRefreshing={isRefreshing}
            />
          </>
        )}
      </div>
    </MainLayout>
  );
}
