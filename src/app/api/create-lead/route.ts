import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userName, userPhone, carName, bookingDetails } = await req.json();

    if (!userName || !userPhone || !carName) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const baseUrl = process.env.BITRIX_WEBHOOK_URL;
    if (!baseUrl) {
      throw new Error('BITRIX_WEBHOOK_URL is not set in environment variables');
    }

    const url = `${baseUrl}crm.lead.add.json`;

    const leadData = {
      fields: {
        TITLE: `Заявка на ${carName} от ${userName}`,
        NAME: userName,
        PHONE: [{ VALUE: userPhone, VALUE_TYPE: 'WORK' }],
        COMMENTS: `
          Тип услуги: ${bookingDetails?.serviceType || 'Не указано'}
          Период аренды: ${bookingDetails?.duration || 'Не указано'}
        `,
      },
    };

    // Отправляем лид в Bitrix24
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData),
    });

    const result = await response.json();

    // Проверяем ответ от Bitrix24
    if (result.error) {
      console.error('Ошибка Bitrix24:', result);
      return NextResponse.json({ message: `Ошибка CRM: ${result.error_description}` }, { status: 500 });
    }

    console.log('Лид успешно создан в Bitrix24 с ID:', result.result);
    return NextResponse.json({ message: 'Лид успешно создан в Bitrix24', leadId: result.result }, { status: 200 });

  } catch (error) {
    console.error('Ошибка при обработке запроса:', error);
    return NextResponse.json({ message: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}