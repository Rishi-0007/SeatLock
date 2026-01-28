type Props = {
  disabled: boolean;
  onLock: () => void;
};

export function ProceedToPaymentBar({ disabled, onLock }: Props) {
  return (
    <div className="mt-4 flex justify-end">
      <button
        disabled={disabled}
        onClick={onLock}
        className={`
          px-6 py-2 rounded-md font-semibold text-white
          ${
            disabled
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }
        `}
      >
        {/* Book here means calling seats/lock api and after payment seats/book will call automatically */}
        Book Seats
      </button>
    </div>
  );
}
