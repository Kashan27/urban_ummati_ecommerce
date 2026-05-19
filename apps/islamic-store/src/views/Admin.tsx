"use client";

import { useEffect, useRef, useState } from "react";
import {
  useGetAdminStats,
  useUpdateOrderStatus,
  useCreateFreeProductLink,
  useUpdateFreeProductLink,
  useDeleteFreeProductLink,
  getGetAdminStatsQueryKey,
  useListOrders,
} from "@workspace/api-client-react";
import type { ListOrdersStatus } from "@workspace/api-zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ADMIN_NAV_ITEMS } from "@/components/admin/nav-config";
import { productSchema, type ProductFormValues } from "@/components/admin/product-form-schema";
import type { AdminSection, AdminProduct, AdminCategory, AdminCollection } from "@/components/admin/types";
import { AdminLoadingScreen } from "@/components/admin/AdminLoadingScreen";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { DashboardSection } from "@/components/admin/sections/DashboardSection";
import { ProductsSection } from "@/components/admin/sections/ProductsSection";
import { OrdersSection } from "@/components/admin/sections/OrdersSection";
import { CategoriesSection } from "@/components/admin/sections/CategoriesSection";
import { CollectionsSection } from "@/components/admin/sections/CollectionsSection";
import { PromoSection } from "@/components/admin/sections/PromoSection";
import { SettingsSection } from "@/components/admin/sections/SettingsSection";
import { OrderDetailsDialog } from "@/components/admin/OrderDetailsDialog";
import { OrderReceipt } from "@/components/admin/OrderReceipt";
import { OrderPackingSlip } from "@/components/admin/OrderPackingSlip";
import { OrderShippingLabel } from "@/components/admin/OrderShippingLabel";
import type { Order } from "@workspace/api-zod";

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

export function Admin({ section = "dashboard" }: { section?: AdminSection }) {
  const activeSection: AdminSection = ADMIN_NAV_ITEMS.some((item) => item.key === section)
    ? section
    : "dashboard";

  const [authReady, setAuthReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginPending, setLoginPending] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [productDialogMode, setProductDialogMode] = useState<"create" | "edit">("create");
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [updatingProductId, setUpdatingProductId] = useState<number | null>(null);
  const [productSaveError, setProductSaveError] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [newCollectionImageUrl, setNewCollectionImageUrl] = useState("");
  const [newCollectionShowOnHome, setNewCollectionShowOnHome] = useState(false);
  const [isSavingCollection, setIsSavingCollection] = useState(false);
  const [editingCollectionId, setEditingCollectionId] = useState<number | null>(null);
  const [editingCollectionName, setEditingCollectionName] = useState("");
  const [editingCollectionDescription, setEditingCollectionDescription] = useState("");
  const [editingCollectionImageUrl, setEditingCollectionImageUrl] = useState("");
  const [editingCollectionShowOnHome, setEditingCollectionShowOnHome] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDescription, setConfirmDescription] = useState("");
  const [confirmLabel, setConfirmLabel] = useState("Confirm");
  const [confirmAction, setConfirmAction] = useState<(() => Promise<void> | void) | null>(null);
  const [confirmPending, setConfirmPending] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<ListOrdersStatus | undefined>(undefined);
  const [orderPaymentStatusFilter, setOrderPaymentStatusFilter] = useState<"all" | "pending" | "paid" | "failed" | "refunded">("all");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderDateFrom, setOrderDateFrom] = useState("");
  const [orderDateTo, setOrderDateTo] = useState("");
  const [orderPage, setOrderPage] = useState(0);
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryIds, setProductCategoryIds] = useState<number[]>([]);
  const [productStatusFilter, setProductStatusFilter] = useState<"all" | "active" | "draft" | "archived">("all");
  const [productStockFilter, setProductStockFilter] = useState<"all" | "in_stock" | "out_of_stock" | "low_stock">(
    "all",
  );
  const [productMinPrice, setProductMinPrice] = useState("");
  const [productMaxPrice, setProductMaxPrice] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [productPage, setProductPage] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [printMode, setPrintMode] = useState<"receipt" | "packing-slip" | "shipping-label">("receipt");
  const queryClient = useQueryClient();
  const isProgrammaticClose = useRef(false);

  const { data: statsData, isLoading: statsLoading } = useGetAdminStats({
    query: { enabled: authenticated, queryKey: getGetAdminStatsQueryKey() },
  });

  // Custom orders query with date filters
  const { data: ordersData, isLoading: ordersLoading } = useQuery<{
    orders: Order[];
    total: number;
  }>({
    enabled: authenticated && activeSection === "orders",
    queryKey: ["listOrders", orderStatusFilter, orderPage, orderDateFrom, orderDateTo],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (orderStatusFilter) params.set("status", orderStatusFilter);
      if (orderDateFrom) params.set("dateFrom", orderDateFrom);
      if (orderDateTo) params.set("dateTo", orderDateTo);
      params.set("limit", "50");
      params.set("offset", String(orderPage * 50));

      const response = await fetch(`/api/orders?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to load orders");
      }
      
      return response.json();
    },
  });

  const productPageSize = 25;
  const debouncedProductSearch = useDebouncedValue(productSearch, 250);

  const priceMin = productMinPrice.trim() ? Number(productMinPrice) : undefined;
  const priceMax = productMaxPrice.trim() ? Number(productMaxPrice) : undefined;
  const hasInvalidPriceRange =
    typeof priceMin === "number" &&
    typeof priceMax === "number" &&
    Number.isFinite(priceMin) &&
    Number.isFinite(priceMax) &&
    priceMin > priceMax;

  const { data: productsListData, isLoading: productsLoading, error: productsError } = useQuery<{
    products: AdminProduct[];
    total: number;
    facets?: {
      statuses: { active: number; draft: number; archived: number };
      stock: { inStock: number; outOfStock: number; lowStock: number };
      categories: Array<{ id: number; name: string; count: number }>;
    };
  }>({
    enabled: authenticated && activeSection === "products" && !hasInvalidPriceRange,
    queryKey: [
      "adminProducts",
      "filtered",
      debouncedProductSearch,
      productCategoryIds,
      productStatusFilter,
      productStockFilter,
      productMinPrice,
      productMaxPrice,
      lowStockThreshold,
      productPage,
      productPageSize,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedProductSearch.trim()) params.set("q", debouncedProductSearch.trim());
      if (productCategoryIds.length) params.set("categoryIds", productCategoryIds.join(","));
      if (productStatusFilter !== "all") params.set("status", productStatusFilter);
      if (productStockFilter !== "all") params.set("stock", productStockFilter);
      if (productMinPrice.trim()) params.set("minPrice", productMinPrice.trim());
      if (productMaxPrice.trim()) params.set("maxPrice", productMaxPrice.trim());
      params.set("lowStockThreshold", String(lowStockThreshold));
      params.set("limit", String(productPageSize));
      params.set("offset", String(productPage * productPageSize));

      const response = await fetch(`/api/admin/products?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });
      const json = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(json?.error || "Failed to load admin products");
      }
      return json;
    },
  });

  const { data: promoProductsData } = useQuery<{ products: AdminProduct[]; total: number }>({
    enabled: authenticated && activeSection === "promo",
    queryKey: ["adminProducts", "promo"],
    queryFn: async () => {
      const response = await fetch("/api/admin/products", {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to load admin products");
      }
      return response.json();
    },
  });

  useEffect(() => {
    setProductPage(0);
  }, [
    productSearch,
    productCategoryIds,
    productStatusFilter,
    productStockFilter,
    productMinPrice,
    productMaxPrice,
    lowStockThreshold,
  ]);

  const { data: categoriesData } = useQuery<{ categories: AdminCategory[]; total: number }>({
    enabled: authenticated && (activeSection === "products" || activeSection === "categories"),
    queryKey: ["adminCategories"],
    queryFn: async () => {
      const response = await fetch("/api/admin/categories", {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to load admin categories");
      }
      return response.json();
    },
  });

  const { data: allProductsForSelection, isLoading: isLoadingAllProducts, error: allProductsError } = useQuery<{ products: AdminProduct[] }>({
    enabled: authenticated && isProductDialogOpen,
    queryKey: ["adminProducts", "all-for-selection"],
    queryFn: async () => {
      const response = await fetch("/api/admin/products?limit=1000", {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to load products for selection");
      return response.json();
    },
  });

  const { data: collectionsData } = useQuery<{ collections: AdminCollection[]; total: number }>({
    enabled: authenticated && (activeSection === "products" || activeSection === "collections"),
    queryKey: ["adminCollections"],
    queryFn: async () => {
      const response = await fetch("/api/admin/collections", {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to load admin collections");
      }
      return response.json();
    },
  });

  const { data: promoLinksData } = useQuery<{ links: any[]; total: number }>({
    enabled: authenticated && activeSection === "promo",
    queryKey: ["adminPromoLinks"],
    queryFn: async () => {
      const response = await fetch("/api/promo/free-product-link", {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to load admin promo links");
      }
      return response.json();
    },
  });

  const { data: settingsData } = useQuery<Record<string, string>>({
    enabled: authenticated && (activeSection === "promo" || activeSection === "settings"),
    queryKey: ["adminSettings"],
    queryFn: async () => {
      const response = await fetch("/api/admin/settings", {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to load admin settings");
      }
      return response.json();
    },
  });

  const updateStatus = useUpdateOrderStatus();
  const createFreeLink = useCreateFreeProductLink();
  const updateFreeLink = useUpdateFreeProductLink();
  const deleteFreeLink = useDeleteFreeProductLink();

  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active",
      price: 0,
      comparePrice: null,
      categoryId: 1,
      collectionIds: [],
      inStock: true,
      inventoryQuantity: null,
      featured: false,
      isUpsell: false,
      upsellDiscount: null,
      colors: [],
    },
  });

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const response = await fetch("/api/admin/auth/session", {
          method: "GET",
          credentials: "include",
        });

        if (!active) return;

        if (response.ok) {
          setAuthenticated(true);
        }
      } catch {
        if (!active) return;
      } finally {
        if (active) {
          setAuthReady(true);
        }
      }
    }

    checkSession();
    return () => {
      active = false;
    };
  }, []);

  async function handleLogin() {
    setPasswordError("");
    setLoginPending(true);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setPasswordError(data?.error || "Invalid username or password.");
        return;
      }

      setAuthenticated(true);
      setPassword("");
    } catch {
      setPasswordError("Unable to sign in right now. Please try again.");
    } finally {
      setLoginPending(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setAuthenticated(false);
      setPassword("");
      setPasswordError("");
    }
  }

  function getProductPayload(values: ProductFormValues) {
    const normalizedImages = imageUrls.map((url) => url.trim()).filter(Boolean);
    const quantity = values.inventoryQuantity;
    // Auto-update inStock based on quantity if quantity is set
    const inStock = typeof quantity === "number" ? quantity > 0 : values.inStock;

    return {
      ...values,
      inStock,
      status: values.status,
      price: values.price,
      comparePrice: values.comparePrice ?? null,
      categoryId: values.categoryId,
      upsellDiscount: values.upsellDiscount ?? null,
      imageUrl: normalizedImages[0] || "",
      images: normalizedImages,
      colors: Array.isArray(values.colors) ? values.colors : [],
      mainProductIds: values.mainProductIds,
    };
  }

  function resetProductDialogForm() {
    setProductSaveError("");
    setEditingProductId(null);
    setProductDialogMode("create");
    setIsSavingProduct(false);
    setImageUrls([""]);
    productForm.reset({
      name: "",
      description: "",
      status: "active",
      price: 0,
      comparePrice: null,
      categoryId: categoriesData?.categories?.[0]?.id || 1,
      collectionIds: [],
      inStock: true,
      inventoryQuantity: null,
      featured: false,
      isUpsell: false,
      upsellDiscount: null,
      colors: [],
      mainProductIds: [],
    });
  }

  function openCreateProductDialog() {
    isProgrammaticClose.current = false;
    resetProductDialogForm();
    setIsProductDialogOpen(true);
  }

  async function openEditProductDialog(product: AdminProduct) {
    isProgrammaticClose.current = false;
    setIsSavingProduct(false);
    setProductSaveError("");
    setProductDialogMode("edit");
    setEditingProductId(product.id);
    productForm.reset({
      name: product.name,
      description: product.description,
      status: (product.status || "active") as "draft" | "active",
      price: product.price,
      comparePrice: product.comparePrice ?? null,
      categoryId: product.categoryId || categoriesData?.categories?.[0]?.id || 1,
      collectionIds: [],
      inStock: product.inStock,
      inventoryQuantity: product.inventoryQuantity ?? null,
      featured: product.featured,
      isUpsell: product.isUpsell,
      upsellDiscount: product.upsellDiscount ?? null,
      colors: Array.isArray(product.colors) ? product.colors : [],
      mainProductIds: product.mainProductIds || [],
      weight: product.weight ?? null,
      length: product.length ?? null,
      width: product.width ?? null,
      height: product.height ?? null,
    });
    setImageUrls(Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.imageUrl]);
    setIsProductDialogOpen(true);

    try {
      const response = await fetch(`/api/admin/products/${product.id}/collections`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) return;
      const data = (await response.json().catch(() => null)) as { collectionIds?: number[] } | null;
      const ids = Array.isArray(data?.collectionIds) ? data!.collectionIds : [];
      productForm.setValue("collectionIds", ids);
    } catch {}
  }

  async function handleSaveProduct(values: ProductFormValues) {
    setProductSaveError("");
    const payload = getProductPayload(values);
    if (!payload.imageUrl) {
      productForm.setError("name", { message: "At least one image URL is required." });
      return;
    }
    if (!payload.categoryId) {
      productForm.setError("categoryId", { message: "Category is required." });
      return;
    }
    setIsSavingProduct(true);

    try {
      const isEdit = productDialogMode === "edit" && editingProductId;
      const endpoint = isEdit ? `/api/admin/products/${editingProductId}` : "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error || "Failed to save product");
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["adminProducts"] }),
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() }),
      ]);

      isProgrammaticClose.current = true;
      setIsProductDialogOpen(false);
    } catch (error) {
      setProductSaveError(error instanceof Error ? error.message : "Failed to save product");
    } finally {
      setIsSavingProduct(false);
    }
  }

  async function handleToggleProductActive(product: AdminProduct) {
    if (!product.categoryId) return;

    const nextStatus = product.status === "active" ? "draft" : "active";
    const nextLabel = nextStatus === "active" ? "active" : "inactive";

    setConfirmTitle(`Set product ${nextLabel}?`);
    setConfirmDescription(
      `This will mark "${product.name}" as ${nextLabel} and update storefront visibility rules.`,
    );
    setConfirmLabel(nextStatus === "active" ? "Set Active" : "Set Inactive");
    setConfirmAction(() => async () => {
      setUpdatingProductId(product.id);
      try {
        const response = await fetch(`/api/admin/products/${product.id}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: product.name,
            description: product.description,
            status: nextStatus,
            price: product.price,
            comparePrice: product.comparePrice,
            categoryId: product.categoryId,
            imageUrl: product.imageUrl,
            images: product.images?.length ? product.images : [product.imageUrl],
            inStock: product.inStock,
            featured: product.featured,
            isUpsell: product.isUpsell,
            upsellDiscount: product.upsellDiscount,
            colors: product.colors || [],
            weight: product.weight,
            length: product.length,
            width: product.width,
            height: product.height,
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => null);
          throw new Error(error?.error || "Failed to update product status");
        }

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["adminProducts"] }),
          queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() }),
        ]);
        toast.success(`Product set ${nextLabel}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Status update failed");
        throw error;
      } finally {
        setUpdatingProductId(null);
      }
    });
    setConfirmOpen(true);
  }

  async function handleDeleteProduct(product: AdminProduct) {
    setConfirmTitle("Archive product?");
    setConfirmDescription(
      `Are you sure you want to archive "${product.name}"? This will remove it from the storefront and mark it as archived in the admin catalog.`,
    );
    setConfirmLabel("Archive Product");
    setConfirmAction(() => async () => {
      setUpdatingProductId(product.id);
      try {
        const response = await fetch(`/api/admin/products/${product.id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!response.ok) {
          const error = await response.json().catch(() => null);
          throw new Error(error?.error || "Failed to delete product");
        }

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["adminProducts"] }),
          queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() }),
        ]);
        toast.success("Product archived successfully");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Deletion failed");
        throw error;
      } finally {
        setUpdatingProductId(null);
      }
    });
    setConfirmOpen(true);
  }

  async function handleUpdateSettings(updates: Record<string, string>) {
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error("Failed to update settings");
      }
      await queryClient.invalidateQueries({ queryKey: ["adminSettings"] });
      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    }
  }

  function handleUpdateOrderStatus(orderId: number, status: "received" | "processed" | "shipped" | "delivered") {
    updateStatus.mutate(
      { id: orderId, data: { status } },
      {
        onSuccess: (updatedOrder) => {
          queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
          queryClient.invalidateQueries({ queryKey: ["listOrders"] });
          if (selectedOrder?.id === orderId) {
            setSelectedOrder(updatedOrder as any);
          }
        },
      },
    );
  }

  function handlePrintReceipt(order: Order) {
    setPrintMode("receipt");
    setSelectedOrder(order);
    setTimeout(() => {
      window.print();
      if (order.status === "received") {
        handleUpdateOrderStatus(order.id, "processed");
      }
    }, 100);
  }

  function handlePrintPackingSlip(order: Order) {
    setPrintMode("packing-slip");
    setSelectedOrder(order);
    setTimeout(() => {
      window.print();
      if (order.status === "received") {
        handleUpdateOrderStatus(order.id, "processed");
      }
    }, 100);
  }

  function handlePrintShippingLabel(order: Order) {
    setPrintMode("shipping-label");
    setSelectedOrder(order);
    setTimeout(() => {
      window.print();
      if (order.status === "processed") {
        handleUpdateOrderStatus(order.id, "shipped");
      }
    }, 100);
  }

  function handleViewOrderDetails(order: Order) {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  }

  function handleGenerateFreeLink(data: any) {
    if (!data.productId) return;
    createFreeLink.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["adminPromoLinks"] });
          toast.success("Free product link generated");
        },
      },
    );
  }

  function handleUpdateFreeLink(id: string, updates: any) {
    updateFreeLink.mutate(
      { id: parseInt(id), data: updates },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["adminPromoLinks"] });
          toast.success("Link updated successfully");
        },
      }
    );
  }

  function handleDeleteFreeLink(id: string) {
    setConfirmTitle("Delete promo link?");
    setConfirmDescription("Are you sure you want to permanently delete this free product link?");
    setConfirmLabel("Delete Link");
    setConfirmAction(() => async () => {
      deleteFreeLink.mutate(
        { id: parseInt(id) },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminPromoLinks"] });
            toast.success("Link deleted");
          },
        }
      );
    });
    setConfirmOpen(true);
  }

  function handleArchiveFreeLink(id: string) {
    handleUpdateFreeLink(id, { status: "archived" });
  }

  async function handleCreateCategory() {
    const name = newCategoryName.trim();
    if (!name) return;
    setIsSavingCategory(true);
    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, isActive: true }),
      });
      if (!response.ok) {
        throw new Error("Failed to create category");
      }
      setNewCategoryName("");
      await queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
    } finally {
      setIsSavingCategory(false);
    }
  }

  async function handleUpdateCategory(id: number) {
    const name = editingCategoryName.trim();
    if (!name) return;
    setIsSavingCategory(true);
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        throw new Error("Failed to update category");
      }
      setEditingCategoryId(null);
      setEditingCategoryName("");
      await queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
    } finally {
      setIsSavingCategory(false);
    }
  }

  async function handleDeleteCategory(id: number) {
    setConfirmTitle("Deactivate category?");
    setConfirmDescription(
      "This marks the category as inactive. It will no longer appear on the storefront, but existing product links will be preserved for history.",
    );
    setConfirmLabel("Deactivate");
    setConfirmAction(() => async () => {
      setIsSavingCategory(true);
      try {
        const response = await fetch(`/api/admin/categories/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!response.ok) {
          const error = await response.json().catch(() => null);
          throw new Error(error?.error || "Failed to deactivate category");
        }
        await queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
        toast.success("Category deactivated");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Deactivation failed");
        throw error;
      } finally {
        setIsSavingCategory(false);
      }
    });
    setConfirmOpen(true);
  }

  async function handleCreateCollection() {
    const name = newCollectionName.trim();
    if (!name) return;
    setIsSavingCollection(true);
    try {
      const response = await fetch("/api/admin/collections", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: newCollectionDescription.trim() || null,
          imageUrl: newCollectionImageUrl.trim() || null,
          isActive: true,
          showOnHome: newCollectionShowOnHome
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create collection");
      }
      setNewCollectionName("");
      setNewCollectionDescription("");
      setNewCollectionImageUrl("");
      setNewCollectionShowOnHome(false);
      await queryClient.invalidateQueries({ queryKey: ["adminCollections"] });
    } finally {
      setIsSavingCollection(false);
    }
  }

  async function handleUpdateCollection(id: number) {
    const name = editingCollectionName.trim();
    if (!name) return;
    setIsSavingCollection(true);
    try {
      const response = await fetch(`/api/admin/collections/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: editingCollectionDescription.trim() || null,
          imageUrl: editingCollectionImageUrl.trim() || null,
          showOnHome: editingCollectionShowOnHome,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update collection");
      }
      setEditingCollectionId(null);
      setEditingCollectionName("");
      setEditingCollectionDescription("");
      setEditingCollectionImageUrl("");
      setEditingCollectionShowOnHome(false);
      await queryClient.invalidateQueries({ queryKey: ["adminCollections"] });
    } finally {
      setIsSavingCollection(false);
    }
  }

  async function handleDeleteCollection(id: number) {
    setConfirmTitle("Deactivate collection?");
    setConfirmDescription(
      "This marks the collection as inactive. It will no longer be visible on the storefront, but product relationships are preserved for history.",
    );
    setConfirmLabel("Deactivate");
    setConfirmAction(() => async () => {
      setIsSavingCollection(true);
      try {
        const response = await fetch(`/api/admin/collections/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!response.ok) {
          const error = await response.json().catch(() => null);
          throw new Error(error?.error || "Failed to deactivate collection");
        }
        await queryClient.invalidateQueries({ queryKey: ["adminCollections"] });
        toast.success("Collection deactivated");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Deactivation failed");
        throw error;
      } finally {
        setIsSavingCollection(false);
      }
    });
    setConfirmOpen(true);
  }

  async function handleConfirmSubmit() {
    if (!confirmAction) return;
    setConfirmPending(true);
    try {
      await confirmAction();
      setConfirmOpen(false);
      setConfirmAction(null);
    } finally {
      setConfirmPending(false);
    }
  }

  const stats = statsData;

  if (!authReady) {
    return <AdminLoadingScreen />;
  }

  if (!authenticated) {
    return (
      <AdminLoginForm
        username={username}
        password={password}
        passwordError={passwordError}
        loginPending={loginPending}
        onUsernameChange={setUsername}
        onPasswordChange={setPassword}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex min-h-screen flex-col md:flex-row no-print">
        <AdminSidebar navItems={ADMIN_NAV_ITEMS} activeSection={activeSection} onLogout={handleLogout} />

        <main className="min-h-screen min-w-0 flex-1 px-4 py-8 md:px-8 lg:px-10">
          <div className="mx-auto max-w-6xl">
            {activeSection === "dashboard" && (
              <DashboardSection
                statsLoading={statsLoading}
                stats={stats as any}
                statsDataPresent={Boolean(stats)}
                onOrderStatusChange={handleUpdateOrderStatus}
                onViewOrderDetails={handleViewOrderDetails}
                onPrintReceipt={handlePrintReceipt}
                onPrintPackingSlip={handlePrintPackingSlip}
                onPrintShippingLabel={handlePrintShippingLabel}
              />
            )}

            {activeSection === "products" && (
              <ProductsSection
                products={productsListData?.products}
                total={productsListData?.total ?? 0}
                facets={productsListData?.facets}
                isLoading={productsLoading}
                errorMessage={productsError instanceof Error ? productsError.message : ""}
                hasInvalidPriceRange={hasInvalidPriceRange}
                search={productSearch}
                onSearchChange={setProductSearch}
                selectedCategoryIds={productCategoryIds}
                onSelectedCategoryIdsChange={setProductCategoryIds}
                statusFilter={productStatusFilter}
                onStatusFilterChange={setProductStatusFilter}
                stockFilter={productStockFilter}
                onStockFilterChange={setProductStockFilter}
                minPrice={productMinPrice}
                onMinPriceChange={setProductMinPrice}
                maxPrice={productMaxPrice}
                onMaxPriceChange={setProductMaxPrice}
                lowStockThreshold={lowStockThreshold}
                onLowStockThresholdChange={setLowStockThreshold}
                page={productPage}
                onPageChange={setProductPage}
                pageSize={productPageSize}
                categories={categoriesData?.categories}
                collections={collectionsData?.collections}
                allProducts={allProductsForSelection?.products}
                isLoadingProducts={isLoadingAllProducts}
                productFetchError={allProductsError instanceof Error ? allProductsError.message : ""}
                productForm={productForm}
                imageUrls={imageUrls}
                setImageUrls={setImageUrls}
                isProductDialogOpen={isProductDialogOpen}
                onProductDialogOpenChange={(open) => {
                  if (!open && isProgrammaticClose.current) {
                    // Skip reset — already handled by the caller (handleSaveProduct)
                    isProgrammaticClose.current = false;
                    setIsProductDialogOpen(false);
                    return;
                  }
                  setIsProductDialogOpen(open);
                  if (!open) resetProductDialogForm();
                }}
                productDialogMode={productDialogMode}
                productSaveError={productSaveError}
                isSavingProduct={isSavingProduct}
                updatingProductId={updatingProductId}
                onSaveProduct={handleSaveProduct}
                openCreateProductDialog={openCreateProductDialog}
                openEditProductDialog={openEditProductDialog}
                onToggleProductActive={handleToggleProductActive}
                onDeleteProduct={handleDeleteProduct}
              />
            )}

            {activeSection === "orders" && (
              <OrdersSection
                orders={ordersData?.orders}
                isLoading={ordersLoading}
                statusFilter={orderStatusFilter}
                onStatusFilterChange={setOrderStatusFilter}
                paymentStatusFilter={orderPaymentStatusFilter}
                onPaymentStatusFilterChange={setOrderPaymentStatusFilter}
                searchQuery={orderSearchQuery}
                onSearchQueryChange={setOrderSearchQuery}
                dateFrom={orderDateFrom}
                onDateFromChange={setOrderDateFrom}
                dateTo={orderDateTo}
                onDateToChange={setOrderDateTo}
                page={orderPage}
                onPageChange={setOrderPage}
                totalOrders={ordersData?.total}
                onOrderStatusChange={handleUpdateOrderStatus}
                onViewOrderDetails={handleViewOrderDetails}
                onPrintReceipt={handlePrintReceipt}
                onPrintPackingSlip={handlePrintPackingSlip}
                onPrintShippingLabel={handlePrintShippingLabel}
              />
            )}

            {activeSection === "categories" && (
              <CategoriesSection
                categories={categoriesData?.categories}
                newCategoryName={newCategoryName}
                onNewCategoryNameChange={setNewCategoryName}
                isSavingCategory={isSavingCategory}
                editingCategoryId={editingCategoryId}
                editingCategoryName={editingCategoryName}
                onEditingCategoryNameChange={setEditingCategoryName}
                onStartEdit={(category) => {
                  setEditingCategoryId(category.id);
                  setEditingCategoryName(category.name);
                }}
                onCancelEdit={() => {
                  setEditingCategoryId(null);
                  setEditingCategoryName("");
                }}
                onCreateCategory={handleCreateCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
              />
            )}

            {activeSection === "collections" && (
              <CollectionsSection
                collections={collectionsData?.collections}
                newCollectionName={newCollectionName}
                onNewCollectionNameChange={setNewCollectionName}
                newCollectionDescription={newCollectionDescription}
                onNewCollectionDescriptionChange={setNewCollectionDescription}
                newCollectionImageUrl={newCollectionImageUrl}
                onNewCollectionImageUrlChange={setNewCollectionImageUrl}
                newCollectionShowOnHome={newCollectionShowOnHome}
                onNewCollectionShowOnHomeChange={setNewCollectionShowOnHome}
                isSavingCollection={isSavingCollection}
                editingCollectionId={editingCollectionId}
                editingCollectionName={editingCollectionName}
                onEditingCollectionNameChange={setEditingCollectionName}
                editingCollectionDescription={editingCollectionDescription}
                onEditingCollectionDescriptionChange={setEditingCollectionDescription}
                editingCollectionImageUrl={editingCollectionImageUrl}
                onEditingCollectionImageUrlChange={setEditingCollectionImageUrl}
                editingCollectionShowOnHome={editingCollectionShowOnHome}
                onEditingCollectionShowOnHomeChange={setEditingCollectionShowOnHome}
                onStartEdit={(collection) => {
                  setEditingCollectionId(collection.id);
                  setEditingCollectionName(collection.name);
                  setEditingCollectionDescription(collection.description || "");
                  setEditingCollectionImageUrl(collection.imageUrl || "");
                  setEditingCollectionShowOnHome(collection.showOnHome);
                }}
                onCancelEdit={() => {
                  setEditingCollectionId(null);
                  setEditingCollectionName("");
                  setEditingCollectionDescription("");
                  setEditingCollectionImageUrl("");
                  setEditingCollectionShowOnHome(false);
                }}
                onCreateCollection={handleCreateCollection}
                onUpdateCollection={handleUpdateCollection}
                onDeleteCollection={handleDeleteCollection}
              />
            )}

            {activeSection === "promo" && (
              <PromoSection
                products={promoProductsData?.products}
                generatePending={createFreeLink.isPending}
                onGenerateLink={handleGenerateFreeLink}
                promoLinks={promoLinksData?.links}
                onUpdateLink={handleUpdateFreeLink}
                onDeleteLink={handleDeleteFreeLink}
                onArchiveLink={handleArchiveFreeLink}
              />
            )}

            {activeSection === "settings" && (
              <SettingsSection settings={settingsData} onUpdateSettings={handleUpdateSettings} />
            )}
          </div>
        </main>
      </div>

      <OrderDetailsDialog
        order={selectedOrder}
        open={isOrderDetailsOpen}
        onOpenChange={setIsOrderDetailsOpen}
        onOrderUpdated={setSelectedOrder}
        onPrintReceipt={handlePrintReceipt}
        onPrintPackingSlip={handlePrintPackingSlip}
        onPrintShippingLabel={handlePrintShippingLabel}
      />

      {printMode === "receipt" && <OrderReceipt order={selectedOrder} />}
      {printMode === "packing-slip" && <OrderPackingSlip order={selectedOrder} />}
      {printMode === "shipping-label" && <OrderShippingLabel order={selectedOrder} />}

      <AdminConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open && !confirmPending) {
            setConfirmOpen(false);
            setConfirmAction(null);
          }
        }}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel={confirmLabel}
        pending={confirmPending}
        onConfirm={handleConfirmSubmit}
      />
    </div>
  );
}
