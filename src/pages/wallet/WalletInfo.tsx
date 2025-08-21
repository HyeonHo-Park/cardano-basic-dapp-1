import React, { useState, useEffect } from 'react';
import { Row, Col, Space, Typography, Statistic } from 'antd';
import {
  CheckCircleOutlined,
  DisconnectOutlined,
  CopyOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Card, Button } from '../../components/common';
import { CURRENT_NETWORK } from '../../utils/constants';
import { formatAddressForAPI } from '../../utils/cardano';

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
    <Space direction='vertical' style={{ width: '100%' }} size='large'>
      {/* 지갑 정보 헤더 */}
      <Card
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#10b981' }} />
            연결된 지갑: {walletName}
          </Space>
        }
        extra={
          <Button
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
            <Card variant='default' padding='small'>
              <Statistic
                title='ADA 잔액'
                value={balance}
                suffix='ADA'
                precision={6}
                valueStyle={{ color: '#10b981' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card variant='default' padding='small'>
              <Statistic
                title='네트워크'
                value={CURRENT_NETWORK.displayName}
                valueStyle={{ color: '#8b5cf6' }}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 지갑 주소 */}
      <Card title='지갑 주소'>
        <Space direction='vertical' style={{ width: '100%' }}>
          <Text
            code
            style={{
              wordBreak: 'break-all',
              fontSize: '12px',
              padding: '8px',
              borderRadius: '4px',
              display: 'block',
              backgroundColor: '#f5f5f5',
              color: '#1f2937',
              border: '1px solid #e5e7eb',
            }}
          >
            {isConverting ? '주소 변환 중...' : displayAddress}
          </Text>
          <Text style={{ fontSize: '11px', color: '#8c8c8c' }}>
            {displayAddress.startsWith('addr') ? 'Bech32 형식' : '16진수 형식'}
          </Text>
          <Button
            variant='secondary'
            icon={<CopyOutlined />}
            onClick={onCopyAddress}
            style={{ width: '100%' }}
            disabled={isConverting}
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
              variant='primary'
              size='large'
              style={{ width: '100%', height: '60px' }}
              href='/send'
            >
              ADA 송금
            </Button>
          </Col>
          <Col xs={24} sm={8}>
            <Button
              variant='secondary'
              size='large'
              style={{ width: '100%', height: '60px' }}
              href='/history'
            >
              거래 내역
            </Button>
          </Col>
          <Col xs={24} sm={8}>
            <Button
              variant='secondary'
              icon={<ReloadOutlined />}
              size='large'
              style={{ width: '100%', height: '60px' }}
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
