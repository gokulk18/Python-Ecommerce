export const Table = ({ headers, children }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-borderMain bg-surface">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/5 border-b border-borderMain">
            {headers.map((h, i) => (
              <th key={i} className="px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-borderMain">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export const TRow = ({ children }) => {
  return <tr className="hover:bg-white/5 transition-colors">{children}</tr>;
};

export const TCell = ({ children, className = '' }) => {
  return <td className={`px-6 py-4 text-sm text-gray-300 whitespace-nowrap ${className}`}>{children}</td>;
};
