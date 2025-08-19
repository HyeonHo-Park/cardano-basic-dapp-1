import React from 'react';
import { Button as AntButton, ButtonProps as AntButtonProps } from 'antd';

export interface ButtonProps extends Omit<AntButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'middle' | 'large';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'middle',
  children,
  ...props
}) => {
  const getButtonType = () => {
    switch (variant) {
      case 'primary':
        return 'primary';
      case 'secondary':
        return 'default';
      case 'danger':
        return 'primary';
      case 'ghost':
        return 'text';
      default:
        return 'primary';
    }
  };

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: '8px',
      fontWeight: 500,
    };

    if (variant === 'danger') {
      return {
        ...baseStyle,
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
      };
    }

    if (variant === 'secondary') {
      return {
        ...baseStyle,
        borderColor: '#8b5cf6',
        color: '#8b5cf6',
      };
    }

    return baseStyle;
  };

  return (
    <AntButton
      type={getButtonType()}
      size={size}
      style={getButtonStyle()}
      {...props}
    >
      {children}
    </AntButton>
  );
};

export default Button;
