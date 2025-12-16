// File: src/lib/formatters.ts

/**
 * Форматирует номер телефона в стандарт E.164
 * Поддерживает различные форматы ввода (8-777-123-45-67, +7 777 123 45 67, и т.д.)
 * @param value - входной номер телефона
 * @returns отформатированный номер в формате E.164 (+77771234567)
 */
export const formatPhoneToE164 = (value: string): string => {
  if (!value) return '';
  
  // Удаляем все нечисловые символы
  let phoneNumber = value.replace(/[^\d]/g, '');
  
  // Если начинается с 8, заменяем на 7 (КЗ/РФ формат)
  if (phoneNumber.startsWith('8') && phoneNumber.length === 11) {
    phoneNumber = '7' + phoneNumber.substring(1);
  }
  
  // Если номер из 10 цифр без кода страны, добавляем 7 (КЗ/РФ)
  if (phoneNumber.length === 10) {
    phoneNumber = '7' + phoneNumber;
  }
  
  // Возвращаем в формате E.164
  return '+' + phoneNumber;
};

/**
 * Форматирует номер телефона для отображения пользователю
 * Формат: +7 (777) 123-45-67
 * @param value - входной номер телефона
 * @returns отформатированный номер для UI
 */
export const formatPhoneNumber = (value: string): string => {
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

/**
 * Валидация номера телефона
 * @param phone - номер телефона для проверки
 * @returns true если номер валиден
 */
export const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[^\d]/g, '');
  // Проверяем что номер содержит 11 цифр (7 + 10 цифр)
  return cleaned.length === 11 && (cleaned.startsWith('7') || cleaned.startsWith('8'));
};