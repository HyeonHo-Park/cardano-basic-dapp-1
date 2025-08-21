import React from 'react';
import { Typography, Space, Row, Col, Button, Tooltip } from 'antd';
import { CopyOutlined, EyeOutlined, LinkOutlined } from '@ant-design/icons';
import { Transaction } from '../../types/transaction';

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
    <div
      style={{
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
      }}
    >
      <Row gutter={[16, 12]}>
        <Col span={24}>
          <Text strong style={{ color: '#343a40' }}>
            트랜잭션 해시:
          </Text>
          <br />
          <Space>
            <Text
              code
              style={{
                fontSize: '12px',
                wordBreak: 'break-all',
                backgroundColor: '#ffffff',
                color: '#495057',
                border: '1px solid #dee2e6',
                padding: '4px 8px',
                borderRadius: '4px',
              }}
            >
              {transaction.hash}
            </Text>
            <Tooltip title='클립보드에 복사'>
              <Button
                type='text'
                size='small'
                icon={<CopyOutlined />}
                onClick={() => onCopyHash(transaction.hash)}
                style={{ color: '#6c757d' }}
              />
            </Tooltip>
          </Space>
        </Col>
        <Col span={12}>
          <Text strong style={{ color: '#343a40' }}>
            블록 높이:
          </Text>{' '}
          <Text style={{ color: '#6c757d' }}>{transaction.block || 'N/A'}</Text>
        </Col>
        <Col span={12}>
          <Text strong style={{ color: '#343a40' }}>
            확인 수:
          </Text>{' '}
          <Text style={{ color: '#6c757d' }}>
            {transaction.confirmations || 'N/A'}
          </Text>
        </Col>
        <Col span={24}>
          <Text strong style={{ color: '#343a40' }}>
            거래 시간:
          </Text>{' '}
          <Text style={{ color: '#6c757d' }}>
            {formatTimestamp(transaction.timestamp)}
          </Text>
        </Col>
        {transaction.memo && (
          <Col span={24}>
            <Text strong style={{ color: '#343a40' }}>
              메모:
            </Text>{' '}
            <Text style={{ color: '#6c757d' }}>{transaction.memo}</Text>
          </Col>
        )}
        <Col span={24}>
          <Space>
            <Button
              size='small'
              icon={<EyeOutlined />}
              onClick={() => onViewExplorer(transaction.hash)}
              style={{
                backgroundColor: '#007bff',
                color: '#ffffff',
                border: 'none',
              }}
            >
              탐색기에서 보기
            </Button>
            <Button
              size='small'
              icon={<LinkOutlined />}
              onClick={() => onViewAddressExplorer(transaction.address)}
              style={{
                backgroundColor: '#6c757d',
                color: '#ffffff',
                border: 'none',
              }}
            >
              주소 보기
            </Button>
          </Space>
        </Col>
      </Row>
    </div>
  );
};
