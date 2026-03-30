create table if not exists public.company_settings (
    id text primary key default 'primary',
    phone_display text not null default '+7 (777) 666-02-95',
    phone_raw text not null default '+77776660295',
    email text not null default 'topcar_club@mail.ru',
    address_ru text not null default 'г. Алматы, ул. Байтурсынова, 179/2',
    address_en text not null default '179/2 Baitursynova St., Almaty',
    address_kk text not null default 'Алматы қ., Байтұрсынова көш., 179/2',
    support_hours_ru text not null default 'Работаем круглосуточно, 24/7',
    support_hours_en text not null default 'Available 24/7',
    support_hours_kk text not null default 'Тәулік бойы, 24/7',
    whatsapp_url text not null default 'https://wa.me/77776660295',
    telegram_url text not null default 'https://t.me/topcarqz',
    instagram_url text not null default 'https://www.instagram.com/topcar.qz?igsh=MXJjbTZ5M3BwdTkzMA==',
    viber_url text,
    max_url text,
    pwa_download_url text not null default '/download',
    pwa_qr_image_url text,
    subscription_enabled boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.company_settings enable row level security;

insert into public.company_settings (id)
values ('primary')
on conflict (id) do nothing;

drop trigger if exists set_company_settings_updated_at on public.company_settings;
create trigger set_company_settings_updated_at
before update on public.company_settings
for each row
execute function public.set_updated_at();

drop policy if exists "company_settings_select_public" on public.company_settings;
create policy "company_settings_select_public"
on public.company_settings
for select
to anon, authenticated
using (true);

drop policy if exists "company_settings_manage_admin" on public.company_settings;
create policy "company_settings_manage_admin"
on public.company_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create table if not exists public.site_sections (
    slug text primary key,
    data jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.site_sections enable row level security;

drop trigger if exists set_site_sections_updated_at on public.site_sections;
create trigger set_site_sections_updated_at
before update on public.site_sections
for each row
execute function public.set_updated_at();

drop policy if exists "site_sections_select_public" on public.site_sections;
create policy "site_sections_select_public"
on public.site_sections
for select
to anon, authenticated
using (true);

drop policy if exists "site_sections_manage_admin" on public.site_sections;
create policy "site_sections_manage_admin"
on public.site_sections
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.site_sections (slug, data)
values
    (
        'faq',
        '{
          "items": [
            {
              "id": "payment",
              "question": {
                "ru": "Как происходит оплата аренды?",
                "en": "How do I pay for the rental?",
                "kk": "Жалдау ақысын қалай төлеймін?"
              },
              "answer": {
                "ru": "Оплата подтверждается до передачи автомобиля. Менеджер заранее согласует удобный формат оплаты и итоговую сумму.",
                "en": "Payment is confirmed before the vehicle handover. A manager will agree on a convenient payment format and the final amount in advance.",
                "kk": "Төлем көлік берілгенге дейін расталады. Менеджер төлемнің ыңғайлы тәсілін және соңғы соманы алдын ала келіседі."
              }
            },
            {
              "id": "terms",
              "question": {
                "ru": "Какие основные условия аренды?",
                "en": "What are the main rental requirements?",
                "kk": "Жалдаудың негізгі талаптары қандай?"
              },
              "answer": {
                "ru": "Минимальный возраст водителя — 23 года, минимальный стаж — 3 года. Для некоторых автомобилей премиум-класса требования могут быть выше.",
                "en": "The minimum driver age is 23 and the minimum driving experience is 3 years. Some premium vehicles may require a higher threshold.",
                "kk": "Жүргізушінің ең төменгі жасы — 23 жас, жүргізу өтілі — кемінде 3 жыл. Кейбір премиум көліктер үшін талап жоғары болуы мүмкін."
              }
            },
            {
              "id": "return",
              "question": {
                "ru": "Как проходит возврат автомобиля?",
                "en": "How does the vehicle return work?",
                "kk": "Көлікті қайтару қалай өтеді?"
              },
              "answer": {
                "ru": "Перед возвратом менеджер согласует время и место, после чего автомобиль проходит стандартную проверку состояния и комплектации.",
                "en": "Before the return, a manager confirms the time and location, and the vehicle goes through a standard condition and equipment check.",
                "kk": "Қайтару алдында менеджер уақыт пен орынды келіседі, содан кейін көлік стандартты техникалық және жинақтама тексеруінен өтеді."
              }
            },
            {
              "id": "out-of-city",
              "question": {
                "ru": "Можно ли выезжать за пределы города?",
                "en": "Can I drive outside the city?",
                "kk": "Қала сыртына шығуға бола ма?"
              },
              "answer": {
                "ru": "Да, но маршрут нужно согласовать заранее. Для отдельных автомобилей и направлений могут действовать дополнительные условия.",
                "en": "Yes, but the route should be approved in advance. Some vehicles and destinations may have additional conditions.",
                "kk": "Иә, бірақ бағыт алдын ала келісілген болуы керек. Кейбір көліктер мен бағыттар үшін қосымша шарттар қолданылады."
              }
            }
          ]
        }'::jsonb
    ),
    (
        'terms',
        '{
          "sections": [
            {
              "id": "requirements",
              "icon": "IdentificationIcon",
              "title": {
                "ru": "Требования к арендатору",
                "en": "Renter requirements",
                "kk": "Жалдаушыға қойылатын талаптар"
              },
              "points": {
                "ru": ["Минимальный возраст: 21 год.", "Стаж вождения: не менее 3 лет.", "Наличие оригинала паспорта и водительского удостоверения."],
                "en": ["Minimum age: 21 years.", "Driving experience: at least 3 years.", "Original passport and driver''s license are required."],
                "kk": ["Ең төменгі жас: 21 жас.", "Жүргізу өтілі: кемінде 3 жыл.", "Төлқұжат пен жүргізуші куәлігінің түпнұсқасы қажет."]
              }
            },
            {
              "id": "payment",
              "icon": "CurrencyDollarIcon",
              "title": {
                "ru": "Оплата и депозит",
                "en": "Payment and deposit",
                "kk": "Төлем және депозит"
              },
              "points": {
                "ru": ["Полная предоплата за весь период аренды.", "Внесение страхового депозита зависит от класса автомобиля.", "Депозит возвращается после проверки автомобиля."],
                "en": ["Full prepayment for the entire rental period.", "A security deposit depends on the car class.", "The deposit is returned after the vehicle inspection."],
                "kk": ["Жалдау мерзімі үшін толық алдын ала төлем жасалады.", "Сақтандыру депозиті көлік класына байланысты.", "Депозит көлік тексерілгеннен кейін қайтарылады."]
              }
            },
            {
              "id": "restrictions",
              "icon": "NoSymbolIcon",
              "title": {
                "ru": "Ограничения и запреты",
                "en": "Restrictions and prohibitions",
                "kk": "Шектеулер мен тыйымдар"
              },
              "points": {
                "ru": ["Курение в салоне запрещено.", "Передача управления третьим лицам без согласования запрещена.", "Выезд за пределы согласованной территории запрещен."],
                "en": ["Smoking inside the vehicle is prohibited.", "Handing the car to third parties without approval is prohibited.", "Driving outside the approved operating area is prohibited."],
                "kk": ["Көлік салонында темекі шегуге тыйым салынады.", "Үшінші тұлғаларға жүргізуді беруге болмайды.", "Келісілген пайдалану аумағынан тыс шығуға болмайды."]
              }
            },
            {
              "id": "insurance",
              "icon": "ShieldCheckIcon",
              "title": {
                "ru": "Страхование и ответственность",
                "en": "Insurance and liability",
                "kk": "Сақтандыру және жауапкершілік"
              },
              "points": {
                "ru": ["Все автомобили застрахованы.", "Арендатор отвечает за штрафы в период аренды.", "В случае ДТП необходимо сразу связаться с менеджером."],
                "en": ["All vehicles are insured.", "The renter is responsible for traffic fines during the rental.", "In case of an accident, contact the manager immediately."],
                "kk": ["Барлық көліктер сақтандырылған.", "Жалдаушы жалдау кезеңіндегі айыппұлдар үшін жауап береді.", "ЖКО болған жағдайда менеджермен дереу байланысу қажет."]
              }
            }
          ]
        }'::jsonb
    )
on conflict (slug) do nothing;

comment on table public.company_settings is 'Editable public company profile, messenger links, PWA links and feature toggles.';
comment on table public.site_sections is 'Editable structured content sections such as FAQ and rental terms.';
