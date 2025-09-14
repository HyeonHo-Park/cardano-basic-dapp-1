'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Typography, Space, Row, Col, Alert, App } from 'antd';
import {
  HistoryOutlined,
  ReloadOutlined,
  WalletOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Card, Button, MainLayout } from '../../../shared/components';
import { TransactionList } from '../components/TransactionList';
import { TransactionFilter } from '../components/TransactionFilter';
import { useWallet } from '../../wallet/hooks/useWallet';
import { useTransaction, useTransactionStats } from '../hooks/useTransaction';
import { TransactionFilter as TransactionFilterType } from '../types/transactionTypes';
import { formatSmartADA } from '../../../shared/utils/cardano';

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
        <div className='history-container'>
          <Row justify='center' className='history-connectSection'>
            <Col xs={24} sm={16} md={12} lg={8}>
              <Card className='history-connectCard'>
                <WalletOutlined className='history-connectIcon' />
                <Title level={3} className='history-connectTitle'>
                  지갑을 연결해주세요
                </Title>
                <Text className='history-connectDescription'>
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
      <div className='history-container'>
        {/* 페이지 헤더 */}
        <Card className='history-headerCard'>
          <Row align='middle' justify='space-between'>
            <Col>
              <Space align='center'>
                <HistoryOutlined className='history-headerIcon' />
                <Title level={2} className='history-headerTitle'>
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
        <Row gutter={[16, 16]} className='history-statsRow'>
          <Col xs={24} sm={12} md={6} xl={6}>
            <Card
              className='history-statCard statCardTotal'
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
              <div className='history-statContent'>
                <div className='history-statLabel'>총 거래</div>
                <div className='history-statValue'>
                  {stats.totalTransactions}
                  <span className='history-statUnit'>건</span>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6} xl={6}>
            <Card
              className='history-statCard statCardSent'
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
              <div className='history-statContent'>
                <div className='history-statLabel'>총 송금</div>
                <div className='history-statValueMedium'>
                  {formatSmartADA(stats.totalSent)}
                  <span className='history-statUnitSmall'>ADA</span>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6} xl={6}>
            <Card
              className='history-statCard statCardReceived'
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
              <div className='history-statContent'>
                <div className='history-statLabel'>총 수신</div>
                <div className='history-statValueMedium'>
                  {formatSmartADA(stats.totalReceived)}
                  <span className='history-statUnitSmall'>ADA</span>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6} xl={6}>
            <Card
              className='history-statCard statCardFees'
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
              <div className='history-statContent'>
                <div className='history-statLabel'>총 수수료</div>
                <div className='history-statValueMedium'>
                  {formatSmartADA(stats.totalFees)}
                  <span className='history-statUnitSmall'>ADA</span>
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
            className='history-errorAlert'
            icon={<ExclamationCircleOutlined />}
          />
        )}

        {/* 필터 */}
        <Card className='history-filterCard'>
          <TransactionFilter
            searchText={searchText}
            filterType={filterType}
            totalCount={filteredTransactions.length}
            onSearchChange={setSearchText}
            onFilterChange={setFilterType}
          />
        </Card>

        {/* 거래 내역 리스트 */}
        <Card className='history-listCard'>
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
