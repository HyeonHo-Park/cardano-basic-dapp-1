'use client';

import React, { useState } from 'react';
import {
  Card,
  Table,
  Typography,
  Space,
  Tag,
  Button,
  Row,
  Col,
  Input,
  Select,
  Tooltip,
} from 'antd';
import {
  HistoryOutlined,
  ExportOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import MainLayout from '../components/common/Layout/MainLayout';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function HistoryPage() {
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('all');

  // 가상의 거래 데이터
  const transactionData = [
    {
      key: '1',
      hash: 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890',
      type: 'sent',
      amount: -50.0,
      fee: 0.17,
      address:
        'addr_test1qp2fg2q3p4r5s6t7u8v9w0x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9',
      timestamp: '2024-01-15 14:30:25',
      status: 'confirmed',
      block: 125847,
      memo: '친구에게 송금',
    },
    {
      key: '2',
      hash: 'b2c3d4e5f6789012345678901234567890123456789012345678901234567890a1',
      type: 'received',
      amount: 100.0,
      fee: 0.0,
      address:
        'addr_test1qr3gh4r5s6t7u8v9w0x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9a0',
      timestamp: '2024-01-14 10:15:42',
      status: 'confirmed',
      block: 125632,
      memo: null,
    },
    {
      key: '3',
      hash: 'c3d4e5f6789012345678901234567890123456789012345678901234567890a1b2',
      type: 'sent',
      amount: -25.5,
      fee: 0.168,
      address:
        'addr_test1qs4hi5s6t7u8v9w0x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9a0b1',
      timestamp: '2024-01-13 16:45:18',
      status: 'confirmed',
      block: 125420,
      memo: 'dApp 테스트',
    },
    {
      key: '4',
      hash: 'd4e5f6789012345678901234567890123456789012345678901234567890a1b2c3',
      type: 'received',
      amount: 200.0,
      fee: 0.0,
      address:
        'addr_test1qt5ij6t7u8v9w0x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9a0b1c2',
      timestamp: '2024-01-12 09:20:33',
      status: 'confirmed',
      block: 125156,
      memo: null,
    },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const viewOnExplorer = (hash: string) => {
    window.open(`https://preview.cardanoscan.io/transaction/${hash}`, '_blank');
  };

  const columns = [
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'confirmed' ? 'green' : 'orange'}>
          {status === 'confirmed' ? '확인됨' : '대기중'}
        </Tag>
      ),
    },
    {
      title: '유형',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => (
        <Space>
          {type === 'sent' ? (
            <ArrowUpOutlined style={{ color: '#ef4444' }} />
          ) : (
            <ArrowDownOutlined style={{ color: '#10b981' }} />
          )}
          <Text>{type === 'sent' ? '송금' : '수신'}</Text>
        </Space>
      ),
    },
    {
      title: '금액 (ADA)',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: number) => (
        <Text
          style={{
            color: amount > 0 ? '#10b981' : '#ef4444',
            fontWeight: 'bold',
          }}
        >
          {amount > 0 ? '+' : ''}
          {amount.toFixed(6)}
        </Text>
      ),
    },
    {
      title: '수수료',
      dataIndex: 'fee',
      key: 'fee',
      width: 100,
      render: (fee: number) => <Text>{fee > 0 ? fee.toFixed(6) : '-'}</Text>,
    },
    {
      title: '상대방 주소',
      dataIndex: 'address',
      key: 'address',
      render: (address: string) => (
        <Space>
          <Text code style={{ fontSize: '12px' }}>
            {address.slice(0, 15)}...{address.slice(-10)}
          </Text>
          <Button
            type='text'
            size='small'
            icon={<CopyOutlined />}
            onClick={() => copyToClipboard(address)}
          />
        </Space>
      ),
    },
    {
      title: '시간',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (timestamp: string) => (
        <Text style={{ fontSize: '12px' }}>{timestamp}</Text>
      ),
    },
    {
      title: '액션',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: { hash: string }) => (
        <Space>
          <Tooltip title='블록 탐색기에서 보기'>
            <Button
              type='text'
              size='small'
              icon={<EyeOutlined />}
              onClick={() => viewOnExplorer(record.hash)}
            />
          </Tooltip>
          <Tooltip title='트랜잭션 해시 복사'>
            <Button
              type='text'
              size='small'
              icon={<CopyOutlined />}
              onClick={() => copyToClipboard(record.hash)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  const filteredData = transactionData.filter(item => {
    const matchesSearch =
      searchText === '' ||
      item.hash.toLowerCase().includes(searchText.toLowerCase()) ||
      item.address.toLowerCase().includes(searchText.toLowerCase()) ||
      (item.memo && item.memo.toLowerCase().includes(searchText.toLowerCase()));

    const matchesFilter = filterType === 'all' || item.type === filterType;

    return matchesSearch && matchesFilter;
  });

  return (
    <MainLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
          <HistoryOutlined /> 거래 내역
        </Title>

        {/* 통계 카드 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={8}>
            <Card>
              <Space
                direction='vertical'
                style={{ width: '100%', textAlign: 'center' }}
              >
                <Text type='secondary'>총 거래</Text>
                <Title level={3} style={{ margin: 0, color: '#8b5cf6' }}>
                  {transactionData.length}
                </Title>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Space
                direction='vertical'
                style={{ width: '100%', textAlign: 'center' }}
              >
                <Text type='secondary'>송금 총액</Text>
                <Title level={3} style={{ margin: 0, color: '#ff4d4f' }}>
                  {Math.abs(
                    transactionData
                      .filter(t => t.type === 'sent')
                      .reduce((sum, t) => sum + t.amount, 0)
                  ).toFixed(2)}{' '}
                  ADA
                </Title>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Space
                direction='vertical'
                style={{ width: '100%', textAlign: 'center' }}
              >
                <Text type='secondary'>수신 총액</Text>
                <Title level={3} style={{ margin: 0, color: '#10b981' }}>
                  {transactionData
                    .filter(t => t.type === 'received')
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toFixed(2)}{' '}
                  ADA
                </Title>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* 필터 및 검색 */}
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={[16, 16]} align='middle'>
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder='해시, 주소, 메모로 검색...'
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} sm={6} md={4}>
              <Select
                value={filterType}
                onChange={setFilterType}
                style={{ width: '100%' }}
              >
                <Option value='all'>전체</Option>
                <Option value='sent'>송금</Option>
                <Option value='received'>수신</Option>
              </Select>
            </Col>
            <Col xs={24} sm={6} md={4}>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={loading}
                style={{ width: '100%' }}
              >
                새로고침
              </Button>
            </Col>
            <Col xs={24} sm={12} md={8} style={{ textAlign: 'right' }}>
              <Space>
                <Button icon={<ExportOutlined />}>CSV 내보내기</Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 거래 테이블 */}
        <Card title={`거래 내역 (${filteredData.length}건)`}>
          <Table
            columns={columns}
            dataSource={filteredData}
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
                <div style={{ padding: '16px', borderRadius: '4px' }}>
                  <Row gutter={[16, 8]}>
                    <Col span={24}>
                      <Text strong>트랜잭션 해시:</Text>
                      <br />
                      <Text
                        code
                        style={{ fontSize: '12px', wordBreak: 'break-all' }}
                      >
                        {record.hash}
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text strong>블록 높이:</Text> {record.block}
                    </Col>
                    <Col span={12}>
                      <Text strong>확인 수:</Text> 1,247
                    </Col>
                    {record.memo && (
                      <Col span={24}>
                        <Text strong>메모:</Text> {record.memo}
                      </Col>
                    )}
                  </Row>
                </div>
              ),
              rowExpandable: () => true,
            }}
          />
        </Card>
      </div>
    </MainLayout>
  );
}
