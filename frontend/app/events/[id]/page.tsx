interface Seat {
  id: string;
  row: string;
  number: number;
  status: 'AVAILABLE' | 'LOCKED' | 'BOOKED';
}

async function getEventSeats(eventId: string) {
  const res = await fetch(`http://localhost:4000/events/${eventId}/seats`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch seats');
  }

  return res.json();
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const data = await getEventSeats(id);

  return (
    <main style={{ padding: '2rem' }}>
      <h1>{data.event.name}</h1>
      <p>{new Date(data.event.date).toLocaleString()}</p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(10, 1fr)',
          gap: '8px',
          marginTop: '2rem',
        }}
      >
        {data.seats.map((seat: Seat) => (
          <button
            key={seat.id}
            disabled={seat.status !== 'AVAILABLE'}
            style={{
              padding: '8px',
              borderRadius: '4px',
              background:
                seat.status === 'AVAILABLE'
                  ? '#16a34a'
                  : seat.status === 'LOCKED'
                    ? '#eab308'
                    : '#dc2626',
              color: 'white',
              cursor: seat.status === 'AVAILABLE' ? 'pointer' : 'not-allowed',
            }}
          >
            {seat.row}
            {seat.number}
          </button>
        ))}
      </div>
    </main>
  );
}
