'use client';

export const dynamic = 'force-dynamic';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    ArrowDownTrayIcon,
    ArrowLeftIcon,
    ArrowPathIcon,
    ArrowRightOnRectangleIcon,
    DocumentArrowUpIcon,
    DocumentTextIcon,
    EyeIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import AnimatedPageWrapper from '@/components/AnimatedPageWrapper';
import { csrfClientHelper } from '@/lib/csrf-client';
import { useAdminSession } from '@/hooks/useAdminSession';

type AdminCompanyDocument = {
    slug: string;
    title: string;
    description: string;
    sortOrder: number;
    status: 'available' | 'pending';
    source: 'uploaded' | 'fallback' | 'missing';
    fileName?: string;
    mimeType?: string | null;
    sizeBytes?: number | null;
    updatedAt?: string | null;
    viewUrl?: string;
    downloadUrl?: string;
};

function formatFileSize(value?: number | null) {
    if (!value) {
        return '—';
    }

    if (value >= 1024 * 1024) {
        return `${(value / (1024 * 1024)).toFixed(1)} MB`;
    }

    if (value >= 1024) {
        return `${(value / 1024).toFixed(1)} KB`;
    }

    return `${value} B`;
}

function formatDate(value?: string | null) {
    if (!value) {
        return '—';
    }

    try {
        return new Date(value).toLocaleString('ru-RU');
    } catch {
        return value;
    }
}

export default function AdminUploadPage() {
    const { admin, isLoading, logout } = useAdminSession();
    const [documents, setDocuments] = useState<AdminCompanyDocument[]>([]);
    const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedSlug, setSelectedSlug] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const loadDocuments = async () => {
        setIsLoadingDocuments(true);
        setError('');

        try {
            const response = await fetch('/api/admin/documents', {
                cache: 'no-store',
                credentials: 'same-origin',
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Не удалось загрузить документы.');
            }

            const nextDocuments = Array.isArray(data) ? data : [];
            setDocuments(nextDocuments);
            if (!selectedSlug && nextDocuments.length > 0) {
                setSelectedSlug(nextDocuments[0].slug);
            }
        } catch (loadError) {
            setError(
                loadError instanceof Error
                    ? loadError.message
                    : 'Не удалось загрузить документы.',
            );
        } finally {
            setIsLoadingDocuments(false);
        }
    };

    useEffect(() => {
        if (admin) {
            void loadDocuments();
        }
    }, [admin]);

    const selectedDocument = useMemo(
        () => documents.find((document) => document.slug === selectedSlug) ?? null,
        [documents, selectedSlug],
    );

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSelectedFile(event.target.files?.[0] ?? null);
        setMessage('');
        setError('');
    };

    const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError('');
        setMessage('');

        if (!selectedSlug) {
            setError('Выберите тип документа.');
            setIsSubmitting(false);
            return;
        }

        if (!selectedFile) {
            setError('Выберите файл для загрузки.');
            setIsSubmitting(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.set('slug', selectedSlug);
            formData.set('file', selectedFile);

            const response = await fetch('/api/admin/documents', {
                method: 'POST',
                credentials: 'same-origin',
                headers: csrfClientHelper.addTokenToHeaders(),
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Не удалось загрузить документ.');
            }

            setSelectedFile(null);
            setMessage(`Документ "${data?.title || selectedSlug}" успешно обновлен.`);
            await loadDocuments();
        } catch (uploadError) {
            setError(
                uploadError instanceof Error
                    ? uploadError.message
                    : 'Не удалось загрузить документ.',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (document: AdminCompanyDocument) => {
        if (
            !window.confirm(
                `Удалить загруженную версию документа "${document.title}"?`,
            )
        ) {
            return;
        }

        setError('');
        setMessage('');

        try {
            const response = await fetch(`/api/admin/documents/${document.slug}`, {
                method: 'DELETE',
                credentials: 'same-origin',
                headers: csrfClientHelper.addTokenToHeaders(),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Не удалось удалить документ.');
            }

            setMessage(`Документ "${document.title}" удален.`);
            const nextDocuments = Array.isArray(data.documents)
                ? data.documents
                : documents;
            setDocuments(nextDocuments);
        } catch (deleteError) {
            setError(
                deleteError instanceof Error
                    ? deleteError.message
                    : 'Не удалось удалить документ.',
            );
        }
    };

    if (isLoading || !admin) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-neutral-950">
                <ArrowPathIcon className="h-12 w-12 animate-spin text-[#d4af37]" />
            </div>
        );
    }

    return (
        <AnimatedPageWrapper>
            <div className="min-h-screen bg-neutral-950 text-white">
                <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/admin"
                                className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 px-3 py-2 text-sm text-neutral-300 transition hover:border-neutral-500 hover:text-white"
                            >
                                <ArrowLeftIcon className="h-4 w-4" />
                                Назад
                            </Link>
                            <h1 className="text-xl font-bold">Файлы и документы</h1>
                        </div>
                        <button
                            onClick={() => void logout()}
                            className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 px-3 py-2 text-sm text-neutral-300 transition hover:border-neutral-500 hover:text-white"
                        >
                            <ArrowRightOnRectangleIcon className="h-5 w-5" />
                            Выйти
                        </button>
                    </div>
                </header>

                <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[420px_minmax(0,1fr)] sm:px-6 lg:px-8">
                    <section className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6">
                        <div className="flex items-center gap-3">
                            <DocumentArrowUpIcon className="h-8 w-8 text-[#d4af37]" />
                            <div>
                                <h2 className="text-2xl font-bold">Загрузка документов</h2>
                                <p className="text-sm text-neutral-400">
                                    Загрузите PDF или изображение. Новая версия автоматически заменит предыдущую.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleUpload} className="mt-6 space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-300">
                                    Тип документа
                                </label>
                                <select
                                    value={selectedSlug}
                                    onChange={(event) => setSelectedSlug(event.target.value)}
                                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-[#d4af37]"
                                >
                                    {documents.map((document) => (
                                        <option key={document.slug} value={document.slug}>
                                            {document.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedDocument && (
                                <div className="rounded-2xl border border-neutral-800 bg-black/20 px-4 py-4 text-sm text-neutral-300">
                                    <p className="font-semibold text-white">
                                        {selectedDocument.title}
                                    </p>
                                    <p className="mt-2 leading-relaxed text-neutral-400">
                                        {selectedDocument.description}
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-300">
                                    Файл
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                                    onChange={handleFileChange}
                                    className="block w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-neutral-300 file:mr-4 file:rounded-xl file:border-0 file:bg-[#d4af37] file:px-4 file:py-2 file:font-semibold file:text-black hover:file:bg-[#c0982c]"
                                />
                            </div>

                            {selectedFile && (
                                <div className="rounded-2xl border border-neutral-800 bg-black/20 px-4 py-3 text-sm text-neutral-300">
                                    {selectedFile.name} • {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </div>
                            )}

                            {error && (
                                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                    {error}
                                </div>
                            )}
                            {message && (
                                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d4af37] px-4 py-3 font-semibold text-black transition hover:bg-[#c0982c] disabled:opacity-70"
                            >
                                {isSubmitting && (
                                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                                )}
                                {isSubmitting ? 'Загрузка...' : 'Загрузить документ'}
                            </button>
                        </form>
                    </section>

                    <section className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-2xl font-bold">Публикация на витрине</h2>
                                <p className="text-sm text-neutral-400">
                                    Загруженные здесь документы автоматически появятся в разделе безопасности сайта.
                                </p>
                            </div>
                            <button
                                onClick={() => void loadDocuments()}
                                className="inline-flex items-center gap-2 rounded-2xl border border-neutral-700 px-4 py-3 text-sm text-neutral-300 transition hover:border-neutral-500 hover:text-white"
                            >
                                <ArrowPathIcon
                                    className={`h-5 w-5 ${isLoadingDocuments ? 'animate-spin' : ''}`}
                                />
                                Обновить
                            </button>
                        </div>

                        {isLoadingDocuments ? (
                            <div className="flex min-h-[320px] items-center justify-center">
                                <ArrowPathIcon className="h-10 w-10 animate-spin text-[#d4af37]" />
                            </div>
                        ) : (
                            <div className="mt-6 space-y-4">
                                {documents.map((document) => (
                                    <div
                                        key={document.slug}
                                        className="rounded-3xl border border-neutral-800 bg-neutral-950/40 p-5"
                                    >
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                            <div className="max-w-3xl">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <DocumentTextIcon className="h-6 w-6 text-[#d4af37]" />
                                                    <h3 className="text-lg font-semibold text-white">
                                                        {document.title}
                                                    </h3>
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                            document.status === 'available'
                                                                ? 'bg-emerald-500/15 text-emerald-300'
                                                                : 'bg-neutral-800 text-neutral-400'
                                                        }`}
                                                    >
                                                        {document.status === 'available'
                                                            ? document.source === 'uploaded'
                                                                ? 'Загружен в админке'
                                                                : 'Стандартный материал'
                                                            : 'Ожидает загрузки'}
                                                    </span>
                                                </div>
                                                <p className="mt-3 text-sm leading-relaxed text-neutral-400">
                                                    {document.description}
                                                </p>
                                                <div className="mt-4 flex flex-wrap gap-4 text-xs text-neutral-500">
                                                    <span>Файл: {document.fileName || '—'}</span>
                                                    <span>Размер: {formatFileSize(document.sizeBytes)}</span>
                                                    <span>Обновлен: {formatDate(document.updatedAt)}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3">
                                                {document.viewUrl && (
                                                    <a
                                                        href={document.viewUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 rounded-2xl border border-neutral-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-neutral-500 hover:bg-neutral-800"
                                                    >
                                                        <EyeIcon className="h-5 w-5" />
                                                        Открыть
                                                    </a>
                                                )}
                                                {document.downloadUrl && (
                                                    <a
                                                        href={document.downloadUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 rounded-2xl bg-[#d4af37] px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#c0982c]"
                                                    >
                                                        <ArrowDownTrayIcon className="h-5 w-5" />
                                                        Скачать
                                                    </a>
                                                )}
                                                {document.source === 'uploaded' && (
                                                    <button
                                                        onClick={() => void handleDelete(document)}
                                                        className="inline-flex items-center gap-2 rounded-2xl border border-red-500/30 px-4 py-2.5 text-sm font-semibold text-red-200 transition-colors hover:bg-red-500/10"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                        Удалить
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </AnimatedPageWrapper>
    );
}
