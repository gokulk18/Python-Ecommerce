import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = 'px-4 py-2 font-sora font-semibold rounded-md transition-all duration-300 flex items-center justify-center';
  
  const variants = {
    primary: 'bg-gradient-to-r from-nexus-primary to-purple-600 text-white hover:shadow-[0_0_15px_rgba(108,99,255,0.6)] border border-transparent hover:border-nexus-primary',
    secondary: 'bg-transparent border-2 border-nexus-secondary text-nexus-secondary hover:bg-nexus-secondary hover:text-nexus-bg shadow-[0_0_10px_rgba(0,212,170,0.2)] hover:shadow-[0_0_20px_rgba(0,212,170,0.5)]',
    danger: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]'
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
