"use client";

export default function OpenDashboardButton() {
  return (
    <button
      type="button"
      onClick={() => {
        window.location.assign("/admin");
      }}
      className="relative z-20 pointer-events-auto inline-flex items-center rounded-2xl bg-black px-6 py-4 text-base font-semibold text-white shadow transition hover:bg-stone-800"
    >
      Open Admin Dashboard
    </button>
  );
}