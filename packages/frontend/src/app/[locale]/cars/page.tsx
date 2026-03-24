import { redirect } from 'next/navigation';

export default async function LocalizedCarsIndexPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    redirect(`/${locale}/autopark`);
}
