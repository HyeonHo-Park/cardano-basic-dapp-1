'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  Typography,
  Space,
  Tag,
  Row,
  Col,
  Input,
  Select,
  Tooltip,
  message,
  Alert,
  Empty,
  Button as AntButton,
} from 'antd';
import {
  HistoryOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeOutlined,
  CopyOutlined,
  WalletOutlined,
  ExclamationCircleOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { Card, Button, MainLayout } from '../components/common';
import { useWallet } from '../hooks/useWallet';
import { useTransaction, useTransactionStats } from '../hooks/useTransaction';
import { TransactionFilter } from '../types/transaction';
import { formatSmartADA } from '../utils/cardano';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function HistoryPage() {
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'sent' | 'received'>(
    'all'
  );

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
    loadMoreTransactions,
    applyFilter,
    clearError,
    getExplorerUrl,
    getAddressExplorerUrl,
  } = useTransaction(address, { pageSize: 20 });

  // 거래내역 통계
  const stats = useTransactionStats(transactions);

  // 유틸리티 함수들
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('클립보드에 복사되었습니다');
  };

  const viewOnExplorer = (hash: string) => {
    const url = getExplorerUrl(hash);
    window.open(url, '_blank');
  };

  const viewAddressOnExplorer = (addr: string) => {
    const url = getAddressExplorerUrl(addr);
    window.open(url, '_blank');
  };

  // 필터 적용
  useEffect(() => {
    const filter: TransactionFilter = {};

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

  // 지갑 연결 유도
  const handleConnectWallet = async () => {
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

  // 테이블 컬럼 정의
  const columns = [
    {
      title: '거래 해시',
      dataIndex: 'hash',
      key: 'hash',
      width: 120,
      render: (hash: string) => (
        <Space>
          <Text code style={{ fontSize: '12px' }}>
            {`${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`}
          </Text>
          <Tooltip title='클립보드에 복사'>
            <AntButton
              type='text'
              size='small'
              icon={<CopyOutlined />}
              onClick={() => copyToClipboard(hash)}
            />
          </Tooltip>
          <Tooltip title='블록체인 탐색기에서 보기'>
            <AntButton
              type='text'
              size='small'
              icon={<EyeOutlined />}
              onClick={() => viewOnExplorer(hash)}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: '유형',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => (
        <Tag
          color={type === 'sent' ? 'red' : 'green'}
          icon={type === 'sent' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
        >
          {type === 'sent' ? '송금' : '수신'}
        </Tag>
      ),
    },
    {
      title: '금액 (ADA)',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right' as const,
      render: (amount: number) => (
        <Text
          strong
          style={{
            color: amount < 0 ? '#ff4d4f' : '#52c41a',
          }}
        >
          {amount < 0 ? '' : '+'}
          {amount.toFixed(6)}
        </Text>
      ),
    },
    {
      title: '수수료 (ADA)',
      dataIndex: 'fee',
      key: 'fee',
      width: 100,
      align: 'right' as const,
      render: (fee: number) => (
        <Text style={{ color: '#8c8c8c' }}>{fee.toFixed(6)}</Text>
      ),
    },
    {
      title: '상대방 주소',
      dataIndex: 'address',
      key: 'address',
      width: 150,
      render: (address: string) => (
        <Space>
          <Text code style={{ fontSize: '12px' }}>
            {`${address.substring(0, 12)}...${address.substring(address.length - 12)}`}
          </Text>
          <Tooltip title='클립보드에 복사'>
            <AntButton
              type='text'
              size='small'
              icon={<CopyOutlined />}
              onClick={() => copyToClipboard(address)}
            />
          </Tooltip>
          <Tooltip title='주소를 탐색기에서 보기'>
            <AntButton
              type='text'
              size='small'
              icon={<LinkOutlined />}
              onClick={() => viewAddressOnExplorer(address)}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: '시간',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 140,
      render: (timestamp: string) => (
        <Text style={{ fontSize: '12px' }}>{timestamp}</Text>
      ),
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => {
        const statusConfig = {
          confirmed: { color: 'green', text: '확인됨' },
          pending: { color: 'orange', text: '대기중' },
          failed: { color: 'red', text: '실패' },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || {
          color: 'default',
          text: status,
        };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

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
                <Button onClick={handleConnectWallet}>지갑 연결하기</Button>
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
              bodyStyle={{
                padding: '16px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
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
              bodyStyle={{
                padding: '16px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
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
              bodyStyle={{
                padding: '16px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
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
              bodyStyle={{
                padding: '16px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
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

        {/* 필터 및 검색 */}
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={[16, 16]} align='middle'>
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder='거래 해시, 주소 또는 메모로 검색'
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                value={filterType}
                onChange={setFilterType}
                style={{ width: '100%' }}
                placeholder='거래 유형 선택'
              >
                <Option value='all'>전체</Option>
                <Option value='sent'>송금</Option>
                <Option value='received'>수신</Option>
              </Select>
            </Col>
            <Col xs={24} sm={24} md={8} style={{ textAlign: 'right' }}>
              <Text style={{ color: '#8c8c8c' }}>
                총 {filteredTransactions.length}건 중 표시
              </Text>
            </Col>
          </Row>
        </Card>

        {/* 거래 테이블 */}
        <Card title={`거래 내역 (${filteredTransactions.length}건)`}>
          {filteredTransactions.length === 0 && !loading ? (
            <Empty
              description='거래내역이 없습니다'
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredTransactions.map((tx, index) => ({
                ...tx,
                key: index,
              }))}
              loading={loading}
              scroll={{ x: 800 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} / 총 ${total}건`,
              }}
              expandable={{
                expandedRowRender: record => (
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: '#fafafa',
                      borderRadius: '4px',
                    }}
                  >
                    <Row gutter={[16, 8]}>
                      <Col span={24}>
                        <Text strong>트랜잭션 해시:</Text>
                        <br />
                        <Space>
                          <Text
                            code
                            style={{ fontSize: '12px', wordBreak: 'break-all' }}
                          >
                            {record.hash}
                          </Text>
                          <AntButton
                            type='text'
                            size='small'
                            icon={<CopyOutlined />}
                            onClick={() => copyToClipboard(record.hash)}
                          />
                        </Space>
                      </Col>
                      <Col span={12}>
                        <Text strong>블록 높이:</Text> {record.block || 'N/A'}
                      </Col>
                      <Col span={12}>
                        <Text strong>확인 수:</Text>{' '}
                        {record.confirmations || 'N/A'}
                      </Col>
                      {record.memo && (
                        <Col span={24}>
                          <Text strong>메모:</Text> {record.memo}
                        </Col>
                      )}
                      <Col span={24}>
                        <Space>
                          <AntButton
                            size='small'
                            icon={<EyeOutlined />}
                            onClick={() => viewOnExplorer(record.hash)}
                          >
                            탐색기에서 보기
                          </AntButton>
                          <AntButton
                            size='small'
                            icon={<LinkOutlined />}
                            onClick={() =>
                              viewAddressOnExplorer(record.address)
                            }
                          >
                            주소 보기
                          </AntButton>
                        </Space>
                      </Col>
                    </Row>
                  </div>
                ),
                rowExpandable: () => true,
              }}
            />
          )}

          {/* 더 많은 거래 로드 */}
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Button
                variant='secondary'
                loading={loading}
                onClick={loadMoreTransactions}
              >
                더 많은 거래 보기
              </Button>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
