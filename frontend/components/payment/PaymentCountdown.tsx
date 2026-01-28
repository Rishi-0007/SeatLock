type Props = {
  secondsLeft: number;
};

export function PaymentCountdown({ secondsLeft }: Props) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="text-sm text-red-600 font-semibold">
      ⏳ Complete payment in {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  );
}
