import BalanceGameDetailClient from './BalanceGameDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BalanceGameDetailPage({ params }: Props) {
  const { id } = await params;
  return <BalanceGameDetailClient gameId={id} />;
}