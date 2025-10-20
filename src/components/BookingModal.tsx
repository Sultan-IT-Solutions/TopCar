// src/components/BookingModal.tsx
'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import {
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon as CloseIcon,
  UserIcon,
  PhoneIcon
} from '@heroicons/react/20/solid'
import FormattedPrice from './FormattedPrice'
import { useScrollLock } from '@/hooks/useScrollLock'; // <--- ДОБАВЛЕНО: Импорт нового хука

// --- Вспомогательная функция, добавленная прямо сюда ---
const formatPhoneNumber = (value: string): string => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 1) return '+';
    
    let formattedNumber = '+';
    if (phoneNumber.startsWith('7') || phoneNumber.startsWith('8')) {
      formattedNumber += `7 (${phoneNumber.substring(1, 4)}`;
    } else {
      formattedNumber += `7 (${phoneNumber.substring(0, 3)}`;
    }
  
    if (phoneNumberLength > 4) {
      formattedNumber += `) ${phoneNumber.substring(4, 7)}`;
    }
    if (phoneNumberLength > 7) {
      formattedNumber += `-${phoneNumber.substring(7, 9)}`;
    }
    if (phoneNumberLength > 9) {
      formattedNumber += `-${phoneNumber.substring(9, 11)}`;
    }
  
    return formattedNumber;
};


type SelectedTariff = {
  serviceType: string;
  duration: string;
  price: number;
  carId?: number;
}

type Props = {
  carName: string
  isOpen: boolean
  onClose: () => void
  bookingDetails?: SelectedTariff;
  promoCode?: string;
}

const InputField = ({
  id, label, type = 'text', placeholder, value, onChange, icon: Icon, maxLength
}: {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  maxLength?: number;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-neutral-300 mb-1.5">
      {label} <span className="text-[#d4af37]">*</span>
    </label>
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
        <Icon className="h-5 w-5 text-neutral-500" />
      </div>
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        maxLength={maxLength}
        className="w-full py-3 pl-10 pr-3 text-base text-white bg-neutral-800 border border-neutral-700 rounded-lg 
                   focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] placeholder-neutral-500"
      />
    </div>
  </div>
);

export default function BookingModal({
  carName, isOpen, onClose, bookingDetails
}: Props) {
  const [loggedInUser, setLoggedInUser] = useState<{ phone: string; name?: string } | null>(null);
  const [userName, setUserName]   = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [loading, setLoading]     = useState(false);
  const [message, setMessage]     = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  // <--- ДОБАВЛЕНО: Используем хук useScrollLock для управления прокруткой body
  useScrollLock(isOpen);

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setUserPhone(formatted);
  };

  useEffect(() => {
    if (!isOpen) return;
    // document.body.style.overflow = 'hidden'; // <--- УДАЛЕНО: Теперь управляется useScrollLock
    const stored = localStorage.getItem('topcar-user')
    if (stored) {
      try {
        const u = JSON.parse(stored)
        setLoggedInUser(u)
        setUserName(u.name || '')
        setUserPhone(formatPhoneNumber(u.phone || ''))
      } catch {
        setLoggedInUser(null)
      }
    } else {
      setLoggedInUser(null)
    }
    setMessage('')
    setMessageType('')
    setLoading(false)
  }, [isOpen])
  
  // <--- УДАЛЕНО: Старая логика useEffect для body.style.overflow
  // useEffect(() => {
  //   if (isOpen) {
  //     document.body.style.overflow = 'hidden';
  //   } else {
  //     document.body.style.overflow = '';
  //   }
  //   return () => {
  //     document.body.style.overflow = '';
  //   };
  // }, [isOpen]);

  if (!isOpen) return null

  const handleSubmit = async () => {
    setLoading(true)
    setMessage('')
    setMessageType('')
    
    const cleanedPhone = userPhone.replace(/[^\d]/g, '');

    if (!userName || !cleanedPhone) {
      setMessage('Пожалуйста, заполните все обязательные поля.')
      setMessageType('error')
      setLoading(false)
      return
    }

    const payload = { carName, userName, userPhone: cleanedPhone, bookingDetails }

    try {
      const res = await fetch('/api/create-amo-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || `HTTP ${res.status}`);
      }
      
      setMessage(data.message || `Заявка на ${carName} успешно отправлена!`)
      setMessageType('success')
      setTimeout(onClose, 4000)

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('Ошибка при отправке в amoCRM:', msg)
      setMessage(msg)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-md z-[100] flex justify-center items-center px-4 py-8"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-lg w-full space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
            Бронирование:&nbsp;
            <span className="text-[#d4af37]">{carName}</span>
          </h2>
          <button onClick={onClose} aria-label="Закрыть" className="p-2 text-neutral-500 hover:text-white rounded-full hover:bg-neutral-700">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        {bookingDetails && (
          <div className="text-sm text-center bg-neutral-800/50 p-3 rounded-lg">
            <p className="text-neutral-300">
              Выбран тариф:&nbsp;
              <span className="font-semibold text-white">
                {bookingDetails.serviceType} ({bookingDetails.duration})
              </span>
            </p>
            <p className="text-lg font-bold text-[#d4af37]">
              <FormattedPrice value={bookingDetails.price} /> ₸
            </p>
          </div>
        )}

        <div className="space-y-5">
          {!loggedInUser ? (
            <>
              <InputField id="userNameModal" label="Ваше имя" placeholder="Иван Петров" value={userName} onChange={e => setUserName(e.target.value)} icon={UserIcon} />
              <InputField 
                id="userPhoneModal" 
                label="Ваш телефон" 
                type="tel" 
                placeholder="+7 (XXX) XXX-XX-XX" 
                value={userPhone} 
                onChange={handlePhoneChange} 
                icon={PhoneIcon}
                maxLength={18}
              />
            </>
          ) : (
            <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-sm text-neutral-300 text-center">
              Заявка будет оформлена на&nbsp;
              <span className="font-semibold text-white">{loggedInUser.name || loggedInUser.phone}</span>.
            </div>
          )}
        </div>

        {message && (
          <div className={`flex items-center gap-2 p-3 rounded-md text-sm mt-4
            ${messageType === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-300' : ''}
            ${messageType === 'error'   ? 'bg-red-500/10   border border-red-500/30   text-red-300'   : ''}
          `}>
            {messageType === 'success' && <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />}
            {messageType === 'error'   && <XCircleIcon className="h-5 w-5 flex-shrink-0" />}
            <span>{message}</span>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || messageType === 'success'}
          className="w-full mt-2 px-8 py-3.5 bg-[#d4af37] text-black rounded-lg text-base sm:text-lg font-semibold 
                     hover:bg-[#c0982c] focus:outline-none focus:ring-4 focus:ring-[#d4af37]/50
                     disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 ease-in-out
                     flex items-center justify-center gap-2 group"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
              <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            'Подтвердить бронирование'
          )}
        </button>
      </div>
    </div>
  )
}