export const Badge = ({ children, variant = 'primary', className = '' }) => {
  const variants = {
    primary: "bg-primary/20 text-primary border-primary",
    success: "bg-secondary/20 text-secondary border-secondary",
    warning: "bg-yellow-500/20 text-yellow-500 border-yellow-500",
    danger: "bg-red-500/20 text-red-500 border-red-500",
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
