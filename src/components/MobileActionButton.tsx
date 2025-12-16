import clsx from 'clsx';
import { ReactNode } from 'react';

type MobileActionButtonProps = {
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
};

export default function MobileActionButton({ onClick, children, disabled = false }: MobileActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'flex w-full items-center gap-3 rounded-md p-3 text-base font-semibold transition-colors',
        'text-neutral-300 hover:bg-neutral-700/50',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent'
      )}
    >
      {children}
    </button>
  );
}