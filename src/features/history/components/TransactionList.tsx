import React from 'react';
import { Table, Empty } from 'antd';
import { Transaction } from '../types/transactionTypes';
import { TransactionCard } from './TransactionCard';

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  hasMore: boolean;
  onCopyHash: (hash: string) => void;
  onCopyAddress: (address: string) => void;
  onViewExplorer: (hash: string) => void;
  onViewAddressExplorer: (address: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  loading,
  onCopyHash,
  onCopyAddress,
  onViewExplorer,
  onViewAddressExplorer,
}) => {
  const columns = [
    {
      title: '유형',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => (
        <span className={type === 'sent' ? 'amountNegative' : 'amountPositive'}>
          {type === 'sent' ? '송금' : '수신'}
        </span>
      ),
    },
    {
      title: '금액',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: string, record: Transaction) => (
        <span
          className={
            record.type === 'sent' ? 'amountNegative' : 'amountPositive'
          }
        >
          {record.type === 'sent' ? '-' : '+'}
          {amount} ADA
        </span>
      ),
    },
    {
      title: '주소',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
      render: (address: string) => (
        <span className='hashText'>
          {address.slice(0, 15)}...{address.slice(-15)}
        </span>
      ),
    },
    {
      title: '시간',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 160,
      render: (timestamp: number) => {
        try {
          const date = new Date(timestamp * 1000);

          if (isNaN(date.getTime())) {
            return 'N/A';
          }

          return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          });
        } catch {
          return 'N/A';
        }
      },
    },
    {
      title: '수수료',
      dataIndex: 'fee',
      key: 'fee',
      width: 100,
      render: (fee: string) => `${fee} ADA`,
    },
  ];

  return (
    <>
      {transactions.length === 0 && !loading ? (
        <Empty
          description='거래내역이 없습니다'
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Table
          columns={columns}
          dataSource={transactions.map((tx, index) => ({
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
              <TransactionCard
                transaction={record}
                onCopyHash={onCopyHash}
                onCopyAddress={onCopyAddress}
                onViewExplorer={onViewExplorer}
                onViewAddressExplorer={onViewAddressExplorer}
              />
            ),
            rowExpandable: () => true,
          }}
        />
      )}
    </>
  );
};
