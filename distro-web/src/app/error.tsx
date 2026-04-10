"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-4xl mb-4">⚠️</p>
      <h2 className="font-grotesk font-bold text-xl text-ink mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="bg-blue hover:bg-blue-dark text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
