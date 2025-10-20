// src/app/api/send-calculation/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, calculation } = body;

    if (!email || !calculation) {
      return NextResponse.json({ message: 'Отсутствуют email или данные расчета.' }, { status: 400 });
    }

    console.log('--- ПОПЫТКА ОТПРАВКИ ПИСЬМА (API получен) ---');
    console.log('Кому:', email);
    console.log('Данные:', calculation);
    console.log('-------------------------------------------');

    return NextResponse.json({ message: `Расчет успешно отправлен на ${email}` });

  } catch (err: unknown) { // ИСПРАВЛЕНО
    if (err instanceof SyntaxError) {
        return NextResponse.json({ message: 'Некорректное тело запроса (не JSON).' }, { status: 400 });
    }
    console.error("Ошибка на сервере при отправке email:", err);
    return NextResponse.json({ message: 'Внутренняя ошибка сервера.' }, { status: 500 });
  }
}