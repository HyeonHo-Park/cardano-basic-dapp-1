import React, { useState, useEffect } from 'react';
import { Row, Col, Space, Typography, Statistic } from 'antd';
import {
  CheckCircleOutlined,
  DisconnectOutlined,
  CopyOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Card, Button } from '../../../shared/components';
import { CURRENT_NETWORK } from '../../../shared/utils/constants';
import { formatAddressForAPI } from '../../../shared/utils/cardano';

const { Text } = Typography;

interface WalletInfoProps {
  walletName: string;
  address: string;
  balance: string;
  networkId: number;
  onDisconnect: () => void;
  onCopyAddress: () => void;
  onRefreshBalance: () => void;
  isRefreshing?: boolean;
}

export const WalletInfo: React.FC<WalletInfoProps> = ({
  walletName,
  address,
  balance,
  onDisconnect,
  onCopyAddress,
  onRefreshBalance,
  isRefreshing = false,
}) => {
  const [displayAddress, setDisplayAddress] = useState(address);
  const [isConverting, setIsConverting] = useState(false);

  // 주소 변환
  useEffect(() => {
    const convertAddress = async () => {
      if (!address) return;

      setIsConverting(true);
      try {
        const formattedAddress = await formatAddressForAPI(address);
        setDisplayAddress(formattedAddress);
      } catch (error) {
        console.error('주소 변환 실패:', error);
        setDisplayAddress(address); // 변환 실패 시 원본 주소 사용
      } finally {
        setIsConverting(false);
      }
    };

    convertAddress();
  }, [address]);

  return (
    <Space direction='vertical' className='wallet-info-container' size='large'>
      {/* 지갑 정보 헤더 */}
      <Card
        className='wallet-info-header-card'
        title={
          <Space>
            <CheckCircleOutlined className='wallet-info-status-icon' />
            연결된 지갑: {walletName}
          </Space>
        }
        extra={
          <Button
            className='wallet-info-disconnect-button'
            variant='danger'
            icon={<DisconnectOutlined />}
            onClick={onDisconnect}
          >
            연결 해제
          </Button>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Card
              className='wallet-info-stat-card'
              variant='default'
              padding='small'
            >
              <Statistic
                title='ADA 잔액'
                value={balance}
                suffix='ADA'
                precision={6}
                className='wallet-info-balance-value'
              />
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card
              className='wallet-info-stat-card'
              variant='default'
              padding='small'
            >
              <Statistic
                title='네트워크'
                value={CURRENT_NETWORK.displayName}
                className='wallet-info-network-value'
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 지갑 주소 */}
      <Card className='wallet-info-address-card' title='지갑 주소'>
        <Space direction='vertical' className='wallet-info-space-full'>
          <Text code className='wallet-info-address-code'>
            {isConverting ? '주소 변환 중...' : displayAddress}
          </Text>
          <Text className='wallet-info-address-type'>
            {displayAddress.startsWith('addr') ? 'Bech32 형식' : '16진수 형식'}
          </Text>
          <Button
            className='wallet-info-copy-button'
            variant='secondary'
            icon={<CopyOutlined />}
            onClick={onCopyAddress}
            disabled={isConverting}
          >
            주소 복사
          </Button>
        </Space>
      </Card>

      {/* 빠른 액션 */}
      <Card className='wallet-info-actions-card' title='빠른 액션'>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Button
              className='wallet-info-action-button wallet-info-action-button-primary'
              variant='primary'
              size='large'
              href='/send'
            >
              ADA 송금
            </Button>
          </Col>
          <Col xs={24} sm={8}>
            <Button
              className='wallet-info-action-button wallet-info-action-button-primary'
              variant='primary'
              size='large'
              href='/history'
            >
              거래 내역
            </Button>
          </Col>
          <Col xs={24} sm={8}>
            <Button
              className='wallet-info-action-button wallet-info-action-button-primary'
              variant='primary'
              icon={<ReloadOutlined />}
              size='large'
              onClick={onRefreshBalance}
              loading={isRefreshing}
            >
              잔액 새로고침
            </Button>
          </Col>
        </Row>
      </Card>
    </Space>
  );
};
