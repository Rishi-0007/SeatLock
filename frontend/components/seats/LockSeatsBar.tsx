type Props = {
  disabled: boolean;
  onLock: () => void;
};

export function LockSeatsBar({ disabled, onLock }: Props) {
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
        Lock Seats
      </button>
    </div>
  );
}
