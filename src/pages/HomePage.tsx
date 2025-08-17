'use client';

import React from 'react';
import { Card, Row, Col, Statistic, Typography, Space } from 'antd';
import {
  WalletOutlined,
  SendOutlined,
  HistoryOutlined,
  LinkOutlined,
  DollarOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import MainLayout from '../components/common/Layout/MainLayout';

const { Title, Paragraph } = Typography;

export default function HomePage() {
  const router = useRouter();

  const handleCardClick = (path: string) => {
    router.push(path);
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* 환영 섹션 */}
        <Card style={{ marginBottom: '24px', textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: '16px' }}>
            Cardano dApp에 오신 것을 환영합니다! 🚀
          </Title>
          <Paragraph style={{ fontSize: '16px' }}>
            Blockfrost API와 Lucid를 활용한 Cardano 블록체인 기반 탈중앙화
            애플리케이션입니다.
            <br />
            지갑을 연결하고 ADA 송금, 거래 내역 조회 등의 기능을 체험해보세요.
          </Paragraph>
        </Card>

        {/* 통계 카드들 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title='연결된 지갑'
                value={0}
                prefix={<WalletOutlined />}
                valueStyle={{ color: '#8b5cf6' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title='ADA 잔액'
                value={0}
                precision={2}
                prefix={<DollarOutlined />}
                suffix='ADA'
                valueStyle={{ color: '#10b981' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title='총 거래'
                value={0}
                prefix={<SwapOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title='네트워크'
                value='Preview'
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 빠른 액션 카드들 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} md={8}>
            <Card
              hoverable
              style={{
                textAlign: 'center',
                height: '200px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
              onClick={() => handleCardClick('/wallet')}
            >
              <WalletOutlined
                style={{
                  fontSize: '48px',
                  color: '#8b5cf6',
                  marginBottom: '16px',
                }}
              />
              <Title level={4} style={{ marginBottom: '8px' }}>
                지갑 연결
              </Title>
              <Paragraph style={{ margin: 0, color: '#a6a6a6' }}>
                Nami, Eternl 등의 카르다노 지갑을 연결하여 시작하세요
              </Paragraph>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card
              hoverable
              style={{
                textAlign: 'center',
                height: '200px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
              onClick={() => handleCardClick('/send')}
            >
              <SendOutlined
                style={{
                  fontSize: '48px',
                  color: '#10b981',
                  marginBottom: '16px',
                }}
              />
              <Title level={4} style={{ marginBottom: '8px' }}>
                ADA 송금
              </Title>
              <Paragraph style={{ margin: 0, color: '#a6a6a6' }}>
                다른 카르다노 주소로 ADA를 안전하게 송금하세요
              </Paragraph>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card
              hoverable
              style={{
                textAlign: 'center',
                height: '200px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
              onClick={() => handleCardClick('/history')}
            >
              <HistoryOutlined
                style={{
                  fontSize: '48px',
                  color: '#faad14',
                  marginBottom: '16px',
                }}
              />
              <Title level={4} style={{ marginBottom: '8px' }}>
                거래 내역
              </Title>
              <Paragraph style={{ margin: 0, color: '#a6a6a6' }}>
                과거 모든 거래 내역을 확인하고 추적하세요
              </Paragraph>
            </Card>
          </Col>
        </Row>

        {/* 정보 섹션 */}
        <Card title='🔗 유용한 링크'>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Space direction='vertical' size='middle'>
                <div>
                  <Title level={5}>
                    <LinkOutlined /> 카르다노 리소스
                  </Title>
                  <ul>
                    <li>
                      <a
                        href='https://cardano.org'
                        target='_blank'
                        rel='noopener noreferrer'
                        style={{ color: '#8b5cf6' }}
                      >
                        카르다노 공식 사이트
                      </a>
                    </li>
                    <li>
                      <a
                        href='https://docs.cardano.org'
                        target='_blank'
                        rel='noopener noreferrer'
                        style={{ color: '#8b5cf6' }}
                      >
                        개발자 문서
                      </a>
                    </li>
                    <li>
                      <a
                        href='https://cardanoscan.io'
                        target='_blank'
                        rel='noopener noreferrer'
                        style={{ color: '#8b5cf6' }}
                      >
                        블록 탐색기
                      </a>
                    </li>
                  </ul>
                </div>
              </Space>
            </Col>
            <Col xs={24} sm={12}>
              <Space direction='vertical' size='middle'>
                <div>
                  <Title level={5}>
                    <WalletOutlined /> 지원 지갑
                  </Title>
                  <ul>
                    <li>Nami Wallet</li>
                    <li>Eternl (CCVault)</li>
                    <li>Lace Wallet</li>
                  </ul>
                </div>
              </Space>
            </Col>
          </Row>
        </Card>
      </div>
    </MainLayout>
  );
}
