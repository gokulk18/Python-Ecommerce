import React from 'react';

const Input = React.forwardRef(({ label, className = '', type = 'text', ...props }, ref) => {
  return (
    <div className={`relative ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>}
      <input
        ref={ref}
        type={type}
        className="w-full bg-nexus-card border border-nexus-border text-nexus-text rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-nexus-primary focus:border-transparent transition-all placeholder-gray-600"
        {...props}
      />
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
