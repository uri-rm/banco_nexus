import { useState } from 'react';

export default function Modal({ isOpen, onClose, children, size = 'md' }) {
  const [closing, setClosing] = useState(false);
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
      setClosing(false);
    }, 300); 
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm
        ${closing ? 'slide-out' : 'slide'}`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full ${sizes[size] ?? sizes.md} bg-gray-900 border border-neutral-700 rounded-lg p-6 shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-4 text-neutral-400 hover:text-neutral-100 text-2xl leading-none transition-colors duration-200"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}