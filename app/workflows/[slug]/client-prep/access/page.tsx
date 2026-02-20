import { redirect } from 'next/navigation';

export default async function ClientPrepAccess({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/workflows/${slug}/access`);
}
