export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  // Handle HH:MM format
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export function formatPrice(price: number | string): string {
  const num = parseFloat(String(price));
  if (isNaN(num) || num === 0) return 'Free';
  return `$${num.toFixed(2)}`;
}

export function formatCurrency(amount: number | string): string {
  const num = parseFloat(String(amount));
  if (isNaN(num)) return '$0.00';
  return `$${num.toFixed(2)}`;
}

export function calculateTotal(
  price: number,
  quantity: number,
  feeRate = 0.05
): { subtotal: number; fee: number; total: number } {
  const subtotal = price * quantity;
  const fee = subtotal * feeRate;
  const total = subtotal + fee;
  return { subtotal, fee, total };
}

export function generateBookingId(id: number): string {
  return `BK${String(id).padStart(6, '0')}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
