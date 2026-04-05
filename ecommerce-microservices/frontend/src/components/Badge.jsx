import React from 'react';

const Badge = ({ children, color = 'blue', className = '' }) => {
  const colors = {
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    teal: 'bg-nexus-secondary/20 text-nexus-secondary border-nexus-secondary/50',
    red: 'bg-red-500/20 text-red-400 border-red-500/50',
    purple: 'bg-nexus-primary/20 text-nexus-primary border-nexus-primary/50'
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${colors[color] || colors.purple} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
