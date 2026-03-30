alter table public.cars
    add column if not exists is_featured_home boolean not null default false;

alter table public.cars
    add column if not exists featured_order integer not null default 0;

create index if not exists cars_featured_home_idx
    on public.cars (is_featured_home, featured_order, created_at desc);

create table if not exists public.requests (
    id uuid primary key default gen_random_uuid(),
    request_type text not null
        check (request_type in ('contact', 'calculation', 'booking')),
    source text not null default 'website',
    status text not null default 'new'
        check (status in ('new', 'reviewed', 'contacted', 'confirmed', 'cancelled', 'archived')),
    user_id uuid references auth.users(id) on delete set null,
    car_id bigint references public.cars(id) on delete set null,
    tariff_id bigint references public.prices(id) on delete set null,
    car_name text,
    user_name text,
    user_phone text,
    user_email text,
    message text,
    service_type text,
    with_driver boolean,
    duration_unit text not null default 'day'
        check (duration_unit in ('day', 'hour')),
    duration_value integer
        check (duration_value is null or duration_value > 0),
    requested_date_from date,
    requested_date_to date,
    starts_at timestamptz,
    ends_at timestamptz,
    subtotal_amount numeric(12, 2) not null default 0,
    discount_amount numeric(12, 2) not null default 0,
    final_amount numeric(12, 2) not null default 0,
    promo_code text,
    promo_code_id uuid,
    locale text not null default 'ru',
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint requests_window_check check (
        requested_date_from is null
        or requested_date_to is null
        or requested_date_to >= requested_date_from
    )
);

alter table public.requests enable row level security;

drop trigger if exists set_requests_updated_at on public.requests;
create trigger set_requests_updated_at
before update on public.requests
for each row
execute function public.set_updated_at();

create index if not exists requests_created_at_idx on public.requests (created_at desc);
create index if not exists requests_user_id_idx on public.requests (user_id);
create index if not exists requests_car_id_idx on public.requests (car_id);
create index if not exists requests_request_type_idx on public.requests (request_type, status);

drop policy if exists "requests_select_own_or_admin" on public.requests;
create policy "requests_select_own_or_admin"
on public.requests
for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "requests_manage_admin" on public.requests;
create policy "requests_manage_admin"
on public.requests
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create table if not exists public.promo_codes (
    id uuid primary key default gen_random_uuid(),
    code text not null unique,
    title text,
    description text,
    scope text not null default 'public'
        check (scope in ('public', 'personal')),
    discount_type text not null default 'percent'
        check (discount_type in ('percent', 'amount')),
    discount_value numeric(12, 2) not null check (discount_value > 0),
    is_active boolean not null default true,
    starts_at timestamptz,
    expires_at timestamptz,
    usage_limit integer check (usage_limit is null or usage_limit >= 0),
    per_user_limit integer check (per_user_limit is null or per_user_limit >= 0),
    assigned_user_id uuid references auth.users(id) on delete set null,
    car_id bigint references public.cars(id) on delete set null,
    applicable_duration_unit text
        check (applicable_duration_unit is null or applicable_duration_unit in ('day', 'hour')),
    with_driver boolean,
    legacy_source text,
    legacy_id bigint,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.promo_codes enable row level security;

drop trigger if exists set_promo_codes_updated_at on public.promo_codes;
create trigger set_promo_codes_updated_at
before update on public.promo_codes
for each row
execute function public.set_updated_at();

create index if not exists promo_codes_scope_idx on public.promo_codes (scope, is_active);
create index if not exists promo_codes_assigned_user_idx on public.promo_codes (assigned_user_id);
create index if not exists promo_codes_car_id_idx on public.promo_codes (car_id);

drop policy if exists "promo_codes_select_assigned_or_admin" on public.promo_codes;
create policy "promo_codes_select_assigned_or_admin"
on public.promo_codes
for select
to authenticated
using (
    public.is_admin()
    or (
        is_active = true
        and (
            scope = 'public'
            or assigned_user_id = auth.uid()
        )
    )
);

drop policy if exists "promo_codes_manage_admin" on public.promo_codes;
create policy "promo_codes_manage_admin"
on public.promo_codes
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create table if not exists public.promo_redemptions (
    id uuid primary key default gen_random_uuid(),
    promo_code_id uuid not null references public.promo_codes(id) on delete cascade,
    user_id uuid references auth.users(id) on delete set null,
    request_id uuid references public.requests(id) on delete set null,
    booking_id uuid references public.bookings(id) on delete set null,
    redeemed_code text not null,
    discount_amount numeric(12, 2) not null default 0,
    final_amount numeric(12, 2) not null default 0,
    metadata jsonb not null default '{}'::jsonb,
    redeemed_at timestamptz not null default now()
);

alter table public.promo_redemptions enable row level security;

create index if not exists promo_redemptions_promo_code_idx on public.promo_redemptions (promo_code_id, redeemed_at desc);
create index if not exists promo_redemptions_user_idx on public.promo_redemptions (user_id, redeemed_at desc);
create index if not exists promo_redemptions_request_idx on public.promo_redemptions (request_id);

drop policy if exists "promo_redemptions_select_own_or_admin" on public.promo_redemptions;
create policy "promo_redemptions_select_own_or_admin"
on public.promo_redemptions
for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "promo_redemptions_manage_admin" on public.promo_redemptions;
create policy "promo_redemptions_manage_admin"
on public.promo_redemptions
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create table if not exists public.analytics_events (
    id bigint generated by default as identity primary key,
    event_name text not null,
    user_id uuid references auth.users(id) on delete set null,
    request_id uuid references public.requests(id) on delete set null,
    booking_id uuid references public.bookings(id) on delete set null,
    car_id bigint references public.cars(id) on delete set null,
    promo_code_id uuid references public.promo_codes(id) on delete set null,
    source text not null default 'website',
    locale text not null default 'ru',
    page_path text,
    event_value numeric(12, 2),
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

alter table public.analytics_events enable row level security;

create index if not exists analytics_events_name_created_at_idx
    on public.analytics_events (event_name, created_at desc);
create index if not exists analytics_events_created_at_idx
    on public.analytics_events (created_at desc);
create index if not exists analytics_events_car_id_idx
    on public.analytics_events (car_id, created_at desc);

drop policy if exists "analytics_events_select_admin" on public.analytics_events;
create policy "analytics_events_select_admin"
on public.analytics_events
for select
to authenticated
using (public.is_admin());

drop policy if exists "analytics_events_manage_admin" on public.analytics_events;
create policy "analytics_events_manage_admin"
on public.analytics_events
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create table if not exists public.push_subscriptions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete set null,
    endpoint text not null unique,
    p256dh text not null,
    auth text not null,
    locale text not null default 'ru',
    user_agent text,
    is_active boolean not null default true,
    metadata jsonb not null default '{}'::jsonb,
    last_seen_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

drop trigger if exists set_push_subscriptions_updated_at on public.push_subscriptions;
create trigger set_push_subscriptions_updated_at
before update on public.push_subscriptions
for each row
execute function public.set_updated_at();

create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions (user_id, is_active);
create index if not exists push_subscriptions_active_idx on public.push_subscriptions (is_active, last_seen_at desc);

drop policy if exists "push_subscriptions_select_own_or_admin" on public.push_subscriptions;
create policy "push_subscriptions_select_own_or_admin"
on public.push_subscriptions
for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "push_subscriptions_manage_own_or_admin" on public.push_subscriptions;
create policy "push_subscriptions_manage_own_or_admin"
on public.push_subscriptions
for all
to authenticated
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

alter table public.bookings
    add column if not exists request_id uuid references public.requests(id) on delete set null;

alter table public.bookings
    add column if not exists promo_code_id uuid references public.promo_codes(id) on delete set null;

alter table public.bookings
    add column if not exists promo_code text;

alter table public.bookings
    add column if not exists discount_amount numeric(12, 2) not null default 0;

alter table public.bookings
    add column if not exists final_amount numeric(12, 2) not null default 0;

alter table public.bookings
    add column if not exists starts_at timestamptz;

alter table public.bookings
    add column if not exists ends_at timestamptz;

create index if not exists bookings_request_id_idx on public.bookings (request_id);
create index if not exists bookings_promo_code_id_idx on public.bookings (promo_code_id);

insert into public.promo_codes (
    code,
    title,
    description,
    scope,
    discount_type,
    discount_value,
    is_active,
    starts_at,
    expires_at,
    usage_limit,
    assigned_user_id,
    legacy_source,
    legacy_id,
    created_at
)
select
    ppc.code,
    ppc.code,
    null,
    case when ppc.is_personal then 'personal' else 'public' end,
    'percent',
    ppc.discount_perc,
    ppc.is_active,
    null,
    ppc.expires_at,
    ppc.usage_limit,
    ppc.user_id,
    'public_promocodes',
    ppc.id,
    ppc.created_at
from public.public_promocodes ppc
on conflict (code) do update
set
    description = coalesce(excluded.description, public.promo_codes.description),
    scope = excluded.scope,
    discount_type = excluded.discount_type,
    discount_value = excluded.discount_value,
    is_active = excluded.is_active,
    expires_at = excluded.expires_at,
    usage_limit = excluded.usage_limit,
    assigned_user_id = coalesce(excluded.assigned_user_id, public.promo_codes.assigned_user_id);

insert into public.promo_codes (
    code,
    title,
    description,
    scope,
    discount_type,
    discount_value,
    is_active,
    expires_at,
    usage_limit,
    assigned_user_id,
    legacy_source,
    legacy_id,
    created_at
)
select
    p.code,
    p.code,
    p.description,
    case when upc.user_id is null then 'public' else 'personal' end,
    p.discount_type,
    p.discount_value,
    p.is_active,
    p.expiry_date,
    null,
    upc.user_id,
    'promocodes',
    p.id,
    p.created_at
from public.promocodes p
left join public.user_promo_codes upc
    on upc.promocode_id = p.id
on conflict (code) do update
set
    description = coalesce(excluded.description, public.promo_codes.description),
    discount_type = excluded.discount_type,
    discount_value = excluded.discount_value,
    is_active = excluded.is_active,
    expires_at = excluded.expires_at,
    assigned_user_id = coalesce(excluded.assigned_user_id, public.promo_codes.assigned_user_id),
    scope = case
        when excluded.assigned_user_id is not null then 'personal'
        else public.promo_codes.scope
    end;

comment on table public.requests is 'Canonical inbox for contact requests, saved calculations and booking requests created from public forms.';
comment on table public.promo_codes is 'Master promo code registry replacing legacy public_promocodes/promocodes tables.';
comment on table public.promo_redemptions is 'Records every promo application tied to a request or booking.';
comment on table public.analytics_events is 'Internal business analytics event stream used by the admin dashboard.';
comment on table public.push_subscriptions is 'Web push subscriptions for opted-in PWA users.';
