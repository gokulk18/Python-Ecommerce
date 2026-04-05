export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`glass-effect rounded-xl overflow-hidden hover-glow ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
