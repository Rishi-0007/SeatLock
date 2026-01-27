type LegendItem = {
  label: string;
  color: string;
};

const LEGEND: LegendItem[] = [
  { label: 'Available', color: '#22c55e' },
  { label: 'Selected', color: '#3b82f6' },
  { label: 'Locked', color: '#facc15' },
  { label: 'Booked', color: '#ef4444' },
];

export function SeatLegend() {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-6">
      {LEGEND.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span
            className="w-4 h-4 rounded-sm"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-sm text-gray-700">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
