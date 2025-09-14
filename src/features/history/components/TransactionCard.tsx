import React from 'react';
import { Typography, Space, Row, Col, Button, Tooltip } from 'antd';
import { CopyOutlined, EyeOutlined, LinkOutlined } from '@ant-design/icons';
import { Transaction } from '../types/transactionTypes';

const { Text } = Typography;

interface TransactionCardProps {
  transaction: Transaction;
  onCopyHash: (hash: string) => void;
  onCopyAddress: (address: string) => void;
  onViewExplorer: (hash: string) => void;
  onViewAddressExplorer: (address: string) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onCopyHash,
  onViewExplorer,
  onViewAddressExplorer,
}) => {
  // 타임스탬프 처리 함수
  const formatTimestamp = (timestamp: number) => {
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
  };

  return (
    <div className='transactionCard'>
      <Row gutter={[16, 12]}>
        <Col span={24}>
          <Text strong className='cardTitle'>
            트랜잭션 해시:
          </Text>
          <br />
          <Space>
            <Text code className='transaction-card-hash'>
              {transaction.hash}
            </Text>
            <Tooltip title='클립보드에 복사'>
              <Button
                type='text'
                size='small'
                icon={<CopyOutlined />}
                onClick={() => onCopyHash(transaction.hash)}
                className='transaction-card-copy-button'
              />
            </Tooltip>
          </Space>
        </Col>
        <Col span={12}>
          <Text strong className='transaction-card-label'>
            블록 높이:
          </Text>{' '}
          <Text className='transaction-card-value'>
            {transaction.block || 'N/A'}
          </Text>
        </Col>
        <Col span={12}>
          <Text strong className='transaction-card-label'>
            확인 수:
          </Text>{' '}
          <Text className='transaction-card-value'>
            {transaction.confirmations || 'N/A'}
          </Text>
        </Col>
        <Col span={24}>
          <Text strong className='transaction-card-label'>
            거래 시간:
          </Text>{' '}
          <Text className='transaction-card-value'>
            {formatTimestamp(transaction.timestamp)}
          </Text>
        </Col>
        {transaction.memo && (
          <Col span={24}>
            <Text strong className='transaction-card-label'>
              메모:
            </Text>{' '}
            <Text className='transaction-card-value'>{transaction.memo}</Text>
          </Col>
        )}
        <Col span={24}>
          <Space>
            <Button
              size='small'
              icon={<EyeOutlined />}
              onClick={() => onViewExplorer(transaction.hash)}
              className='transaction-card-explorer-button'
            >
              탐색기에서 보기
            </Button>
            <Button
              size='small'
              icon={<LinkOutlined />}
              onClick={() => onViewAddressExplorer(transaction.address)}
              className='transaction-card-address-button'
            >
              주소 보기
            </Button>
          </Space>
        </Col>
      </Row>
    </div>
  );
};
