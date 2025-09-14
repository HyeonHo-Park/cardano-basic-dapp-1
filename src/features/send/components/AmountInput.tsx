import React from 'react';
import { Form, InputNumber } from 'antd';
import { Button } from '../../../shared/components';

interface AmountInputProps {
  balance?: string;
  estimatedFee: number;
  onMaxClick: () => void;
  disabled?: boolean;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  balance,
  estimatedFee,
  onMaxClick,
  disabled,
}) => {
  const maxAvailable = balance
    ? Math.max(0, parseFloat(balance) - estimatedFee)
    : 0;
  const hasBalance = balance && parseFloat(balance) > 0;
  const canSendMax = hasBalance && maxAvailable >= 1;

  return (
    <Form.Item
      label={
        <div className='inputWrapper'>
          <span className='inputHeader'>송금 금액 (ADA)</span>
          {hasBalance && (
            <span className='amount-input-max-badge'>
              최대: {maxAvailable.toFixed(6)} ADA
            </span>
          )}
        </div>
      }
      name='amount'
      rules={[
        {
          required: true,
          message: '송금할 금액을 입력해주세요!',
        },
        {
          validator: (_, value) => {
            const currentBalance = balance ? parseFloat(balance) : 0;
            if (value && value > currentBalance - estimatedFee) {
              return Promise.reject(
                `잔액이 부족합니다! 최대: ${(currentBalance - estimatedFee).toFixed(6)} ADA`
              );
            }
            if (value && value < 1) {
              return Promise.reject('최소 1 ADA 이상 송금해야 합니다!');
            }
            return Promise.resolve();
          },
        },
      ]}
    >
      <InputNumber
        placeholder='0.000000'
        size='large'
        className='inputField'
        min={0}
        max={maxAvailable}
        step={0.1}
        precision={6}
        stringMode
        disabled={disabled}
        addonAfter={
          <Button
            variant='secondary'
            onClick={onMaxClick}
            disabled={disabled || !canSendMax}
            title={
              !canSendMax
                ? '송금 가능한 잔액이 부족합니다'
                : `최대 ${maxAvailable.toFixed(6)} ADA 입력`
            }
            size='small'
            className='maxButton'
          >
            MAX
          </Button>
        }
      />
    </Form.Item>
  );
};
