'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Alert, App } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import { MainLayout } from '../../../shared/components';
import { WalletConnect } from '../components/WalletConnect';
import { WalletInfo } from '../components/WalletInfo';
import { useWallet } from '../hooks/useWallet';
import { formatAddressForAPI } from '../../../shared/utils/cardano';

const { Title } = Typography;

export default function WalletPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

  // App context에서 message 가져오기
  const { message } = App.useApp();

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

  const connectWalletHandler = async (walletKey: string) => {
    setConnectingWallet(walletKey);
    clearError();

    try {
      await connectWallet(walletKey);
      message.success('지갑이 성공적으로 연결되었습니다!');
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : '지갑 연결에 실패했습니다'
      );
    } finally {
      setConnectingWallet(null);
    }
  };

  const disconnectWalletHandler = () => {
    disconnectWallet();
    message.success('지갑 연결이 해제되었습니다');
  };

  const copyAddressHandler = async () => {
    if (address) {
      try {
        const formattedAddress = await formatAddressForAPI(address);
        navigator.clipboard.writeText(formattedAddress);
        message.success('변환된 주소가 클립보드에 복사되었습니다');
      } catch {
        navigator.clipboard.writeText(address);
        message.success('주소가 클립보드에 복사되었습니다');
      }
    }
  };

  const refreshBalanceHandler = async () => {
    setIsRefreshing(true);
    try {
      await refreshBalance();
      message.success('잔액이 새로고침되었습니다');
    } catch (error) {
      console.log('잔액 새로고침 실패: ', error);
      message.error('잔액 새로고침에 실패했습니다');
    } finally {
      setIsRefreshing(false);
    }
  };

  // SSR 중에는 기본 로딩 화면 표시
  if (!isMounted) {
    return (
      <App>
        <MainLayout>
          <div className='container'>
            <Title level={2} className='pageTitle'>
              <WalletOutlined /> 지갑 관리
            </Title>
            <Alert
              message='지갑 정보를 불러오는 중...'
              type='info'
              showIcon
              className='connectSection'
            />
          </div>
        </MainLayout>
      </App>
    );
  }

  return (
    <App>
      <MainLayout>
        <div className='container'>
          <Title level={2} className='pageTitle'>
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
              className='connectSection'
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
                onConnect={connectWalletHandler}
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
                onDisconnect={disconnectWalletHandler}
                onCopyAddress={copyAddressHandler}
                onRefreshBalance={refreshBalanceHandler}
                isRefreshing={isRefreshing}
              />
            </>
          )}
        </div>
      </MainLayout>
    </App>
  );
}
