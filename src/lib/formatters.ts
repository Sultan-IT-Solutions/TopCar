// File: src/lib/formatters.ts

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