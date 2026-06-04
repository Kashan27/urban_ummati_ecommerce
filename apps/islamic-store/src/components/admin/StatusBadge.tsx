export function StatusBadge({ status }: { status: string }) {
  const classes =
    status === "received"
      ? "bg-blue-100 text-blue-800"
      : status === "processed"
        ? "bg-yellow-100 text-yellow-800"
        : status === "shipped"
          ? "bg-green-100 text-green-800"
          : status === "delivered"
            ? "bg-purple-100 text-purple-800"
            : status === "canceled"
              ? "bg-red-100 text-red-800"
              : "bg-muted text-muted-foreground";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${classes}`}
    >
      {status}
    </span>
  );
}
