import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSubmit: (value: string) => void;
  placeholder?: string;
}

export const ActionModal: React.FC<ActionModalProps> = ({ isOpen, onClose, title, onSubmit, placeholder }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value);
      setValue('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            autoFocus
            type="text"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Crear</Button>
        </div>
      </form>
    </Modal>
  );
};