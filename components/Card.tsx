import React from 'react';

// Fix: Extended interface to accept HTML attributes like style and onClick
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};