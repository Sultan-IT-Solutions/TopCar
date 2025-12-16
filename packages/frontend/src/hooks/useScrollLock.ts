// src/hooks/useScrollLock.ts
import { useEffect } from 'react';

// Глобальный счетчик для отслеживания активных блокировок прокрутки.
// Это позволяет нескольким модальным окнам координировать управление прокруткой.
let scrollLockCount = 0;

/**
 * Хук для блокировки/разблокировки прокрутки элемента <body>.
 * Использует глобальный счетчик для правильной работы с несколькими модальными окнами.
 *
 * @param {boolean} isLocked - Если true, прокрутка будет заблокирована. Если false, будет разблокирована (если нет других активных блокировок).
 */
export const useScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (isLocked) {
      // Если это первая блокировка, применяем стили
      if (scrollLockCount === 0) {
        document.body.style.overflow = 'hidden';
        document.body.classList.add('overflow-hidden'); // Добавляем класс для совместимости
      }
      scrollLockCount++; // Увеличиваем счетчик активных блокировок
    } else {
      // Если это не активная блокировка (модальное окно закрывается)
      scrollLockCount--; // Уменьшаем счетчик
      // Если счетчик стал 0, значит, ни одно модальное окно не требует блокировки
      if (scrollLockCount === 0) {
        document.body.style.overflow = 'auto';
        document.body.classList.remove('overflow-hidden'); // Удаляем класс
      }
      // Убедимся, что счетчик не уходит в минус (для надежности)
      if (scrollLockCount < 0) {
        scrollLockCount = 0;
      }
    }

    // Функция очистки: гарантируем разблокировку при размонтировании компонента
    return () => {
      // Если компонент, который использовал блокировку, размонтируется,
      // и он был причиной активной блокировки, уменьшаем счетчик.
      // Это важно, если, например, компонент был удален из DOM, не закрыв себя явно.
      if (isLocked) {
        scrollLockCount--;
        if (scrollLockCount === 0) {
          document.body.style.overflow = 'auto';
          document.body.classList.remove('overflow-hidden');
        }
        if (scrollLockCount < 0) {
          scrollLockCount = 0;
        }
      }
    };
  }, [isLocked]); // Эффект будет перезапущен при изменении состояния isLocked
};