import React from 'react';
import { Row, Col, Input, Select, Typography } from 'antd';

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

interface TransactionFilterProps {
  searchText: string;
  filterType: 'all' | 'sent' | 'received';
  totalCount: number;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: 'all' | 'sent' | 'received') => void;
}

export const TransactionFilter: React.FC<TransactionFilterProps> = ({
  searchText,
  filterType,
  totalCount,
  onSearchChange,
  onFilterChange,
}) => {
  return (
    <Row gutter={[16, 16]} align='middle' style={{ marginBottom: '16px' }}>
      <Col xs={24} sm={12} md={8}>
        <Search
          placeholder='거래 해시, 주소 또는 메모로 검색'
          value={searchText}
          onChange={e => onSearchChange(e.target.value)}
          allowClear
        />
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Select
          value={filterType}
          onChange={onFilterChange}
          style={{ width: '100%' }}
          placeholder='거래 유형 선택'
        >
          <Option value='all'>전체</Option>
          <Option value='sent'>송금</Option>
          <Option value='received'>수신</Option>
        </Select>
      </Col>
      <Col xs={24} sm={24} md={8} style={{ textAlign: 'right' }}>
        <Text style={{ color: '#8c8c8c' }}>총 {totalCount}건 중 표시</Text>
      </Col>
    </Row>
  );
};
