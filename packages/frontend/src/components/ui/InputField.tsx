import React, { ChangeEvent } from 'react';

// Тип для иконок из heroicons
export type HeroIconType = React.ForwardRefExoticComponent<
  Omit<React.SVGProps<SVGSVGElement>, 'ref'> & {
    title?: string;
    titleId?: string;
  } & React.RefAttributes<SVGSVGElement>
>;

interface InputFieldProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  icon?: HeroIconType;
  required?: boolean;
  min?: string;
  disabled?: boolean;
  maxLength?: number;
}

const InputField = ({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon: Icon,
  required = true,
  min,
  disabled = false,
  maxLength,
}: InputFieldProps) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-neutral-300 mb-1.5">
      {label} {required && <span className="text-[#d4af37]">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <Icon className="h-5 w-5 text-neutral-500" />
        </div>
      )}
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        disabled={disabled}
        maxLength={maxLength}
        className={`w-full py-3 ${Icon ? 'pl-10 pr-3' : 'px-3.5'} text-base text-white bg-neutral-800 border border-neutral-700 rounded-lg 
                   focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] placeholder-neutral-500
                   disabled:opacity-50 disabled:cursor-not-allowed
                   ${type === 'date' && !value ? 'text-neutral-500' : 'text-white'}`}
      />
    </div>
  </div>
);

export default InputField;
