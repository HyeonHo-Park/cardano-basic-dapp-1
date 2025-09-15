'use client';

import React from 'react';
import { Row, Col, Typography } from 'antd';
import {
  WalletOutlined,
  SendOutlined,
  HistoryOutlined,
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
      <div className='home-container'>
        {/* 환영 섹션 */}
        <Card className='home-welcomeCard' padding='large'>
          <Title level={2} className='home-welcomeTitle'>
            Cardano dApp에 오신 것을 환영합니다! 🚀
          </Title>
          <Paragraph className='home-welcomeText'>
            Blockfrost API와 Lucid를 활용한 Cardano 블록체인 기반 탈중앙화
            애플리케이션입니다.
            <br />
            지갑을 연결하고 ADA 송금, 거래 내역 조회 등의 기능을 체험해보세요.
          </Paragraph>
        </Card>

        {/* 빠른 액션 카드들 */}
        <Row gutter={[16, 16]} className='home-actionRow'>
          <Col xs={24} md={8}>
            <Card
              variant='interactive'
              className='home-actionCard'
              onClick={() => handleCardClick('/wallet')}
            >
              <WalletOutlined className='home-actionIcon home-actionIconWallet' />
              <Title level={4} className='home-actionTitle'>
                지갑 연결
              </Title>
              <Paragraph className='home-actionDescription'>
                Lace 카르다노 지갑을 연결하여 시작하세요
              </Paragraph>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card
              variant='interactive'
              className='home-actionCard'
              onClick={() => handleCardClick('/send')}
            >
              <SendOutlined className='home-actionIcon home-actionIconSend' />
              <Title level={4} className='home-actionTitle'>
                ADA 송금
              </Title>
              <Paragraph className='home-actionDescription'>
                다른 카르다노 주소로 ADA를 안전하게 송금하세요
              </Paragraph>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card
              variant='interactive'
              className='home-actionCard'
              onClick={() => handleCardClick('/history')}
            >
              <HistoryOutlined className='home-actionIcon home-actionIconHistory' />
              <Title level={4} className='home-actionTitle'>
                거래 내역
              </Title>
              <Paragraph className='home-actionDescription'>
                과거 모든 거래 내역을 확인하고 추적하세요
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
}
