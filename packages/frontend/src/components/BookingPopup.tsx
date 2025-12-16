'use client'

import { useState, useEffect } from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
  carName: string
}

export default function BookingPopup({ isOpen, onClose, carName }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setVisible(true)
      document.body.style.overflow = 'hidden'
    } else {
      setVisible(false)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`bg-black w-full max-w-md rounded-xl border border-white/10 p-6 transform transition-all duration-300 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <h2 className="text-2xl font-bold mb-4">Бронирование: {carName}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            alert('Заявка отправлена ✅')
            onClose()
          }}
          className="flex flex-col gap-4"
        >
          <input
            type="text"
            placeholder="Ваше имя"
            required
            className="p-3 bg-white/5 text-white rounded-md"
          />
          <input
            type="tel"
            placeholder="Телефон"
            required
            className="p-3 bg-white/5 text-white rounded-md"
          />
          <input
            type="date"
            required
            className="p-3 bg-white/5 text-white rounded-md"
          />
          <input
            type="time"
            required
            className="p-3 bg-white/5 text-white rounded-md"
          />
          <button
            type="submit"
            className="bg-white text-black py-3 rounded-full font-semibold"
          >
            Оформить бронь
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-white/60 text-sm mt-1 hover:underline"
          >
            Отмена
          </button>
        </form>
      </div>
    </div>
  )
}

