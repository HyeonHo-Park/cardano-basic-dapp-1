import React from 'react';
import { Form, Input } from 'antd';

interface AddressInputProps {
  disabled?: boolean;
}

export const AddressInput: React.FC<AddressInputProps> = ({ disabled }) => {
  return (
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
        disabled={disabled}
      />
    </Form.Item>
  );
};
