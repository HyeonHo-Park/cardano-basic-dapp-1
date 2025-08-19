'use client';

import React, { useState } from 'react';
import {
  Form,
  Input,
  Typography,
  Space,
  Alert,
  Row,
  Col,
  InputNumber,
} from 'antd';
import { SendOutlined, WalletOutlined } from '@ant-design/icons';
import { Card, Button, Modal, MainLayout } from '../components/common';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function SendPage() {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formData, setFormData] = useState<{
    recipient: string;
    amount: number;
    memo?: string;
  } | null>(null);

  // 가상의 지갑 데이터
  const walletData = {
    balance: 125.45,
    address:
      'addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj0vs2qd4a5cpjgkgsrq4n4v',
  };

  const handleFormSubmit = (values: {
    recipient: string;
    amount: number;
    memo?: string;
  }) => {
    setFormData(values);
    setShowConfirmModal(true);
  };

  const handleConfirmSend = async () => {
    setIsLoading(true);

    // 가상의 송금 프로세스
    setTimeout(() => {
      setIsLoading(false);
      setShowConfirmModal(false);
      form.resetFields();
    }, 3000);
  };

  const calculateFee = (amount: number) => {
    return Math.max(0.17, amount * 0.001);
  };

  const setMaxAmount = () => {
    const maxAmount = walletData.balance - 0.17;
    form.setFieldsValue({ amount: maxAmount });
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
          <SendOutlined /> ADA 송금
        </Title>

        {/* 지갑 정보 카드 */}
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={16} align='middle'>
            <Col span={12}>
              <Space direction='vertical'>
                <Text type='secondary'>현재 잔액</Text>
                <Title level={3} style={{ margin: 0, color: '#10b981' }}>
                  {walletData.balance.toFixed(6)} ADA
                </Title>
              </Space>
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <WalletOutlined style={{ fontSize: '32px', color: '#8b5cf6' }} />
            </Col>
          </Row>
        </Card>

        {/* 송금 폼 */}
        <Card title='송금 정보 입력'>
          <Form
            form={form}
            layout='vertical'
            onFinish={handleFormSubmit}
            autoComplete='off'
          >
            <Form.Item
              label='수신자 주소'
              name='recipient'
              rules={[
                { required: true, message: '수신자 주소를 입력해주세요!' },
                { min: 50, message: '올바른 카르다노 주소를 입력해주세요!' },
              ]}
            >
              <Input placeholder='addr_test1q... 또는 addr1q...' size='large' />
            </Form.Item>

            <Form.Item
              label='송금 금액 (ADA)'
              name='amount'
              rules={[
                { required: true, message: '송금할 금액을 입력해주세요!' },
                {
                  validator: (_, value) => {
                    if (value && value > walletData.balance - 0.17) {
                      return Promise.reject('잔액이 부족합니다!');
                    }
                    if (value && value < 1) {
                      return Promise.reject('최소 1 ADA 이상 송금해야 합니다!');
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Row gutter={8}>
                <Col flex='auto'>
                  <InputNumber
                    placeholder='0.000000'
                    size='large'
                    style={{ width: '100%' }}
                    min={0}
                    max={walletData.balance - 0.17}
                    step={0.1}
                    precision={6}
                    stringMode
                  />
                </Col>
                <Col>
                  <Button variant='secondary' onClick={setMaxAmount}>
                    MAX
                  </Button>
                </Col>
              </Row>
            </Form.Item>

            <Form.Item label='메모 (선택사항)' name='memo'>
              <TextArea
                placeholder='거래에 대한 메모를 입력하세요 (블록체인에 기록됩니다)'
                rows={3}
                maxLength={100}
                showCount
              />
            </Form.Item>

            {/* 수수료 정보 */}
            <Alert
              message='예상 수수료: ~0.17 ADA'
              description='실제 수수료는 트랜잭션 크기에 따라 달라질 수 있습니다.'
              type='info'
              showIcon
              style={{ marginBottom: '24px' }}
            />

            <Form.Item>
              <Button
                variant='primary'
                htmlType='submit'
                size='large'
                style={{ width: '100%' }}
                icon={<SendOutlined />}
              >
                송금하기
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* 주의사항 */}
        <Card title='⚠️ 주의사항' size='small'>
          <ul style={{ margin: 0 }}>
            <li>송금 후에는 취소할 수 없습니다.</li>
            <li>수신자 주소를 정확히 확인해주세요.</li>
            <li>테스트넷에서는 실제 가치가 없는 테스트 ADA를 사용합니다.</li>
            <li>메모는 블록체인에 영구적으로 기록됩니다.</li>
          </ul>
        </Card>

        {/* 확인 모달 */}
        <Modal
          variant='confirm'
          title='송금 확인'
          open={showConfirmModal}
          onOk={handleConfirmSend}
          onCancel={() => setShowConfirmModal(false)}
          okText='확인 및 송금'
          cancelText='취소'
          confirmLoading={isLoading}
          width={500}
        >
          {formData && (
            <Space direction='vertical' style={{ width: '100%' }}>
              <Alert
                message='송금 정보를 다시 한 번 확인해주세요'
                type='warning'
                showIcon
              />

              <div style={{ padding: '16px 0' }}>
                <Row style={{ marginBottom: '8px' }}>
                  <Col span={8}>
                    <Text strong>수신자:</Text>
                  </Col>
                  <Col span={16}>
                    <Text code style={{ fontSize: '12px' }}>
                      {formData.recipient?.slice(0, 20)}...
                      {formData.recipient?.slice(-10)}
                    </Text>
                  </Col>
                </Row>

                <Row style={{ marginBottom: '8px' }}>
                  <Col span={8}>
                    <Text strong>금액:</Text>
                  </Col>
                  <Col span={16}>
                    <Text
                      style={{
                        color: '#10b981',
                        fontSize: '16px',
                        fontWeight: 'bold',
                      }}
                    >
                      {formData.amount} ADA
                    </Text>
                  </Col>
                </Row>

                <Row style={{ marginBottom: '8px' }}>
                  <Col span={8}>
                    <Text strong>수수료:</Text>
                  </Col>
                  <Col span={16}>
                    <Text>~{calculateFee(formData.amount).toFixed(6)} ADA</Text>
                  </Col>
                </Row>

                <Row style={{ marginBottom: '8px' }}>
                  <Col span={8}>
                    <Text strong>총 금액:</Text>
                  </Col>
                  <Col span={16}>
                    <Text
                      style={{
                        color: '#ff4d4f',
                        fontSize: '16px',
                        fontWeight: 'bold',
                      }}
                    >
                      {(
                        formData.amount + calculateFee(formData.amount)
                      ).toFixed(6)}{' '}
                      ADA
                    </Text>
                  </Col>
                </Row>

                {formData.memo && (
                  <Row>
                    <Col span={8}>
                      <Text strong>메모:</Text>
                    </Col>
                    <Col span={16}>
                      <Text>{formData.memo}</Text>
                    </Col>
                  </Row>
                )}
              </div>
            </Space>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
}
