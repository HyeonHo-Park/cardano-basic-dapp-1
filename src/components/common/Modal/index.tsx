import React from 'react';
import { Modal as AntModal, ModalProps as AntModalProps } from 'antd';

export interface ModalProps extends AntModalProps {
  variant?: 'default' | 'confirm' | 'warning' | 'error';
}

export const Modal: React.FC<ModalProps> = ({
  variant = 'default',
  children,
  ...props
}) => {
  const getModalStyles = () => {
    const baseStyle = {
      borderRadius: '12px',
    };

    switch (variant) {
      case 'confirm':
        return {
          ...baseStyle,
        };
      case 'warning':
        return {
          ...baseStyle,
        };
      case 'error':
        return {
          ...baseStyle,
        };
      default:
        return baseStyle;
    }
  };

  const getOkButtonProps = () => {
    switch (variant) {
      case 'confirm':
        return {
          style: { backgroundColor: '#10b981', borderColor: '#10b981' },
        };
      case 'warning':
        return {
          style: { backgroundColor: '#f59e0b', borderColor: '#f59e0b' },
        };
      case 'error':
        return {
          style: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
        };
      default:
        return {
          style: { backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' },
        };
    }
  };

  return (
    <AntModal
      {...props}
      style={{ ...getModalStyles(), ...props.style }}
      okButtonProps={{ ...getOkButtonProps(), ...props.okButtonProps }}
      cancelButtonProps={{
        style: { borderColor: '#d1d5db', color: '#6b7280' },
        ...props.cancelButtonProps,
      }}
    >
      {children}
    </AntModal>
  );
};

export default Modal;
