"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <section className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">
          Unexpected error
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">
          The page could not be rendered.
        </h1>
        <p className="mt-4 text-base text-slate-600">
          Try again. If the problem continues, verify the API key and the response from
          ipgeolocation.io.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-8 inline-flex items-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Retry
        </button>
      </section>
    </main>
  );
}
