export const Input = ({ label, id, error, ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label htmlFor={id} className="text-sm font-medium text-textMain">{label}</label>}
      <input
        id={id}
        className={`bg-surface border ${error ? 'border-red-500' : 'border-borderMain'} rounded-lg px-4 py-2 text-textMain focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all w-full`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export const TextArea = ({ label, id, error, ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label htmlFor={id} className="text-sm font-medium text-textMain">{label}</label>}
      <textarea
        id={id}
        className={`bg-surface border ${error ? 'border-red-500' : 'border-borderMain'} rounded-lg px-4 py-2 text-textMain focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all w-full`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export const Select = ({ label, id, error, options, ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label htmlFor={id} className="text-sm font-medium text-textMain">{label}</label>}
      <select
        id={id}
        className={`bg-surface border ${error ? 'border-red-500' : 'border-borderMain'} rounded-lg px-4 py-2 text-textMain focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all w-full`}
        {...props}
      >
        <option value="" disabled>Select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};
