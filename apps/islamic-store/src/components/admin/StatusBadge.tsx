export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${
        status === "received"
          ? "bg-blue-100 text-blue-800"
          : status === "processed"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-green-100 text-green-800"
      }`}
    >
      {status}
    </span>
  );
}
