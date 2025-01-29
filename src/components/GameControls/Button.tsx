import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary',
  onClick,
  disabled,
  children 
}) => {
  return (
    <button
      className={`px-4 py-2 rounded-lg ${
        variant === 'primary' ? 'bg-blue-500 text-white' : 'bg-gray-200'
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
