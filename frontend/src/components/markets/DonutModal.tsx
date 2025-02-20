import React from 'react';
import { Dialog } from '@headlessui/react';

interface MarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
}

const DonutModal: React.FC<MarketModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />

      {/* Full-screen container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="min-w-[800px] max-h-[90vh] overflow-y-auto transform rounded-xl bg-[#0F1216] shadow-xl transition-all">
          {/* Header with matching border style */}
          <div className="flex items-center justify-between border-b-[0.5px] border-[#2A2A2A] p-6">
            <Dialog.Title className="text-lg">
              {title}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-[#AFAFAF] hover:bg-[#1A1D21] transition-colors"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {children}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default DonutModal;