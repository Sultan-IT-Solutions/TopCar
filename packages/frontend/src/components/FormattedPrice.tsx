// src/components/FormattedPrice.tsx
'use client'

import { useState, useEffect } from 'react';

type Props = {
  value: number;
};

export default function FormattedPrice({ value }: Props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // На сервере и во время первой загрузки на клиенте показываем "сырое" число
    return <span>{value}</span>;
  }

  // После монтирования на клиенте показываем отформатированную цену
  return <span>{value.toLocaleString('ru-RU')}</span>;
}