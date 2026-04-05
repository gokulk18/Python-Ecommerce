import { X } from 'lucide-react';
import { useEffect } from 'react';

export const SlideOver = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 max-w-md w-full flex">
        <div className="w-full bg-surface border-l border-borderMain shadow-2xl transform transition-transform duration-300 ease-in-out translate-x-0 flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-borderMain">
            <h2 className="text-xl font-heading font-bold text-textMain">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors rounded-full p-1 hover:bg-white/10">
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
