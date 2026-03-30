'use client';

import { useEffect, useMemo, useState } from 'react';
import { BellAlertIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import { csrfClientHelper } from '@/lib/csrf-client';
import { useTranslations } from '@/lib/i18n';
import { registerServiceWorker } from '@/lib/performance';
import { trackClientEvent } from '@/lib/analytics-events-client';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let index = 0; index < rawData.length; index += 1) {
        outputArray[index] = rawData.charCodeAt(index);
    }

    return outputArray;
}

type StatusMessage = {
    type: 'success' | 'error' | 'info';
    text: string;
} | null;

export default function PushSubscriptionCard() {
    const { locale } = useTranslations();
    const pathname = usePathname();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<StatusMessage>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [notificationPermission, setNotificationPermission] =
        useState<NotificationPermission>('default');

    const vapidPublicKey =
        process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY || '';
    const isSupported =
        typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window &&
        Boolean(vapidPublicKey);

    useEffect(() => {
        if (typeof Notification !== 'undefined') {
            setNotificationPermission(Notification.permission);
        }

        if (typeof window !== 'undefined' && isSupported) {
            void syncCurrentSubscription();
        }
    }, [isSupported]);

    const copy = useMemo(
        () =>
            locale === 'en'
                ? {
                      eyebrow: 'Push notifications',
                      title: 'Receive reminders and special offers directly on your device',
                      description:
                          'Enable notifications to receive reminders before the rental ends, special offers, and priority updates from TopCar.',
                      enable: 'Enable notifications',
                      disable: 'Disable notifications',
                      unsupported:
                          'Notifications are not available in this browser or the VAPID key is not configured yet.',
                      granted:
                          'Notifications are enabled. You will receive important updates from TopCar on this device.',
                      denied:
                          'The browser is blocking notifications. Allow them in browser settings and try again.',
                      enabled: 'Notifications have been enabled successfully.',
                      disabled: 'Notifications have been disabled for this device.',
                      failed: 'Could not change the notification status right now. Please try again later.',
                      loading: 'Saving...',
                  }
                : locale === 'kk'
                  ? {
                        eyebrow: 'Push-хабарламалар',
                        title: 'Еске салулар мен арнайы ұсыныстарды тікелей құрылғыңызға алыңыз',
                        description:
                            'Жалдау аяқталуына дейінгі еске салуларды, акцияларды және TopCar жаңартуларын алу үшін хабарламаларды қосыңыз.',
                        enable: 'Хабарламаларды қосу',
                        disable: 'Хабарламаларды өшіру',
                        unsupported:
                            'Бұл браузерде хабарламалар қолжетімсіз немесе VAPID кілті әлі бапталмаған.',
                        granted:
                            'Хабарламалар қосылды. Осы құрылғыда TopCar жаңартуларын алып отырасыз.',
                        denied:
                            'Браузер хабарламаларды бұғаттап тұр. Оларды баптауларда рұқсат етіп, қайта көріңіз.',
                        enabled: 'Хабарламалар сәтті қосылды.',
                        disabled: 'Бұл құрылғы үшін хабарламалар өшірілді.',
                        failed:
                            'Қазір хабарламалар мәртебесін өзгерту мүмкін болмады. Кейінірек қайталап көріңіз.',
                        loading: 'Сақталуда...',
                    }
                  : {
                        eyebrow: 'Push-уведомления',
                        title: 'Получайте напоминания и специальные предложения прямо на устройство',
                        description:
                            'Включите уведомления, чтобы получать напоминания о завершении аренды, спецпредложения и важные обновления от TopCar.',
                        enable: 'Включить уведомления',
                        disable: 'Отключить уведомления',
                        unsupported:
                            'Уведомления недоступны в этом браузере или VAPID-ключ еще не настроен.',
                        granted:
                            'Уведомления уже включены. Вы будете получать важные обновления TopCar на этом устройстве.',
                        denied:
                            'Браузер блокирует уведомления. Разрешите их в настройках браузера и попробуйте еще раз.',
                        enabled: 'Уведомления успешно включены.',
                        disabled: 'Уведомления для этого устройства отключены.',
                        failed:
                            'Сейчас не удалось изменить статус уведомлений. Попробуйте позже.',
                        loading: 'Сохранение...',
                    },
        [locale],
    );

    const syncCurrentSubscription = async () => {
        const registration = await registerServiceWorker();
        if (!registration) {
            setIsSubscribed(false);
            return null;
        }

        const existingSubscription =
            await registration.pushManager.getSubscription();
        setIsSubscribed(Boolean(existingSubscription));
        return existingSubscription;
    };

    const handleSubscribe = async () => {
        if (!isSupported) {
            setStatus({ type: 'info', text: copy.unsupported });
            return;
        }

        setIsSubmitting(true);
        setStatus(null);

        try {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
            if (permission === 'denied') {
                setStatus({ type: 'error', text: copy.denied });
                setIsSubmitting(false);
                return;
            }

            const registration = await registerServiceWorker();
            if (!registration) {
                throw new Error(copy.failed);
            }

            let subscription = await registration.pushManager.getSubscription();
            if (!subscription) {
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
                });
            }

            const response = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: csrfClientHelper.addTokenToHeaders({
                    'Content-Type': 'application/json',
                }),
                body: JSON.stringify({
                    subscription: subscription.toJSON(),
                    locale,
                    pagePath: pathname,
                    metadata: {
                        source: 'download-page',
                    },
                }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || copy.failed);
            }

            setIsSubscribed(true);
            setStatus({ type: 'success', text: copy.enabled });
            void trackClientEvent('pwa_install', {
                source: 'push-subscribe',
                page_path: pathname,
                locale,
            });
        } catch (error) {
            console.error('Push subscribe UI failed:', error);
            setStatus({ type: 'error', text: copy.failed });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUnsubscribe = async () => {
        setIsSubmitting(true);
        setStatus(null);

        try {
            const subscription = await syncCurrentSubscription();

            if (!subscription) {
                setIsSubscribed(false);
                setStatus({ type: 'info', text: copy.disabled });
                return;
            }

            const response = await fetch('/api/push/subscribe', {
                method: 'DELETE',
                headers: csrfClientHelper.addTokenToHeaders({
                    'Content-Type': 'application/json',
                }),
                body: JSON.stringify({
                    endpoint: subscription.endpoint,
                }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || copy.failed);
            }

            await subscription.unsubscribe();
            setIsSubscribed(false);
            setNotificationPermission(
                typeof Notification !== 'undefined'
                    ? Notification.permission
                    : 'default',
            );
            setStatus({ type: 'success', text: copy.disabled });
        } catch (error) {
            console.error('Push unsubscribe UI failed:', error);
            setStatus({ type: 'error', text: copy.failed });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/20 bg-[#d4af37]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f0dca0]">
                        <BellAlertIcon className="h-4 w-4" />
                        {copy.eyebrow}
                    </div>
                    <h3 className="mt-4 text-2xl font-bold text-white">
                        {copy.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-neutral-300 sm:text-base">
                        {copy.description}
                    </p>
                    {notificationPermission === 'granted' && (
                        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
                            <CheckBadgeIcon className="h-4 w-4" />
                            {copy.granted}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3 sm:min-w-[260px]">
                    <button
                        type="button"
                        onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
                        disabled={isSubmitting || !isSupported}
                        className="inline-flex items-center justify-center rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#c79f2b] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting
                            ? copy.loading
                            : isSubscribed
                              ? copy.disable
                              : copy.enable}
                    </button>
                    {!isSupported && (
                        <p className="text-xs leading-6 text-neutral-500">
                            {copy.unsupported}
                        </p>
                    )}
                </div>
            </div>

            {status && (
                <div
                    className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
                        status.type === 'success'
                            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
                            : status.type === 'error'
                              ? 'border-red-500/20 bg-red-500/10 text-red-200'
                              : 'border-white/10 bg-black/20 text-neutral-300'
                    }`}
                >
                    {status.text}
                </div>
            )}
        </div>
    );
}
