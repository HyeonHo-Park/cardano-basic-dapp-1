import React from 'react';
import { Card as AntCard, CardProps as AntCardProps } from 'antd';

export interface CardProps extends Omit<AntCardProps, 'variant'> {
  variant?: 'default' | 'hoverable' | 'interactive' | 'stat';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'medium',
  children,
  style,
  ...props
}) => {
  const getCardStyle = () => {
    const baseStyle = {
      borderRadius: '12px',
      border: '1px solid #f0f0f0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    };

    const paddingMap = {
      none: { padding: 0 },
      small: { padding: '12px' },
      medium: { padding: '24px' },
      large: { padding: '32px' },
    };

    let variantStyle = {};
    if (variant === 'hoverable') {
      variantStyle = {
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      };
    } else if (variant === 'interactive') {
      variantStyle = {
        cursor: 'pointer',
        borderColor: '#8b5cf6',
      };
    } else if (variant === 'stat') {
      variantStyle = {
        textAlign: 'center' as const,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
      };
    }

    return {
      ...baseStyle,
      ...paddingMap[padding],
      ...variantStyle,
      ...style,
    };
  };

  const isHoverable = variant === 'hoverable' || variant === 'interactive';

  return (
    <AntCard hoverable={isHoverable} style={getCardStyle()} {...props}>
      {children}
    </AntCard>
  );
};

export default Card;
