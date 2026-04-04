export function isAlreadyCancelledMessage(message: string) {
  const value = message.toLowerCase();

  return (
    value.includes('already cancelled') ||
    value.includes('already canceled')
  );
}

export function isOrderCancellable(status: string | null | undefined) {
  if (!status) return false;

  const normalized = status.toLowerCase();

  return (
    normalized === 'pending' ||
    normalized === 'confirmed' ||
    normalized === 'processing'
  );
}

export function isOrderCancelled(status: string | null | undefined) {
  if (!status) return false;

  return status.toLowerCase() === 'cancelled';
}