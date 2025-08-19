'use client';

import React from 'react';
import { Card, Space, Tag, Typography, Tooltip, Button } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  CopyOutlined,
  EyeOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { Transaction } from '../../../types/transaction';

const { Text } = Typography;

interface TransactionCardProps {
  transaction: Transaction;
  onCopy?: (text: string) => void;
  onViewExplorer?: (hash: string) => void;
  onViewAddress?: (address: string) => void;
  showActions?: boolean;
}

export default function TransactionCard({
  transaction,
  onCopy,
  onViewExplorer,
  onViewAddress,
  showActions = true,
}: TransactionCardProps) {
  const {
    hash,
    type,
    amount,
    fee,
    address,
    timestamp,
    status,
    block,
    memo,
    confirmations,
  } = transaction;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'green';
      case 'pending':
        return 'orange';
      case 'failed':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '확인됨';
      case 'pending':
        return '대기중';
      case 'failed':
        return '실패';
      default:
        return status;
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 12)}...${addr.substring(addr.length - 12)}`;
  };

  const formatHash = (hash: string) => {
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };

  return (
    <Card
      size='small'
      style={{
        borderLeft: `4px solid ${type === 'sent' ? '#ff4d4f' : '#52c41a'}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ flex: 1 }}>
          {/* 거래 유형과 금액 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <Tag
              color={type === 'sent' ? 'red' : 'green'}
              icon={
                type === 'sent' ? <ArrowUpOutlined /> : <ArrowDownOutlined />
              }
              style={{ marginRight: '12px' }}
            >
              {type === 'sent' ? '송금' : '수신'}
            </Tag>
            <Text
              strong
              style={{
                fontSize: '16px',
                color: amount < 0 ? '#ff4d4f' : '#52c41a',
              }}
            >
              {amount < 0 ? '' : '+'}
              {amount.toFixed(6)} ADA
            </Text>
          </div>

          {/* 거래 해시 */}
          <div style={{ marginBottom: '8px' }}>
            <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
              거래 해시:
            </Text>
            <br />
            <Space>
              <Text code style={{ fontSize: '12px' }}>
                {formatHash(hash)}
              </Text>
              {showActions && onCopy && (
                <Tooltip title='클립보드에 복사'>
                  <Button
                    type='text'
                    size='small'
                    icon={<CopyOutlined />}
                    onClick={() => onCopy(hash)}
                  />
                </Tooltip>
              )}
              {showActions && onViewExplorer && (
                <Tooltip title='블록체인 탐색기에서 보기'>
                  <Button
                    type='text'
                    size='small'
                    icon={<EyeOutlined />}
                    onClick={() => onViewExplorer(hash)}
                  />
                </Tooltip>
              )}
            </Space>
          </div>

          {/* 상대방 주소 */}
          <div style={{ marginBottom: '8px' }}>
            <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
              {type === 'sent' ? '받는 주소:' : '보낸 주소:'}
            </Text>
            <br />
            <Space>
              <Text code style={{ fontSize: '12px' }}>
                {formatAddress(address)}
              </Text>
              {showActions && onCopy && (
                <Tooltip title='클립보드에 복사'>
                  <Button
                    type='text'
                    size='small'
                    icon={<CopyOutlined />}
                    onClick={() => onCopy(address)}
                  />
                </Tooltip>
              )}
              {showActions && onViewAddress && (
                <Tooltip title='주소를 탐색기에서 보기'>
                  <Button
                    type='text'
                    size='small'
                    icon={<LinkOutlined />}
                    onClick={() => onViewAddress(address)}
                  />
                </Tooltip>
              )}
            </Space>
          </div>

          {/* 추가 정보 */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '8px',
            }}
          >
            <div>
              <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                수수료:
              </Text>
              <br />
              <Text style={{ fontSize: '12px' }}>{fee.toFixed(6)} ADA</Text>
            </div>
            <div>
              <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>시간:</Text>
              <br />
              <Text style={{ fontSize: '12px' }}>{timestamp}</Text>
            </div>
            {block && (
              <div>
                <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                  블록:
                </Text>
                <br />
                <Text style={{ fontSize: '12px' }}>{block}</Text>
              </div>
            )}
            {confirmations && (
              <div>
                <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                  확인:
                </Text>
                <br />
                <Text style={{ fontSize: '12px' }}>{confirmations}회</Text>
              </div>
            )}
          </div>

          {/* 메모 */}
          {memo && (
            <div style={{ marginBottom: '8px' }}>
              <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>메모:</Text>
              <br />
              <Text style={{ fontSize: '12px', fontStyle: 'italic' }}>
                {memo}
              </Text>
            </div>
          )}
        </div>

        {/* 상태 */}
        <div style={{ textAlign: 'right' }}>
          <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
        </div>
      </div>
    </Card>
  );
}
