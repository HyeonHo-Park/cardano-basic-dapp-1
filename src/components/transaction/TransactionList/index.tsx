'use client';

import React, { useState } from 'react';
import {
  List,
  Empty,
  Button,
  Space,
  Input,
  Select,
  Row,
  Col,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Transaction, TransactionFilter } from '../../../types/transaction';
import TransactionCard from '../TransactionCard';

const { Search } = Input;
const { Option } = Select;

interface TransactionListProps {
  transactions: Transaction[];
  loading?: boolean;
  error?: string | null;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  onFilter?: (filter: TransactionFilter) => void;
  showFilters?: boolean;
  showActions?: boolean;
  pageSize?: number;
}

export default function TransactionList({
  transactions,
  loading = false,
  error = null,
  hasMore = false,
  onLoadMore,
  onRefresh,
  onFilter,
  showFilters = true,
  showActions = true,
  pageSize = 10,
}: TransactionListProps) {
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'sent' | 'received'>(
    'all'
  );
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'confirmed' | 'pending' | 'failed'
  >('all');

  // 클립보드 복사
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('클립보드에 복사되었습니다');
  };

  // 블록체인 탐색기에서 보기
  const handleViewExplorer = (hash: string) => {
    const url = `https://preview.cardanoscan.io/transaction/${hash}`;
    window.open(url, '_blank');
  };

  // 주소를 탐색기에서 보기
  const handleViewAddress = (address: string) => {
    const url = `https://preview.cardanoscan.io/address/${address}`;
    window.open(url, '_blank');
  };

  // 필터가 변경될 때마다 적용
  React.useEffect(() => {
    if (onFilter) {
      const filter: TransactionFilter = {};

      if (filterType !== 'all') {
        filter.type = filterType;
      }

      if (filterStatus !== 'all') {
        filter.status = filterStatus;
      }

      onFilter(filter);
    }
  }, [filterType, filterStatus, onFilter]);

  // 검색된 거래내역
  const filteredTransactions = React.useMemo(() => {
    if (!searchText) return transactions;

    const searchLower = searchText.toLowerCase();
    return transactions.filter(
      tx =>
        tx.hash.toLowerCase().includes(searchLower) ||
        tx.address.toLowerCase().includes(searchLower) ||
        (tx.memo && tx.memo.toLowerCase().includes(searchLower))
    );
  }, [transactions, searchText]);

  return (
    <div>
      {/* 필터 섹션 */}
      {showFilters && (
        <div
          style={{
            marginBottom: '16px',
            padding: '16px',
            backgroundColor: '#fafafa',
            borderRadius: '8px',
          }}
        >
          <Row gutter={[16, 16]} align='middle'>
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder='거래 해시, 주소 또는 메모로 검색'
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
                enterButton={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} sm={6} md={4}>
              <Select
                value={filterType}
                onChange={setFilterType}
                style={{ width: '100%' }}
                placeholder='거래 유형'
              >
                <Option value='all'>전체</Option>
                <Option value='sent'>송금</Option>
                <Option value='received'>수신</Option>
              </Select>
            </Col>
            <Col xs={24} sm={6} md={4}>
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: '100%' }}
                placeholder='상태'
              >
                <Option value='all'>전체</Option>
                <Option value='confirmed'>확인됨</Option>
                <Option value='pending'>대기중</Option>
                <Option value='failed'>실패</Option>
              </Select>
            </Col>
            {onRefresh && (
              <Col xs={24} sm={24} md={8} style={{ textAlign: 'right' }}>
                <Space>
                  <span style={{ color: '#8c8c8c', fontSize: '14px' }}>
                    {filteredTransactions.length}건 표시
                  </span>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={onRefresh}
                    loading={loading}
                  >
                    새로고침
                  </Button>
                </Space>
              </Col>
            )}
          </Row>
        </div>
      )}

      {/* 에러 표시 */}
      {error && (
        <div
          style={{
            marginBottom: '16px',
            padding: '16px',
            backgroundColor: '#fff2f0',
            border: '1px solid #ffccc7',
            borderRadius: '8px',
          }}
        >
          <div style={{ color: '#ff4d4f', fontWeight: 'bold' }}>오류 발생</div>
          <div style={{ color: '#8c8c8c', fontSize: '14px', marginTop: '4px' }}>
            {error}
          </div>
        </div>
      )}

      {/* 거래 목록 */}
      {filteredTransactions.length === 0 && !loading ? (
        <Empty
          description='거래내역이 없습니다'
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ margin: '40px 0' }}
        />
      ) : (
        <List
          loading={loading}
          dataSource={filteredTransactions}
          renderItem={(transaction, index) => (
            <List.Item
              key={`${transaction.hash}-${index}`}
              style={{ padding: '8px 0' }}
            >
              <TransactionCard
                transaction={transaction}
                onCopy={showActions ? handleCopy : undefined}
                onViewExplorer={showActions ? handleViewExplorer : undefined}
                onViewAddress={showActions ? handleViewAddress : undefined}
                showActions={showActions}
              />
            </List.Item>
          )}
          pagination={{
            pageSize,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} / 총 ${total}건`,
          }}
        />
      )}

      {/* 더 많은 데이터 로드 */}
      {hasMore && onLoadMore && (
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Button loading={loading} onClick={onLoadMore} size='large'>
            더 많은 거래 보기
          </Button>
        </div>
      )}
    </div>
  );
}
