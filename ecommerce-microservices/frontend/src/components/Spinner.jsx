export const Spinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex justify-center flex-col items-center gap-2">
      <div className={`${sizes[size]} border-4 border-surface border-t-primary rounded-full animate-spin`}></div>
    </div>
  );
};
