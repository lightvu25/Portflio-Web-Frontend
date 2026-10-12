/** Root loading boundary — shown instantly while a route's server render
 * (backend fetch + compile) is still in flight, so navigation never looks
 * dead. */
export default function Loading() {
  return (
    <main className="flex min-h-[60vh] w-full flex-1 items-center justify-center bg-dark-03">
      <div
        role="status"
        aria-label="Đang tải"
        className="h-10 w-10 animate-spin rounded-full border-2 border-dark-15 border-t-purple-55"
      />
    </main>
  );
}
