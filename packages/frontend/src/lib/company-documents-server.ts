import 'server-only';

import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import {
    COMPANY_DOCUMENTS_ALLOWED_MIME_TYPES,
    COMPANY_DOCUMENTS_BUCKET,
    COMPANY_DOCUMENTS_MAX_FILE_SIZE,
    CompanyDocumentRecord,
    SupportedLocale,
    companyDocumentDefinitions,
    getCompanyDocumentDefinition,
    getLocalizedDocumentText,
} from '@/lib/company-documents';

type StorageFile = {
    name: string;
    id?: string | null;
    updated_at?: string | null;
    created_at?: string | null;
    metadata?: {
        mimetype?: string;
        size?: number;
    } | null;
};

function sanitizeFileName(fileName: string) {
    return fileName
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

async function ensureCompanyDocumentsBucket() {
    const supabase = getSupabaseAdmin();

    const { data: buckets, error: bucketsError } =
        await supabase.storage.listBuckets();

    if (bucketsError) {
        throw bucketsError;
    }

    const exists = buckets?.some((bucket) => bucket.id === COMPANY_DOCUMENTS_BUCKET);

    if (exists) {
        return;
    }

    const { error: createError } = await supabase.storage.createBucket(
        COMPANY_DOCUMENTS_BUCKET,
        {
            public: false,
            fileSizeLimit: COMPANY_DOCUMENTS_MAX_FILE_SIZE,
            allowedMimeTypes: [...COMPANY_DOCUMENTS_ALLOWED_MIME_TYPES],
        },
    );

    if (createError && !String(createError.message).toLowerCase().includes('already exists')) {
        throw createError;
    }
}

async function listFilesInFolder(slug: string) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.storage
        .from(COMPANY_DOCUMENTS_BUCKET)
        .list(slug, {
            limit: 100,
        });

    if (error) {
        const normalizedMessage = String(error.message).toLowerCase();

        if (
            normalizedMessage.includes('bucket not found') ||
            normalizedMessage.includes('not found')
        ) {
            return [] as StorageFile[];
        }

        throw error;
    }

    return (data ?? []) as StorageFile[];
}

function pickLatestFile(files: StorageFile[]) {
    return [...files].sort((left, right) => {
        const leftTime = new Date(left.updated_at || left.created_at || 0).getTime();
        const rightTime = new Date(right.updated_at || right.created_at || 0).getTime();
        return rightTime - leftTime;
    })[0];
}

async function createSignedUrl(path: string, download?: boolean) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage
        .from(COMPANY_DOCUMENTS_BUCKET)
        .createSignedUrl(path, 60 * 10, download ? { download: true } : undefined);

    if (error) {
        throw error;
    }

    return data.signedUrl;
}

export async function getCompanyDocuments(locale: SupportedLocale) {
    await ensureCompanyDocumentsBucket();

    const documents = await Promise.all(
        companyDocumentDefinitions.map(async (definition) => {
            const localized = getLocalizedDocumentText(definition, locale);
            const files = await listFilesInFolder(definition.slug);
            const latestFile = pickLatestFile(files);

            if (latestFile) {
                const storagePath = `${definition.slug}/${latestFile.name}`;
                const [viewUrl, downloadUrl] = await Promise.all([
                    createSignedUrl(storagePath),
                    createSignedUrl(storagePath, true),
                ]);

                return {
                    slug: definition.slug,
                    title: localized.title,
                    description: localized.description,
                    sortOrder: definition.sortOrder,
                    status: 'available',
                    source: 'uploaded',
                    fileName: latestFile.name,
                    mimeType: latestFile.metadata?.mimetype ?? null,
                    sizeBytes: latestFile.metadata?.size ?? null,
                    updatedAt: latestFile.updated_at || latestFile.created_at || null,
                    viewUrl,
                    downloadUrl,
                } satisfies CompanyDocumentRecord;
            }

            return {
                slug: definition.slug,
                title: localized.title,
                description: localized.description,
                sortOrder: definition.sortOrder,
                status: 'pending',
                source: 'missing',
            } satisfies CompanyDocumentRecord;
        }),
    );

    return documents.sort((left, right) => left.sortOrder - right.sortOrder);
}

export async function uploadCompanyDocument(slug: string, file: File) {
    const definition = getCompanyDocumentDefinition(slug);
    if (!definition) {
        throw new Error('Unsupported company document type');
    }

    if (!COMPANY_DOCUMENTS_ALLOWED_MIME_TYPES.has(file.type)) {
        throw new Error('Unsupported file type');
    }

    if (file.size > COMPANY_DOCUMENTS_MAX_FILE_SIZE) {
        throw new Error('Document file size exceeds the allowed limit');
    }

    await ensureCompanyDocumentsBucket();

    const supabase = getSupabaseAdmin();
    const existingFiles = await listFilesInFolder(slug);

    if (existingFiles.length > 0) {
        const { error: removeError } = await supabase.storage
            .from(COMPANY_DOCUMENTS_BUCKET)
            .remove(existingFiles.map((item) => `${slug}/${item.name}`));

        if (removeError) {
            throw removeError;
        }
    }

    const sanitizedName = sanitizeFileName(file.name) || 'document';
    const storagePath = `${slug}/${Date.now()}-${sanitizedName}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
        .from(COMPANY_DOCUMENTS_BUCKET)
        .upload(storagePath, fileBuffer, {
            contentType: file.type,
            upsert: true,
        });

    if (uploadError) {
        throw uploadError;
    }

    const documents = await getCompanyDocuments('ru');
    return documents.find((document) => document.slug === slug) ?? null;
}

export async function deleteUploadedCompanyDocument(slug: string) {
    const definition = getCompanyDocumentDefinition(slug);
    if (!definition) {
        throw new Error('Unsupported company document type');
    }

    await ensureCompanyDocumentsBucket();

    const supabase = getSupabaseAdmin();
    const existingFiles = await listFilesInFolder(slug);

    if (existingFiles.length === 0) {
        return await getCompanyDocuments('ru');
    }

    const { error } = await supabase.storage
        .from(COMPANY_DOCUMENTS_BUCKET)
        .remove(existingFiles.map((item) => `${slug}/${item.name}`));

    if (error) {
        throw error;
    }

    return await getCompanyDocuments('ru');
}
