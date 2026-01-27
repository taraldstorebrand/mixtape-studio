interface StatusBadgeProps {
  status: string | undefined;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (!status || status === 'completed' || status === 'pending') return null;

  const statusMap: Record<string, { text: string; className: string }> = {
    failed: { text: 'Feilet', className: 'status-failed' },
  };

  const statusInfo = statusMap[status];
  if (!statusInfo) return null;
  return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.text}</span>;
}
