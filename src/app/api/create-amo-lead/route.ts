// src/app/api/create-amo-lead/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';

const {
  AMOCRM_SUBDOMAIN,
  AMOCRM_CLIENT_ID,
  AMOCRM_CLIENT_SECRET,
  AMOCRM_REDIRECT_URI,
  AMOCRM_AUTH_CODE,
  RESEND_API_KEY,
} = process.env;

function getResendClient() {
  if (!RESEND_API_KEY) return null;
  return new Resend(RESEND_API_KEY);
}

async function exchangeAuthCodeForTokensIfNeeded() {
  const url = `${AMOCRM_SUBDOMAIN}/oauth2/access_token`;
  const body = {
    client_id: AMOCRM_CLIENT_ID,
    client_secret: AMOCRM_CLIENT_SECRET,
    grant_type: 'authorization_code',
    code: AMOCRM_AUTH_CODE,
    redirect_uri: AMOCRM_REDIRECT_URI,
  };
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(`Ошибка получения токена: ${JSON.stringify(data)}`);
  return data;
}

function validatePayload(payload: any) {
  if (!payload) throw new Error('Empty body');
  const { userName, userPhone, carName, bookingDetails } = payload;
  if (!userName || !carName) throw new Error('Недостаточно данных: userName и carName обязательны');
  return { userName, userPhone, carName, bookingDetails: bookingDetails || {} };
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { userName, userPhone, carName, bookingDetails } = validatePayload(payload);

    const tokenData = await exchangeAuthCodeForTokensIfNeeded();
    const accessToken = tokenData.access_token;

    const amoPayload = {
      add: [
        {
          name: `Заявка на ${carName} от ${userName}`,
          price: bookingDetails?.price || 0,
          _embedded: {
            contacts: [
              {
                first_name: userName,
                custom_fields_values: userPhone ? [
                  {
                    field_code: 'PHONE',
                    values: [{ value: userPhone, enum_code: 'MOB' }]
                  }
                ] : undefined
              }
            ]
          }
        }
      ]
    };

    const amoUrl = `${AMOCRM_SUBDOMAIN}/api/v4/leads/complex`;
    const amoResp = await fetch(amoUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(amoPayload),
    });

    const amoBody = await amoResp.json().catch(() => null);
    if (!amoResp.ok) {
      console.error('amoCRM error', amoResp.status, amoBody);
      return NextResponse.json({ ok: false, source: 'amo', status: amoResp.status, body: amoBody }, { status: 502 });
    }

    const resend = getResendClient();
    if (resend) {
      try {
        await resend.emails.send({
          from: 'Заявка с сайта <booking@topcar.club>',
          to: 'topcar_club@mail.ru',
          subject: `Новая заявка: ${carName}`,
          html: `
            <div>
              <h2>Новая заявка с сайта TopCar</h2>
              <p><b>Имя клиента:</b> ${userName}</p>
              <p><b>Телефон:</b> ${userPhone || '—'}</p>
              <p><b>Автомобиль:</b> ${carName}</p>
              <p><b>Детали:</b> ${bookingDetails?.duration || '—'}</p>
            </div>
          `
        });
      } catch (sendErr) {
        console.error('Ошибка отправки email:', sendErr);
      }
    } else {
      console.warn('RESEND_API_KEY отсутствует — email не отправлен');
    }

    return NextResponse.json({ ok: true, amo: amoBody }, { status: 200 });
  } catch (err: any) {
    console.error('Общая ошибка в обработчике:', err);
    return NextResponse.json({ ok: false, error: err.message || String(err) }, { status: 500 });
  }
}
