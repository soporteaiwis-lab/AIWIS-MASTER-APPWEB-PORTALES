import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className={`bg-slate-900 border border-slate-800 rounded-xl w-full ${maxWidth} shadow-2xl flex flex-col max-h-[90vh]`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};