import React from 'react';
import { Spin, Space, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

export interface LoadingProps {
  size?: 'small' | 'default' | 'large';
  message?: string;
  spinning?: boolean;
  children?: React.ReactNode;
  overlay?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'default',
  message,
  spinning = true,
  children,
  overlay = false,
}) => {
  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: size === 'small' ? 16 : size === 'large' ? 32 : 24,
        color: '#8b5cf6',
      }}
      spin
    />
  );

  if (children) {
    return (
      <Spin
        spinning={spinning}
        indicator={antIcon}
        className={overlay ? 'spinContainer' : ''}
      >
        {children}
      </Spin>
    );
  }

  return (
    <div className='container'>
      <Space direction='vertical' align='center' className='content'>
        <Spin indicator={antIcon} spinning={spinning} />
        {message && (
          <Text type='secondary' className='text'>
            {message}
          </Text>
        )}
      </Space>
    </div>
  );
};

export default Loading;
