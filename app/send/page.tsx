'use client';

import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Typography,
  Space,
  Alert,
  Row,
  Col,
  InputNumber,
  App,
  message,
} from 'antd';
import {
  SendOutlined,
  WalletOutlined,
  DisconnectOutlined,
} from '@ant-design/icons';
import { Card, Button, Modal, MainLayout } from '../../src/components/common';
import { useWallet } from '../../src/hooks/useWallet';
import { SendService, SendTransactionParams } from '../../src/services/send';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function SendPage() {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formData, setFormData] = useState<SendTransactionParams | null>(null);
  const [estimatedFee, setEstimatedFee] = useState(0.17);

  // 지갑 연결 상태
  const {
    isConnected,
    balance,
    walletInstance,
    connectWallet,
    getAvailableWallets,
  } = useWallet();

  // 수수료 추정 업데이트
  useEffect(() => {
    const amount = form.getFieldValue('amount');
    const memo = form.getFieldValue('memo');
    if (amount > 0) {
      const fee = SendService.estimateFee(amount, !!memo);
      setEstimatedFee(fee);
    }
  }, [form]);

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

  const handleFormSubmit = async (values: {
    recipientAddress: string;
    amount: number;
    memo?: string;
  }) => {
    // 주소 유효성 검증
    const isValidAddress = await SendService.validateAddress(
      values.recipientAddress
    );
    if (!isValidAddress) {
      message.error('올바른 Cardano 주소를 입력해주세요');
      return;
    }

    setFormData({
      recipientAddress: values.recipientAddress,
      amount: Number(values.amount),
      memo: values.memo,
    });
    setShowConfirmModal(true);
  };

  const handleConfirmSend = async () => {
    if (!walletInstance || !formData) {
      message.error('지갑이 연결되지 않았거나 송금 정보가 없습니다');
      return;
    }

    setIsLoading(true);

    try {
      // 실제 송금 진행
      const result = await SendService.sendTransaction(
        walletInstance,
        formData
      );

      message.success({
        content: (
          <div>
            <div>송금이 완료되었습니다!</div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              트랜잭션 해시: {result.txHash.substring(0, 20)}...
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              수수료: {result.fee} ADA
            </div>
          </div>
        ),
        duration: 10,
      });

      setShowConfirmModal(false);
      form.resetFields();
      setFormData(null);

      // 송금 완료 후 페이지 새로고침 (잔액 및 거래내역 업데이트)
      setTimeout(() => {
        window.location.reload();
      }, 3000); // 3초 후 새로고침 (성공 메시지 확인 시간)
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const setMaxAmount = () => {
    if (!balance) return;
    const maxAmount = parseFloat(balance) - estimatedFee;
    if (maxAmount > 0) {
      form.setFieldsValue({ amount: maxAmount });
    }
  };

  // 지갑 연결 상태에 따른 폼 초기화
  useEffect(() => {
    if (!isConnected) {
      form.resetFields();
      setFormData(null);
      setShowConfirmModal(false);
    }
  }, [isConnected, form]);

  return (
    <App>
      <MainLayout>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Title
            level={2}
            style={{ textAlign: 'center', marginBottom: '32px' }}
          >
            <SendOutlined /> ADA 송금
          </Title>

          {/* 지갑이 연결되지 않은 경우 */}
          {!isConnected && (
            <Row
              justify='center'
              style={{ minHeight: '50vh', alignItems: 'center' }}
            >
              <Col xs={24} sm={20} md={16}>
                <Card style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <DisconnectOutlined
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
                    ADA를 송금하려면 먼저 지갑을 연결해야 합니다.
                  </Text>
                  <Button onClick={handleConnectWallet}>지갑 연결하기</Button>
                </Card>
              </Col>
            </Row>
          )}

          {/* 지갑이 연결된 경우 */}
          {isConnected && (
            <>
              {/* 지갑 정보 카드 */}
              <Card style={{ marginBottom: '24px' }}>
                <Row gutter={16} align='middle'>
                  <Col span={12}>
                    <Space direction='vertical'>
                      <Text type='secondary'>현재 잔액</Text>
                      <Title level={3} style={{ margin: 0, color: '#10b981' }}>
                        {balance ? parseFloat(balance).toFixed(6) : '0.000000'}{' '}
                        ADA
                      </Title>
                    </Space>
                  </Col>
                  <Col span={12} style={{ textAlign: 'right' }}>
                    <WalletOutlined
                      style={{ fontSize: '32px', color: '#8b5cf6' }}
                    />
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
                    name='recipientAddress'
                    rules={[
                      {
                        required: true,
                        message: '수신자 주소를 입력해주세요!',
                      },
                      {
                        min: 50,
                        message: '올바른 카르다노 주소를 입력해주세요!',
                      },
                    ]}
                  >
                    <Input
                      placeholder='addr_test1q... 또는 addr1q...'
                      size='large'
                    />
                  </Form.Item>

                  <Form.Item
                    label='송금 금액 (ADA)'
                    name='amount'
                    rules={[
                      {
                        required: true,
                        message: '송금할 금액을 입력해주세요!',
                      },
                      {
                        validator: (_, value) => {
                          const currentBalance = balance
                            ? parseFloat(balance)
                            : 0;
                          if (value && value > currentBalance - estimatedFee) {
                            return Promise.reject('잔액이 부족합니다!');
                          }
                          if (value && value < 1) {
                            return Promise.reject(
                              '최소 1 ADA 이상 송금해야 합니다!'
                            );
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
                          max={balance ? parseFloat(balance) - estimatedFee : 0}
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
                    message={`예상 수수료: ~${estimatedFee.toFixed(6)} ADA`}
                    description='실제 수수료는 트랜잭션 크기에 따라 달라질 수 있습니다. 메모가 있으면 수수료가 약간 증가합니다.'
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
                <Alert
                  message='실제 송금 기능 활성화'
                  description='이제 실제 Cardano 블록체인으로 송금이 진행됩니다. 테스트넷이므로 실제 가치는 없지만 신중하게 진행해주세요.'
                  type='info'
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
                <ul style={{ margin: 0 }}>
                  <li>
                    <strong>송금 후에는 취소할 수 없습니다.</strong>
                  </li>
                  <li>수신자 주소를 정확히 확인해주세요.</li>
                  <li>
                    테스트넷에서는 실제 가치가 없는 테스트 ADA를 사용합니다.
                  </li>
                  <li>메모는 블록체인에 영구적으로 기록됩니다.</li>
                  <li>트랜잭션 서명 시 지갑에서 최종 확인됩니다.</li>
                  <li>수수료는 자동으로 계산되어 차감됩니다.</li>
                </ul>
              </Card>

              {/* 확인 모달 */}
              <Modal
                variant='confirm'
                title='송금 확인'
                open={showConfirmModal}
                onOk={handleConfirmSend}
                onCancel={() => setShowConfirmModal(false)}
                okText='송금 실행'
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
                            {formData.recipientAddress?.slice(0, 20)}...
                            {formData.recipientAddress?.slice(-10)}
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
                            {Number(formData.amount).toFixed(6)} ADA
                          </Text>
                        </Col>
                      </Row>

                      <Row style={{ marginBottom: '8px' }}>
                        <Col span={8}>
                          <Text strong>수수료:</Text>
                        </Col>
                        <Col span={16}>
                          <Text>~{estimatedFee.toFixed(6)} ADA</Text>
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
                            {(Number(formData.amount) + estimatedFee).toFixed(
                              6
                            )}{' '}
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
            </>
          )}
        </div>
      </MainLayout>
    </App>
  );
}
