export async function lockSeatsApi(seatIds: string[]) {
  const res = await fetch(process.env.BACKEND_URL + '/api/seats/lock', {
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
