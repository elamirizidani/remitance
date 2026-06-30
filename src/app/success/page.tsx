import SuccessClient from './SuccessClient';

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const transferId = Array.isArray(params.transferId)
    ? params.transferId[0]
    : params.transferId ?? null;

  return <SuccessClient transferId={transferId} />;
}
