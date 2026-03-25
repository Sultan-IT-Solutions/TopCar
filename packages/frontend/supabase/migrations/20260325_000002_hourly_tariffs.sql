alter table public.prices
    add column if not exists duration_unit text;

update public.prices
set duration_unit = 'day'
where duration_unit is null;

alter table public.prices
    alter column duration_unit set default 'day';

alter table public.prices
    alter column duration_unit set not null;

alter table public.prices
    drop constraint if exists prices_unique_range;

alter table public.prices
    drop constraint if exists prices_duration_unit_check;

alter table public.prices
    add constraint prices_duration_unit_check
        check (duration_unit in ('day', 'hour'));

alter table public.prices
    add constraint prices_unique_range
        unique (car_id, days_from, days_to, with_driver, duration_unit);

create index if not exists prices_car_id_duration_unit_idx
    on public.prices (car_id, duration_unit, with_driver);

comment on column public.prices.duration_unit is
    'day for daily rentals, hour for hourly rental slots such as 3h / 6h / 12h.';

alter table public.bookings
    add column if not exists duration_unit text;

update public.bookings
set duration_unit = 'day'
where duration_unit is null;

alter table public.bookings
    alter column duration_unit set default 'day';

alter table public.bookings
    alter column duration_unit set not null;

alter table public.bookings
    drop constraint if exists bookings_duration_unit_check;

alter table public.bookings
    add constraint bookings_duration_unit_check
        check (duration_unit in ('day', 'hour'));

alter table public.bookings
    add column if not exists duration_value integer;

alter table public.bookings
    drop constraint if exists bookings_duration_value_check;

alter table public.bookings
    add constraint bookings_duration_value_check
        check (duration_value is null or duration_value > 0);

comment on column public.bookings.duration_unit is
    'Selected duration mode for the booking: day or hour.';

comment on column public.bookings.duration_value is
    'Selected duration amount in the chosen unit. Example: 3 for 3 hours or 6 for 6 days.';
