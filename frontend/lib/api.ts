const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export async function fetchEventWithSeats(eventId: string) {
  const res = await fetch(`${API_BASE}/events/${eventId}/seats`);
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Failed to fetch event with seats');
  }
  return res.json();
}

export async function lockSeatsApi(seatIds: string[]) {
  const res = await fetch(`${API_BASE}/seats/lock`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ seatIds }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Failed to lock seats');
  }

  return res.json();
}

export async function createPaymentSession(seatIds: string[], eventId: string) {
  const res = await fetch(`${API_BASE}/payments/create-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seatIds, eventId }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message);
  }

  return res.json();
}
