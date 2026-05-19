"use client";

import type { ListOrdersStatus, Order } from "@workspace/api-zod";
import { Search, SlidersHorizontal, X, Calendar, CreditCard, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerInput } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";

type PaymentStatus = "all" | "pending" | "paid" | "failed" | "refunded";

interface OrdersSectionProps {
  orders: Order[] | undefined;
  isLoading?: boolean;
  statusFilter?: ListOrdersStatus;
  onStatusFilterChange?: (status: ListOrdersStatus | undefined) => void;
  paymentStatusFilter?: PaymentStatus;
  onPaymentStatusFilterChange?: (status: PaymentStatus) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  dateFrom?: string;
  onDateFromChange?: (date: string) => void;
  dateTo?: string;
  onDateToChange?: (date: string) => void;
  page?: number;
  onPageChange?: (page: number) => void;
  totalOrders?: number;
  onOrderStatusChange: (orderId: number, status: "received" | "processed" | "shipped" | "delivered") => void;
  onViewOrderDetails: (order: Order) => void;
  onPrintReceipt: (order: Order) => void;
  onPrintPackingSlip: (order: Order) => void;
  onPrintShippingLabel: (order: Order) => void;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  received: { label: "Received", color: "bg-blue-500" },
  processed: { label: "Processed", color: "bg-amber-500" },
  shipped: { label: "Shipped", color: "bg-emerald-500" },
  delivered: { label: "Delivered", color: "bg-purple-500" },
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  all: "All Payments",
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

export function OrdersSection({
  orders,
  isLoading,
  statusFilter,
  onStatusFilterChange,
  paymentStatusFilter = "all",
  onPaymentStatusFilterChange,
  searchQuery = "",
  onSearchQueryChange,
  dateFrom = "",
  onDateFromChange,
  dateTo = "",
  onDateToChange,
  page = 0,
  onPageChange,
  totalOrders = 0,
  onOrderStatusChange,
  onViewOrderDetails,
  onPrintReceipt,
  onPrintPackingSlip,
  onPrintShippingLabel,
}: OrdersSectionProps) {
  const pageSize = 50;
  const totalPages = Math.ceil(totalOrders / pageSize);

  const clearAllFilters = () => {
    onStatusFilterChange?.(undefined);
    onPaymentStatusFilterChange?.("all");
    onSearchQueryChange?.("");
    onDateFromChange?.("");
    onDateToChange?.("");
    onPageChange?.(0);
  };

  const isFilterActive =
    statusFilter ||
    paymentStatusFilter !== "all" ||
    searchQuery.trim() ||
    dateFrom ||
    dateTo;

  const activeFiltersCount =
    (statusFilter ? 1 : 0) +
    (paymentStatusFilter !== "all" ? 1 : 0) +
    (dateFrom || dateTo ? 1 : 0);

  const startIndex = totalOrders > 0 ? page * pageSize + 1 : 0;
  const endIndex = Math.min((page + 1) * pageSize, totalOrders);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)]">
      {/* Sticky Header and Filter Row */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 space-y-4 pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Orders</h2>
            <p className="text-xs text-muted-foreground">Review and update fulfillment status</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-2 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[150px] max-w-sm">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => onSearchQueryChange?.(e.target.value)}
                className="h-8 pl-8 text-xs bg-background border-input"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 border-r pr-2 mr-1">
              {(
                [
                  { key: "all", label: "All" },
                  { key: "received", label: "Received" },
                  { key: "processed", label: "Processed" },
                  { key: "shipped", label: "Shipped" },
                  { key: "delivered", label: "Delivered" },
                ] as const
              ).map((opt) => (
                <Button
                  key={opt.key}
                  variant={(statusFilter || "all") === opt.key ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-7 px-2.5 text-[11px] font-medium",
                    (statusFilter || "all") === opt.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => onStatusFilterChange?.(opt.key === "all" ? undefined : (opt.key as ListOrdersStatus))}
                >
                  {opt.label}
                </Button>
              ))}
            </div>

            {/* Advanced Filters Popover */}
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 gap-1.5 text-xs px-3 border-input",
                      activeFiltersCount > 0 && "border-primary text-primary"
                    )}
                  >
                    <SlidersHorizontal className="h-3 w-3" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge variant="default" className="ml-1 h-4 min-w-4 px-1 text-[10px]">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-72 p-4 shadow-lg border-border">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">Advanced Filters</h4>
                      {isFilterActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-[11px] text-muted-foreground hover:text-primary"
                          onClick={clearAllFilters}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Clear
                        </Button>
                      )}
                    </div>

                    {/* Payment Status Filter */}
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                        <CreditCard className="h-3 w-3" />
                        Payment Status
                      </Label>
                      <Select
                        value={paymentStatusFilter}
                        onValueChange={(v) => onPaymentStatusFilterChange?.(v as PaymentStatus)}
                      >
                        <SelectTrigger className="h-8 text-xs border-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(paymentStatusLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value} className="text-xs">
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    {/* Date Range Filters */}
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        Date Range
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[10px] text-muted-foreground mb-1 block">From</Label>
                          <DatePickerInput
                            value={dateFrom}
                            onChange={(value) => onDateFromChange?.(value)}
                            placeholder="Pick date"
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground mb-1 block">To</Label>
                          <DatePickerInput
                            value={dateTo}
                            onChange={(value) => onDateToChange?.(value)}
                            placeholder="Pick date"
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Results Count */}
            <div className="ml-auto hidden lg:block border-l pl-4">
              <p className="text-[10px] text-muted-foreground font-medium">
                {totalOrders > 0 ? (
                  <>
                    Showing <span className="text-foreground font-bold">{startIndex}–{endIndex}</span> of{" "}
                    <span className="text-foreground font-bold">{totalOrders}</span>
                  </>
                ) : (
                  "No orders found"
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="flex-1 overflow-auto rounded-md border bg-card shadow-sm min-h-0 custom-scrollbar">
        {orders?.length ? (
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur-sm border-b shadow-sm">
              <tr className="text-muted-foreground font-medium">
                <th className="p-3 text-left font-semibold">Order #</th>
                <th className="p-3 text-left font-semibold">Customer</th>
                <th className="p-3 text-left font-semibold">Items</th>
                <th className="p-3 text-left font-semibold">Total</th>
                <th className="p-3 text-left font-semibold">Date</th>
                <th className="p-3 text-left font-semibold">Status</th>
                <th className="p-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-primary/[0.02] transition-colors group">
                  <td className="p-3 font-mono text-muted-foreground">
                    #{order.id.toString().padStart(5, "0")}
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-foreground">{order.customerName}</div>
                    <div className="text-[10px] text-muted-foreground">{order.customerEmail}</div>
                  </td>
                  <td className="p-3 text-muted-foreground">{order.items.length} item(s)</td>
                  <td className="p-3">
                    <span className="font-bold text-foreground">${order.total.toFixed(2)}</span>
                  </td>
                  <td className="p-3 text-muted-foreground text-[11px]">
                    {new Date(order.createdAt).toLocaleDateString("en-CA")}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full shadow-sm",
                          order.status === "received" && "bg-blue-500 shadow-blue-200",
                          order.status === "processed" && "bg-amber-500 shadow-amber-200",
                          order.status === "shipped" && "bg-emerald-500 shadow-emerald-200",
                          order.status === "delivered" && "bg-purple-500 shadow-purple-200"
                        )}
                      />
                      <select
                        value={order.status}
                        onChange={(e) =>
                          onOrderStatusChange(order.id, e.target.value as "received" | "processed" | "shipped" | "delivered")
                        }
                        className="h-7 rounded-md border border-input bg-background px-2 text-[11px] font-medium uppercase tracking-wider"
                      >
                        <option value="received">Received</option>
                        <option value="processed">Processed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[10px] font-medium text-muted-foreground hover:text-foreground"
                        onClick={() => onViewOrderDetails(order)}
                      >
                        Details
                      </Button>
                      {order.status === "received" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[10px] font-medium text-primary hover:text-primary"
                          onClick={() => onPrintPackingSlip(order)}
                        >
                          Pack
                        </Button>
                      )}
                      {order.status === "processed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[10px] font-medium text-primary hover:text-primary"
                          onClick={() => onPrintShippingLabel(order)}
                        >
                          Ship
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[10px] font-medium text-muted-foreground hover:text-foreground"
                        onClick={() => onPrintReceipt(order)}
                      >
                        Receipt
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium text-foreground">No orders found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {isFilterActive ? "Try adjusting your filters" : "Orders will appear here when customers place them"}
            </p>
            {isFilterActive && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 h-8 text-xs"
                onClick={clearAllFilters}
              >
                <X className="h-3 w-3 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-4 border-t">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{startIndex}–{endIndex}</span> of{" "}
            <span className="font-medium text-foreground">{totalOrders}</span> orders
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => onPageChange?.(page - 1)}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
