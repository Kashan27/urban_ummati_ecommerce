"use client";

import type { ListOrdersStatus, Order } from "@workspace/api-zod";

type Props = {
  orders: Order[] | undefined;
  isLoading?: boolean;
  statusFilter?: ListOrdersStatus;
  onStatusFilterChange?: (status: ListOrdersStatus | undefined) => void;
  page?: number;
  onPageChange?: (page: number) => void;
  totalOrders?: number;
  onOrderStatusChange: (orderId: number, status: "received" | "processed" | "shipped") => void;
  onViewOrderDetails: (order: Order) => void;
  onPrintReceipt: (order: Order) => void;
};

export function OrdersSection({
  orders,
  isLoading,
  statusFilter,
  onStatusFilterChange,
  page = 0,
  onPageChange,
  totalOrders = 0,
  onOrderStatusChange,
  onViewOrderDetails,
  onPrintReceipt,
}: Props) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const pageSize = 50;
  const totalPages = Math.ceil(totalOrders / pageSize);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl tracking-tight">Orders</h2>
          <p className="mt-1 text-sm text-muted-foreground">Review and update fulfillment status.</p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-sm font-medium">
            Filter:
          </label>
          <select
            id="status-filter"
            value={statusFilter || ""}
            onChange={(e) => onStatusFilterChange?.((e.target.value as ListOrdersStatus) || undefined)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="received">Received</option>
            <option value="processed">Processed</option>
            <option value="shipped">Shipped</option>
          </select>
        </div>
      </div>

      {orders?.length ? (
        <>
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted/80 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-4 text-left">Order #</th>
                  <th className="p-4 text-left">Customer</th>
                  <th className="p-4 text-left">Items</th>
                  <th className="p-4 text-left">Total</th>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="p-4 font-mono text-muted-foreground">#{order.id.toString().padStart(5, "0")}</td>
                    <td className="p-4">
                      <div>{order.customerName}</div>
                      <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                    </td>
                    <td className="p-4 text-muted-foreground">{order.items.length} item(s)</td>
                    <td className="p-4 font-medium">${order.total.toFixed(2)}</td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-CA")}
                    </td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          onOrderStatusChange(order.id, e.target.value as "received" | "processed" | "shipped")
                        }
                        className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                      >
                        <option value="received">Received</option>
                        <option value="processed">Processed</option>
                        <option value="shipped">Shipped</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => onViewOrderDetails(order)}
                          className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => onPrintReceipt(order)}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Print Receipt
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, totalOrders)} of {totalOrders} orders
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onPageChange?.(page - 1)}
                  disabled={page === 0}
                  className="rounded-md border border-input bg-background px-3 py-1 text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => onPageChange?.(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="rounded-md border border-input bg-background px-3 py-1 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">No orders to display.</p>
        </div>
      )}
    </div>
  );
}
