import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-nexus-card border border-nexus-border rounded-xl  overflow-hidden card-hover ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
