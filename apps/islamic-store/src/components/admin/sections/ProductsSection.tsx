"use client";

import type { UseFormReturn } from "react-hook-form";
import { Edit, Eye, Plus, Search, SlidersHorizontal, X, AlertCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
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
import { AdminProductDialogContent } from "@/components/admin/AdminProductDialog";
import type { AdminProduct, AdminCategory, AdminCollection } from "@/components/admin/types";
import type { ProductFormValues } from "@/components/admin/product-form-schema";
import { Link } from "@/lib/router";
import { cn } from "@/lib/utils";

type Props = {
  products: AdminProduct[] | undefined;
  total: number;
  facets:
    | {
        statuses: { active: number; draft: number; archived: number };
        stock: { inStock: number; outOfStock: number; lowStock: number };
        categories: Array<{ id: number; name: string; count: number }>;
      }
    | undefined;
  isLoading: boolean;
  errorMessage: string;
  hasInvalidPriceRange: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategoryIds: number[];
  onSelectedCategoryIdsChange: (ids: number[]) => void;
  statusFilter: "all" | "active" | "draft" | "archived";
  onStatusFilterChange: (value: "all" | "active" | "draft" | "archived") => void;
  stockFilter: "all" | "in_stock" | "out_of_stock" | "low_stock";
  onStockFilterChange: (value: "all" | "in_stock" | "out_of_stock" | "low_stock") => void;
  minPrice: string;
  onMinPriceChange: (value: string) => void;
  maxPrice: string;
  onMaxPriceChange: (value: string) => void;
  lowStockThreshold: number;
  onLowStockThresholdChange: (value: number) => void;
  page: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  categories: AdminCategory[] | undefined;
  collections: AdminCollection[] | undefined;
  allProducts: AdminProduct[] | undefined;
  isLoadingProducts?: boolean;
  productFetchError?: string;
  productForm: UseFormReturn<ProductFormValues>;
  imageUrls: string[];
  setImageUrls: React.Dispatch<React.SetStateAction<string[]>>;
  isProductDialogOpen: boolean;
  onProductDialogOpenChange: (open: boolean) => void;
  productDialogMode: "create" | "edit";
  productSaveError: string;
  isSavingProduct: boolean;
  updatingProductId: number | null;
  onSaveProduct: (values: ProductFormValues) => void;
  openCreateProductDialog: () => void;
  openEditProductDialog: (product: AdminProduct) => void;
  onToggleProductActive: (product: AdminProduct) => void;
  onDeleteProduct: (product: AdminProduct) => void;
};

export function ProductsSection({
  products,
  total,
  facets,
  isLoading,
  errorMessage,
  hasInvalidPriceRange,
  search,
  onSearchChange,
  selectedCategoryIds,
  onSelectedCategoryIdsChange,
  statusFilter,
  onStatusFilterChange,
  stockFilter,
  onStockFilterChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  lowStockThreshold,
  onLowStockThresholdChange,
  page,
  onPageChange,
  pageSize,
  categories,
  collections,
  allProducts,
  isLoadingProducts,
  productFetchError,
  productForm,
  imageUrls,
  setImageUrls,
  isProductDialogOpen,
  onProductDialogOpenChange,
  productDialogMode,
  productSaveError,
  isSavingProduct,
  updatingProductId,
  onSaveProduct,
  openCreateProductDialog,
  openEditProductDialog,
  onToggleProductActive,
  onDeleteProduct,
}: Props) {
  function handleCancelDialog() {
    onProductDialogOpenChange(false);
  }

  const categoryCountMap = new Map((facets?.categories || []).map((c) => [c.id, c.count]));
  const categoriesWithCounts = (categories || []).map((c) => ({
    ...c,
    count: categoryCountMap.get(c.id) ?? 0,
  }));

  // Ensure counts are treated as numbers to prevent string concatenation (e.g., "1" + "1" = "11")
  const statusCounts = {
    active: Number(facets?.statuses?.active || 0),
    draft: Number(facets?.statuses?.draft || 0),
    archived: Number(facets?.statuses?.archived || 0),
  };
  
  // "All" tab represents Active + Inactive (excluding archived)
  const activeDraftCount = statusCounts.active + statusCounts.draft;

  const totalPages = Math.ceil(total / pageSize);
  const startIndex = total > 0 ? page * pageSize + 1 : 0;
  const endIndex = Math.min((page + 1) * pageSize, total);

  const clearAllFilters = () => {
    onSearchChange("");
    onSelectedCategoryIdsChange([]);
    onStatusFilterChange("all");
    onStockFilterChange("all");
    onMinPriceChange("");
    onMaxPriceChange("");
    onLowStockThresholdChange(5);
    onPageChange(0);
  };

  const isFilterActive =
    search.trim() ||
    selectedCategoryIds.length ||
    statusFilter !== "all" ||
    stockFilter !== "all" ||
    minPrice.trim() ||
    maxPrice.trim() ||
    lowStockThreshold !== 5;

  const activeAdvancedFiltersCount = 
    (stockFilter !== "all" ? 1 : 0) + 
    (minPrice.trim() || maxPrice.trim() ? 1 : 0) + 
    (lowStockThreshold !== 5 ? 1 : 0);

  const toggleCategoryId = (id: number) => {
    if (selectedCategoryIds.includes(id)) {
      onSelectedCategoryIdsChange(selectedCategoryIds.filter((x) => x !== id));
    } else {
      onSelectedCategoryIdsChange([...selectedCategoryIds, id]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)]">
      <Dialog open={isProductDialogOpen} onOpenChange={onProductDialogOpenChange}>
        {/* Sticky Header and Filter Row */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 space-y-4 pb-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Products</h2>
              <p className="text-xs text-muted-foreground">Manage inventory and visibility</p>
            </div>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="h-8 gap-1.5 px-3 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
                data-testid="button-add-product"
                onClick={openCreateProductDialog}
              >
                <Plus className="h-3.5 w-3.5" /> Add Product
              </Button>
            </DialogTrigger>
          </div>

          <div className="rounded-lg border bg-card p-2 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[150px] max-w-sm">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search catalog..."
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="h-8 pl-8 text-xs bg-background border-input"
                  data-testid="input-admin-product-search"
                />
              </div>

              <div className="flex items-center gap-1 border-r pr-2 mr-1">
                {(
                  [
                    { key: "all", label: "All" },
                    { key: "active", label: "Active" },
                    { key: "draft", label: "Inactive" },
                  ] as const
                ).map((opt) => (
                  <Button
                    key={opt.key}
                    variant={statusFilter === opt.key ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-7 px-2.5 text-[11px] font-medium",
                      statusFilter === opt.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => onStatusFilterChange(opt.key)}
                    data-testid={`filter-status-${opt.key}`}
                  >
                    {opt.label}
                    <span className={cn(
                      "ml-1.5 text-[10px]",
                      statusFilter === opt.key ? "opacity-90" : "opacity-50"
                    )}>
                      {opt.key === 'all' ? activeDraftCount : statusCounts[opt.key as keyof typeof statusCounts]}
                    </span>
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs px-3 border-input">
                      <SlidersHorizontal className="h-3 w-3 text-primary" />
                      {selectedCategoryIds.length ? `${selectedCategoryIds.length} Selected` : "Category"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-56 p-0 shadow-lg border-border">
                    <div className="p-2 border-b bg-muted/30 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Categories</span>
                      {selectedCategoryIds.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 px-1.5 text-[10px] hover:text-primary"
                          onClick={() => onSelectedCategoryIdsChange([])}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <div className="max-h-60 overflow-auto p-1">
                      {categoriesWithCounts.map((c) => {
                        const checked = selectedCategoryIds.includes(c.id);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            className={cn(
                              "flex w-full items-center justify-between px-2 py-1.5 rounded text-xs hover:bg-accent",
                              checked && "bg-accent/50 text-primary font-medium"
                            )}
                            onClick={() => toggleCategoryId(c.id)}
                          >
                            <div className="flex items-center gap-2">
                              <Checkbox checked={checked} className="h-3.5 w-3.5 border-primary data-[state=checked]:bg-primary" onCheckedChange={() => toggleCategoryId(c.id)} />
                              <span>{c.name}</span>
                            </div>
                            <span className="text-[10px] opacity-60 font-mono">{c.count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={activeAdvancedFiltersCount > 0 ? "secondary" : "outline"} size="sm" className="h-8 gap-1.5 text-xs px-3 border-input">
                      <Filter className="h-3 w-3 text-primary" />
                      Filters
                      {activeAdvancedFiltersCount > 0 && (
                        <Badge variant="default" className="ml-1 h-4 w-4 p-0 justify-center text-[9px] rounded-full bg-primary text-primary-foreground">
                          {activeAdvancedFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-72 p-4 space-y-4 shadow-lg border-border">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">Advanced Filters</h4>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-primary hover:text-primary/80" onClick={clearAllFilters}>Reset</Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Inventory Status</Label>
                        <Select value={stockFilter} onValueChange={(v) => onStockFilterChange(v as any)}>
                          <SelectTrigger className="h-8 text-xs border-input">
                            <SelectValue placeholder="All Stock" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all" className="text-xs">All Inventory</SelectItem>
                            <SelectItem value="in_stock" className="text-xs text-emerald-600">In Stock</SelectItem>
                            <SelectItem value="out_of_stock" className="text-xs text-destructive">Out of Stock</SelectItem>
                            <SelectItem value="low_stock" className="text-xs text-amber-600">Low Stock Alert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Price Range ($)</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={minPrice}
                            onChange={(e) => onMinPriceChange(e.target.value)}
                            placeholder="Min"
                            className="h-8 text-xs border-input"
                          />
                          <span className="text-muted-foreground opacity-40">/</span>
                          <Input
                            value={maxPrice}
                            onChange={(e) => onMaxPriceChange(e.target.value)}
                            placeholder="Max"
                            className="h-8 text-xs border-input"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Low Stock Threshold</Label>
                        <Input
                          type="number"
                          value={String(lowStockThreshold)}
                          onChange={(e) => onLowStockThresholdChange(parseInt(e.target.value || "5", 10) || 5)}
                          className="h-8 text-xs border-input"
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {isFilterActive && (
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-[10px] text-destructive hover:bg-destructive/10" onClick={clearAllFilters}>
                    <X className="h-3 w-3 mr-1" /> Reset
                  </Button>
                )}
              </div>

              <div className="ml-auto hidden lg:block border-l pl-4">
                 <p className="text-[10px] text-muted-foreground font-medium">
                    {total > 0 ? (
                      <>Showing <span className="text-foreground font-bold">{startIndex}–{endIndex}</span> of <span className="text-foreground font-bold">{total}</span></>
                    ) : (
                      "No matches found"
                    )}
                 </p>
              </div>
            </div>
          </div>
        </div>

        <AdminProductDialogContent
          mode={productDialogMode}
          productForm={productForm}
          imageUrls={imageUrls}
          setImageUrls={setImageUrls}
          categories={categories}
          collections={collections}
          allProducts={allProducts}
          isLoadingProducts={isLoadingProducts}
          productFetchError={productFetchError}
          productSaveError={productSaveError}
          isSavingProduct={isSavingProduct}
          onSubmit={onSaveProduct}
          onCancel={handleCancelDialog}
        />
      </Dialog>

      <div className="flex-1 overflow-auto rounded-md border bg-card shadow-sm min-h-0 custom-scrollbar">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur-sm border-b shadow-sm">
            <tr className="text-muted-foreground font-medium">
              <th className="p-3 text-left font-semibold">Product</th>
              <th className="p-3 text-left font-semibold">Category</th>
              <th className="p-3 text-left font-semibold">Price</th>
              <th className="p-3 text-left font-semibold">Stock</th>
              <th className="p-3 text-left font-semibold">Sold</th>
              <th className="p-3 text-left font-semibold">Status</th>
              <th className="p-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading ? (
              Array.from({ length: 12 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  <td className="p-3"><div className="flex items-center gap-3"><div className="h-8 w-8 rounded bg-muted" /><div className="h-3 w-32 rounded bg-muted" /></div></td>
                  <td className="p-3"><div className="h-3 w-20 rounded bg-muted" /></td>
                  <td className="p-3"><div className="h-3 w-12 rounded bg-muted" /></td>
                  <td className="p-3"><div className="h-3 w-12 rounded bg-muted" /></td>
                  <td className="p-3"><div className="h-3 w-12 rounded bg-muted" /></td>
                  <td className="p-3"><div className="h-6 w-24 rounded-full bg-muted" /></td>
                  <td className="p-3 text-right"><div className="h-6 w-20 ml-auto rounded bg-muted" /></td>
                </tr>
              ))
            ) : (
              products?.map((product) => (
              <tr key={product.id} className="hover:bg-primary/[0.02] transition-colors group">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-9 w-9 rounded border border-border/50 object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-medium text-foreground truncate max-w-[150px] sm:max-w-[250px]">{product.name}</div>
                      <div className="flex gap-1 mt-0.5">
                        {product.featured && <Badge variant="outline" className="text-[8px] h-3.5 px-1 py-0 border-primary/30 text-primary font-bold">Featured</Badge>}
                        {product.isUpsell && <Badge variant="default" className="text-[8px] h-3.5 px-1 py-0 bg-primary text-primary-foreground font-bold border-none">Upsell</Badge>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">
                  <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] border border-border/50 font-medium">
                    {product.categoryName || "Uncat"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="font-bold text-foreground">${product.price.toFixed(2)}</div>
                  {product.comparePrice && <div className="text-[9px] text-muted-foreground line-through">${product.comparePrice.toFixed(2)}</div>}
                </td>
                <td className="p-3">
                  {typeof product.inventoryQuantity === "number" ? (
                    <span className="font-bold text-foreground tabular-nums">{product.inventoryQuantity}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="p-3">
                  <span className="font-bold text-foreground tabular-nums">{product.totalSold ?? 0}</span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-2 w-2 rounded-full shadow-sm",
                      product.status === "active" ? "bg-emerald-500 shadow-emerald-200" : product.status === "draft" ? "bg-amber-500 shadow-amber-200" : "bg-slate-400"
                    )} />
                    <span className="font-semibold capitalize text-foreground/80">{product.status === "active" ? "Active" : product.status === "draft" ? "Inactive" : "Archived"}</span>
                    {!product.inStock && <Badge variant="destructive" className="ml-1 text-[8px] h-3.5 px-1 py-0 font-bold border-none">Out</Badge>}
                    {product.inStock && product.inventoryQuantity !== null && product.inventoryQuantity <= lowStockThreshold && (
                      <Badge variant="outline" className="ml-1 text-[8px] h-3.5 px-1 py-0 border-amber-500 text-amber-600 bg-amber-50 font-bold">Low</Badge>
                    )}
                  </div>
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-1 transition-all duration-200">
                    <Link href={`/products/${product.id}`}>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full hover:bg-primary/5 hover:text-primary transition-colors"
                      onClick={() => openEditProductDialog(product)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Separator orientation="vertical" className="h-4 mx-1 my-auto hidden sm:block" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-7 px-2 text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-primary/5"
                      )}
                      onClick={() => onToggleProductActive(product)}
                      disabled={updatingProductId === product.id}
                    >
                      {product.status === "active" ? "Inactive" : "Active"}
                    </Button>
                  </div>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between text-[11px] py-3 px-1 border-t bg-background/50 backdrop-blur-sm">
          <p className="text-muted-foreground font-medium">
            Page <span className="font-bold text-foreground bg-muted px-2 py-0.5 rounded border">{page + 1}</span> of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[11px] px-3 font-bold border-input hover:bg-primary hover:text-primary-foreground transition-all"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0 || isLoading}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[11px] px-3 font-bold border-input hover:bg-primary hover:text-primary-foreground transition-all"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1 || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
