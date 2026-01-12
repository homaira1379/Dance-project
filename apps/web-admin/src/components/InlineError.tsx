"use client";

export function InlineError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
      <div className="font-medium">Something went wrong</div>
      <div className="text-sm mt-1">{message}</div>
      {onRetry && (
        <button
          className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-white text-sm"
          onClick={onRetry}
        >
          Retry
        </button>
      )}
    </div>
  );
}
