import React from 'react';
import { Form, Input, Alert } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { Card, Button } from '../../../shared/components';
import { AddressInput } from './AddressInput';
import { AmountInput } from './AmountInput';

const { TextArea } = Input;

interface SendFormProps {
  form: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  balance?: string;
  estimatedFee: number;
  isLoading?: boolean;
  onSubmit: (values: {
    recipientAddress: string;
    amount: number;
    memo?: string | null;
  }) => void;
  onMaxClick: () => void;
}

export const SendForm: React.FC<SendFormProps> = ({
  form,
  balance,
  estimatedFee,
  isLoading,
  onSubmit,
  onMaxClick,
}) => {
  return (
    <Card title='송금 정보 입력'>
      <Form
        form={form}
        layout='vertical'
        onFinish={onSubmit}
        autoComplete='off'
      >
        <AddressInput disabled={isLoading} />

        <AmountInput
          balance={balance}
          estimatedFee={estimatedFee}
          onMaxClick={onMaxClick}
          disabled={isLoading}
        />

        <Form.Item label='메모 (선택사항)' name='memo'>
          <TextArea
            placeholder='거래에 대한 메모를 입력하세요 (블록체인에 기록됩니다)'
            rows={3}
            maxLength={100}
            showCount
            disabled={isLoading}
          />
        </Form.Item>

        {/* 수수료 정보 */}
        <Alert
          message={`예상 수수료: ~${estimatedFee.toFixed(6)} ADA`}
          description='실제 수수료는 트랜잭션 크기에 따라 달라질 수 있습니다. 메모가 있으면 수수료가 약간 증가합니다.'
          type='info'
          showIcon
          className='warningCard'
        />

        <Form.Item>
          <Button
            variant='primary'
            htmlType='submit'
            size='large'
            className='submitButton'
            icon={<SendOutlined />}
            loading={isLoading}
          >
            송금하기
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};
