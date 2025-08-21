'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Typography, Space, Row, Col, Alert, App } from 'antd';
import {
  HistoryOutlined,
  ReloadOutlined,
  WalletOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Card, Button, MainLayout } from '../../components/common';
import { TransactionList } from './TransactionList';
import { TransactionFilter } from './TransactionFilter';
import { useWallet } from '../../hooks/useWallet';
import {
  useTransaction,
  useTransactionStats,
} from '../../hooks/useTransaction';
import { TransactionFilter as TransactionFilterType } from '../../types/transaction';
import { formatSmartADA } from '../../utils/cardano';

const { Title, Text } = Typography;

export default function HistoryPage() {
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'sent' | 'received'>(
    'all'
  );

  // App context에서 message 가져오기
  const { message } = App.useApp();

  // 지갑 연결
  const { isConnected, address, connectWallet, getAvailableWallets } =
    useWallet();

  // 거래내역 조회
  const {
    transactions,
    loading,
    error,
    hasMore,
    refreshTransactions,
    applyFilter,
    clearError,
    getExplorerUrl,
    getAddressExplorerUrl,
  } = useTransaction(address, { pageSize: 20 });

  // 거래내역 통계
  const stats = useTransactionStats(transactions);

  const copyToClipboardHandler = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('클립보드에 복사되었습니다');
  };

  const viewExplorerHandler = (hash: string) => {
    const url = getExplorerUrl(hash);
    window.open(url, '_blank');
  };

  const viewAddressExplorerHandler = (addr: string) => {
    const url = getAddressExplorerUrl(addr);
    window.open(url, '_blank');
  };

  // 필터 적용
  useEffect(() => {
    const filter: TransactionFilterType = {};

    if (filterType !== 'all') {
      filter.type = filterType;
    }

    applyFilter(filter);
  }, [filterType, applyFilter]);

  // 검색된 거래내역
  const filteredTransactions = useMemo(() => {
    if (!searchText) return transactions;

    const searchLower = searchText.toLowerCase();
    return transactions.filter(
      tx =>
        tx.hash.toLowerCase().includes(searchLower) ||
        tx.address.toLowerCase().includes(searchLower) ||
        (tx.memo && tx.memo.toLowerCase().includes(searchLower))
    );
  }, [transactions, searchText]);

  const connectWalletHandler = async () => {
    const wallets = getAvailableWallets();
    const availableWallet = wallets.find(w => w.isInstalled);

    if (availableWallet) {
      try {
        await connectWallet(availableWallet.key);
        message.success('지갑이 연결되었습니다');
      } catch {
        message.error('지갑 연결에 실패했습니다');
      }
    } else {
      message.warning('설치된 지갑이 없습니다. Lace 지갑을 설치해주세요.');
    }
  };

  // 지갑이 연결되지 않은 경우
  if (!isConnected) {
    return (
      <MainLayout>
        <div style={{ padding: '24px' }}>
          <Row
            justify='center'
            style={{ minHeight: '60vh', alignItems: 'center' }}
          >
            <Col xs={24} sm={16} md={12} lg={8}>
              <Card style={{ textAlign: 'center', padding: '40px 20px' }}>
                <WalletOutlined
                  style={{
                    fontSize: '64px',
                    color: '#faad14',
                    marginBottom: '24px',
                  }}
                />
                <Title level={3} style={{ marginBottom: '16px' }}>
                  지갑을 연결해주세요
                </Title>
                <Text
                  style={{
                    marginBottom: '24px',
                    display: 'block',
                    color: '#8c8c8c',
                  }}
                >
                  거래내역을 조회하려면 먼저 지갑을 연결해야 합니다.
                </Text>
                <Button onClick={connectWalletHandler}>지갑 연결하기</Button>
              </Card>
            </Col>
          </Row>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        {/* 페이지 헤더 */}
        <Card style={{ marginBottom: '24px' }}>
          <Row align='middle' justify='space-between'>
            <Col>
              <Space align='center'>
                <HistoryOutlined
                  style={{ fontSize: '24px', color: '#faad14' }}
                />
                <Title level={2} style={{ margin: 0 }}>
                  거래 내역
                </Title>
              </Space>
            </Col>
            <Col>
              <Button
                variant='secondary'
                icon={<ReloadOutlined />}
                loading={loading}
                onClick={refreshTransactions}
              >
                새로고침
              </Button>
            </Col>
          </Row>
        </Card>

        {/* 통계 카드 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6} xl={6}>
            <Card
              style={{
                height: '120px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
              }}
              styles={{
                body: {
                  padding: '16px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                },
              }}
            >
              <div style={{ textAlign: 'center', color: 'white' }}>
                <div
                  style={{
                    fontSize: '12px',
                    opacity: 0.9,
                    marginBottom: '6px',
                  }}
                >
                  총 거래
                </div>
                <div
                  style={{
                    fontSize: 'clamp(20px, 4vw, 28px)',
                    fontWeight: 'bold',
                    lineHeight: 1,
                  }}
                >
                  {stats.totalTransactions}
                  <span
                    style={{
                      fontSize: 'clamp(12px, 2.5vw, 16px)',
                      marginLeft: '4px',
                      opacity: 0.8,
                    }}
                  >
                    건
                  </span>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6} xl={6}>
            <Card
              style={{
                height: '120px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none',
                borderRadius: '12px',
              }}
              styles={{
                body: {
                  padding: '16px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                },
              }}
            >
              <div style={{ textAlign: 'center', color: 'white' }}>
                <div
                  style={{
                    fontSize: '12px',
                    opacity: 0.9,
                    marginBottom: '6px',
                  }}
                >
                  총 송금
                </div>
                <div
                  style={{
                    fontSize: 'clamp(16px, 3.5vw, 24px)',
                    fontWeight: 'bold',
                    lineHeight: 1,
                  }}
                >
                  {formatSmartADA(stats.totalSent)}
                  <span
                    style={{
                      fontSize: 'clamp(10px, 2vw, 14px)',
                      marginLeft: '4px',
                      opacity: 0.8,
                    }}
                  >
                    ADA
                  </span>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6} xl={6}>
            <Card
              style={{
                height: '120px',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                border: 'none',
                borderRadius: '12px',
              }}
              styles={{
                body: {
                  padding: '16px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                },
              }}
            >
              <div style={{ textAlign: 'center', color: 'white' }}>
                <div
                  style={{
                    fontSize: '12px',
                    opacity: 0.9,
                    marginBottom: '6px',
                  }}
                >
                  총 수신
                </div>
                <div
                  style={{
                    fontSize: 'clamp(16px, 3.5vw, 24px)',
                    fontWeight: 'bold',
                    lineHeight: 1,
                  }}
                >
                  {formatSmartADA(stats.totalReceived)}
                  <span
                    style={{
                      fontSize: 'clamp(10px, 2vw, 14px)',
                      marginLeft: '4px',
                      opacity: 0.8,
                    }}
                  >
                    ADA
                  </span>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6} xl={6}>
            <Card
              style={{
                height: '120px',
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                border: 'none',
                borderRadius: '12px',
              }}
              styles={{
                body: {
                  padding: '16px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                },
              }}
            >
              <div style={{ textAlign: 'center', color: 'white' }}>
                <div
                  style={{
                    fontSize: '12px',
                    opacity: 0.9,
                    marginBottom: '6px',
                  }}
                >
                  총 수수료
                </div>
                <div
                  style={{
                    fontSize: 'clamp(16px, 3.5vw, 24px)',
                    fontWeight: 'bold',
                    lineHeight: 1,
                  }}
                >
                  {formatSmartADA(stats.totalFees)}
                  <span
                    style={{
                      fontSize: 'clamp(10px, 2vw, 14px)',
                      marginLeft: '4px',
                      opacity: 0.8,
                    }}
                  >
                    ADA
                  </span>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 에러 알림 */}
        {error && (
          <Alert
            message='거래내역 조회 오류'
            description={error}
            type='error'
            showIcon
            closable
            onClose={clearError}
            style={{ marginBottom: '24px' }}
            icon={<ExclamationCircleOutlined />}
          />
        )}

        {/* 필터 */}
        <Card style={{ marginBottom: '16px' }}>
          <TransactionFilter
            searchText={searchText}
            filterType={filterType}
            totalCount={filteredTransactions.length}
            onSearchChange={setSearchText}
            onFilterChange={setFilterType}
          />
        </Card>

        {/* 거래 내역 리스트 */}
        <Card style={{ marginBottom: '24px' }}>
          <TransactionList
            transactions={filteredTransactions}
            loading={loading}
            hasMore={hasMore}
            onCopyHash={copyToClipboardHandler}
            onCopyAddress={copyToClipboardHandler}
            onViewExplorer={viewExplorerHandler}
            onViewAddressExplorer={viewAddressExplorerHandler}
          />
        </Card>
      </div>
    </MainLayout>
  );
}
