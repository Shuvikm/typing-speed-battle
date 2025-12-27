import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  className = '',
  ...props 
}) => {
  const baseStyles = 'font-bold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-lg hover:shadow-xl animate-pulse-neon',
    secondary: 'bg-dark-card border-2 border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-dark-bg',
    danger: 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg',
    success: 'bg-gradient-to-r from-green-500 to-hacker-green text-white shadow-lg',
    pirate: 'bg-gradient-to-r from-pirate-red to-pirate-yellow text-white shadow-lg hover:shadow-2xl',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

