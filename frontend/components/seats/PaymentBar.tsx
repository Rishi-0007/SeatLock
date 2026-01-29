type Props = {
  disabled: boolean;
  onLock: () => void;
  user: any; // Using any for simplicity in prop type, but ideally reuse User type
};

export function ProceedToPaymentBar({ disabled, onLock, user }: Props) {
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
        {user ? 'Book Seats' : 'Login to Book'}
      </button>
    </div>
  );
}
