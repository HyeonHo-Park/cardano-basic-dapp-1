'use client';

import React from 'react';
import { Row, Col, Statistic, Typography } from 'antd';
import {
  WalletOutlined,
  SendOutlined,
  HistoryOutlined,
  DollarOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { Card, MainLayout } from '../shared/components';

const { Title, Paragraph } = Typography;

export default function HomePage() {
  const router = useRouter();

  const handleCardClick = (path: string) => {
    router.push(path);
  };

  return (
    <MainLayout>
      <div className='container'>
        {/* 환영 섹션 */}
        <Card className='welcomeCard' padding='large'>
          <Title level={2} className='welcomeTitle'>
            Cardano dApp에 오신 것을 환영합니다! 🚀
          </Title>
          <Paragraph className='welcomeText'>
            Blockfrost API와 Lucid를 활용한 Cardano 블록체인 기반 탈중앙화
            애플리케이션입니다.
            <br />
            지갑을 연결하고 ADA 송금, 거래 내역 조회 등의 기능을 체험해보세요.
          </Paragraph>
        </Card>

        {/* 통계 카드들 */}
        <Row gutter={[16, 16]} className='statsRow'>
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
        <Row gutter={[16, 16]} className='actionRow'>
          <Col xs={24} md={8}>
            <Card
              variant='interactive'
              className='actionCard'
              onClick={() => handleCardClick('/wallet')}
            >
              <WalletOutlined className='actionIcon actionIconWallet' />
              <Title level={4} className='actionTitle'>
                지갑 연결
              </Title>
              <Paragraph className='actionDescription'>
                Lace 카르다노 지갑을 연결하여 시작하세요
              </Paragraph>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card
              variant='interactive'
              className='actionCard'
              onClick={() => handleCardClick('/send')}
            >
              <SendOutlined className='actionIcon actionIconSend' />
              <Title level={4} className='actionTitle'>
                ADA 송금
              </Title>
              <Paragraph className='actionDescription'>
                다른 카르다노 주소로 ADA를 안전하게 송금하세요
              </Paragraph>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card
              variant='interactive'
              className='actionCard'
              onClick={() => handleCardClick('/history')}
            >
              <HistoryOutlined className='actionIcon actionIconHistory' />
              <Title level={4} className='actionTitle'>
                거래 내역
              </Title>
              <Paragraph className='actionDescription'>
                과거 모든 거래 내역을 확인하고 추적하세요
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
}
