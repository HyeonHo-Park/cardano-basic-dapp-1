'use client';

import React, { useState, useEffect } from 'react';
import { Form, Typography, Space, Alert, Row, Col, App } from 'antd';
import {
  SendOutlined,
  WalletOutlined,
  DisconnectOutlined,
} from '@ant-design/icons';
import { Card, Button, Modal, MainLayout } from '../../components/common';
import { useWallet } from '../../hooks/useWallet';
import { SendService, SendTransactionParams } from '../../services/send';
import { SendForm } from './SendForm';

const { Title, Text } = Typography;

export default function SendPage() {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formData, setFormData] = useState<SendTransactionParams | null>(null);
  const [estimatedFee, setEstimatedFee] = useState(0.17);

  // App context에서 message 가져오기
  const { message } = App.useApp();

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

  const connectWalletHandler = async () => {
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

  const submitFormHandler = async (values: {
    recipientAddress: string;
    amount: number;
    memo?: string | null;
  }) => {
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
      memo: values.memo || undefined,
    });
    setShowConfirmModal(true);
  };

  const confirmSendHandler = async () => {
    if (!walletInstance || !formData) {
      message.error('지갑이 연결되지 않았거나 송금 정보가 없습니다');
      return;
    }

    setIsLoading(true);

    try {
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

      setTimeout(() => {
        window.location.reload();
      }, 3000);
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

  const setMaxAmountHandler = () => {
    if (!balance) {
      message.warning(
        '잔액 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.'
      );
      return;
    }

    const currentBalance = parseFloat(balance);
    const maxAmount = currentBalance - estimatedFee;

    if (maxAmount <= 0) {
      message.warning(
        `잔액이 부족합니다. 현재 잔액: ${currentBalance.toFixed(6)} ADA, 예상 수수료: ${estimatedFee.toFixed(6)} ADA`
      );
      return;
    }

    if (maxAmount < 1) {
      message.warning('최소 1 ADA 이상 송금해야 합니다.');
      return;
    }

    // 소수점 6자리로 반올림
    const roundedMaxAmount = Math.floor(maxAmount * 1000000) / 1000000;

    try {
      // stringMode를 위해 문자열로 변환
      const amountString = roundedMaxAmount.toString();
      form.setFieldsValue({ amount: amountString });

      // Form validation 트리거
      form.validateFields(['amount']).catch(() => {
        // validation 에러는 무시 (UI에서 표시됨)
      });

      message.success(
        `최대 송금 가능 금액 ${roundedMaxAmount.toFixed(6)} ADA가 입력되었습니다.`
      );
    } catch (error) {
      console.error('Form 값 설정 중 에러:', error);
      message.error('MAX 값 설정 중 오류가 발생했습니다.');
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
    <Form.Provider>
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
                    <Button onClick={connectWalletHandler}>
                      지갑 연결하기
                    </Button>
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
                        <Title
                          level={3}
                          style={{ margin: 0, color: '#10b981' }}
                        >
                          {balance
                            ? parseFloat(balance).toFixed(6)
                            : '0.000000'}{' '}
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
                <SendForm
                  form={form}
                  balance={balance || undefined}
                  estimatedFee={estimatedFee}
                  isLoading={isLoading}
                  onSubmit={submitFormHandler}
                  onMaxClick={setMaxAmountHandler}
                />

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
                  onOk={confirmSendHandler}
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
    </Form.Provider>
  );
}
