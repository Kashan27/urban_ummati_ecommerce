"use client";

import { DollarSign, Package, ShoppingBag, Users } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { Order } from "@workspace/api-zod";

type StatsShape = {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  totalProducts: number;
  ordersByStatus: Record<string, number>;
  recentOrders: Order[];
};

type Props = {
  statsLoading: boolean;
  stats: StatsShape | undefined;
  statsDataPresent: boolean;
  onOrderStatusChange: (orderId: number, status: "received" | "processed" | "shipped") => void;
  onViewOrderDetails: (order: Order) => void;
  onPrintReceipt: (order: Order) => void;
};

export function DashboardSection({
  statsLoading,
  stats,
  statsDataPresent,
  onOrderStatusChange,
  onViewOrderDetails,
  onPrintReceipt,
}: Props) {
  return (
    <div>
      <div className="mb-8">
        <h2 className="font-serif text-2xl tracking-tight text-foreground">Dashboard</h2>
        <p className="mt-1 text-sm text-muted-foreground">Overview of orders, revenue, and fulfillment.</p>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-border bg-muted/40" />
          ))}
        </div>
      ) : stats && statsDataPresent ? (
        <>
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm" data-testid="stat-total-orders">
              <div className="mb-2 flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Total Orders</span>
              </div>
              <p className="font-serif text-3xl">{stats.totalOrders}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm" data-testid="stat-revenue">
              <div className="mb-2 flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-primary" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Revenue</span>
              </div>
              <p className="font-serif text-3xl">${stats.totalRevenue.toFixed(0)}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm" data-testid="stat-pending">
              <div className="mb-2 flex items-center gap-3">
                <Package className="h-5 w-5 text-primary" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Pending</span>
              </div>
              <p className="font-serif text-3xl">{stats.pendingOrders}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm" data-testid="stat-products">
              <div className="mb-2 flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Products</span>
              </div>
              <p className="font-serif text-3xl">{stats.totalProducts}</p>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Object.entries(stats.ordersByStatus).map(([status, count]) => (
              <div key={status} className="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
                <StatusBadge status={status} />
                <p className="mt-2 font-serif text-2xl">{count}</p>
              </div>
            ))}
          </div>

          <h3 className="mb-4 font-serif text-xl">Recent Orders</h3>
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted/80 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-4 text-left">Order</th>
                  <th className="p-4 text-left">Customer</th>
                  <th className="p-4 text-left">Total</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} data-testid={`row-order-${order.id}`}>
                    <td className="p-4 font-mono">#{order.id.toString().padStart(5, "0")}</td>
                    <td className="p-4">
                      <div>{order.customerName}</div>
                      <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                    </td>
                    <td className="p-4">${order.total.toFixed(2)}</td>
                    <td className="p-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            onOrderStatusChange(order.id, e.target.value as "received" | "processed" | "shipped")
                          }
                          className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                          data-testid={`select-order-status-${order.id}`}
                        >
                          <option value="received">Received</option>
                          <option value="processed">Processed</option>
                          <option value="shipped">Shipped</option>
                        </select>
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
                          Print
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}
