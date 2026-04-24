"use client";

import { useEffect, useState } from "react";
import {
  useGetAdminStats,
  useUpdateOrderStatus,
  useCreateFreeProductLink,
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
import type { AdminSection, AdminProduct, AdminCategory } from "@/components/admin/types";
import { AdminLoadingScreen } from "@/components/admin/AdminLoadingScreen";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { DashboardSection } from "@/components/admin/sections/DashboardSection";
import { ProductsSection } from "@/components/admin/sections/ProductsSection";
import { OrdersSection } from "@/components/admin/sections/OrdersSection";
import { CategoriesSection } from "@/components/admin/sections/CategoriesSection";
import { PromoSection } from "@/components/admin/sections/PromoSection";
import { SettingsSection } from "@/components/admin/sections/SettingsSection";
import { OrderDetailsDialog } from "@/components/admin/OrderDetailsDialog";
import { OrderReceipt } from "@/components/admin/OrderReceipt";
import type { Order } from "@workspace/api-zod";

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDescription, setConfirmDescription] = useState("");
  const [confirmLabel, setConfirmLabel] = useState("Confirm");
  const [confirmAction, setConfirmAction] = useState<(() => Promise<void> | void) | null>(null);
  const [confirmPending, setConfirmPending] = useState(false);
  const [freeProductId, setFreeProductId] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<ListOrdersStatus | undefined>(undefined);
  const [orderPage, setOrderPage] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: statsData, isLoading: statsLoading } = useGetAdminStats({
    query: { enabled: authenticated, queryKey: getGetAdminStatsQueryKey() },
  });

  const { data: ordersData, isLoading: ordersLoading } = useListOrders(
    {
      status: orderStatusFilter,
      limit: 50,
      offset: orderPage * 50,
    },
    {
      query: {
        enabled: authenticated && activeSection === "orders",
        queryKey: ["listOrders", orderStatusFilter, orderPage],
      },
    },
  );

  const { data: productsData } = useQuery<{ products: AdminProduct[]; total: number }>({
    enabled: authenticated && (activeSection === "products" || activeSection === "promo"),
    queryKey: ["adminProducts"],
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

  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active",
      price: 0,
      comparePrice: null,
      categoryId: 1,
      inStock: true,
      featured: false,
      isUpsell: false,
      upsellDiscount: null,
      colors: "gold,silver,black",
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

    return {
      ...values,
      status: values.status,
      price: values.price,
      comparePrice: values.comparePrice ?? null,
      categoryId: values.categoryId,
      upsellDiscount: values.upsellDiscount ?? null,
      imageUrl: normalizedImages[0] || "",
      images: normalizedImages,
      colors: values.colors.split(",").map((c) => c.trim()).filter(Boolean),
    };
  }

  function resetProductDialogForm() {
    setProductSaveError("");
    setEditingProductId(null);
    setProductDialogMode("create");
    setImageUrls([""]);
    productForm.reset({
      name: "",
      description: "",
      status: "active",
      price: 0,
      comparePrice: null,
      categoryId: categoriesData?.categories?.[0]?.id || 1,
      inStock: true,
      featured: false,
      isUpsell: false,
      upsellDiscount: null,
      colors: "gold,silver,black",
    });
  }

  function openCreateProductDialog() {
    resetProductDialogForm();
    setIsProductDialogOpen(true);
  }

  function openEditProductDialog(product: AdminProduct) {
    setProductDialogMode("edit");
    setEditingProductId(product.id);
    productForm.reset({
      name: product.name,
      description: product.description,
      status: (product.status || "active") as "draft" | "active",
      price: product.price,
      comparePrice: product.comparePrice ?? null,
      categoryId: product.categoryId || categoriesData?.categories?.[0]?.id || 1,
      inStock: product.inStock,
      featured: product.featured,
      isUpsell: product.isUpsell,
      upsellDiscount: product.upsellDiscount ?? null,
      colors: Array.isArray(product.colors) ? product.colors.join(",") : "",
    });
    setImageUrls(Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.imageUrl]);
    setIsProductDialogOpen(true);
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

      setIsProductDialogOpen(false);
      resetProductDialogForm();
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
    setConfirmTitle("Delete product?");
    setConfirmDescription(
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
    );
    setConfirmLabel("Delete Product");
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
        toast.success("Product deleted successfully");
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

  function handleUpdateOrderStatus(orderId: number, status: "received" | "processed" | "shipped") {
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
    setSelectedOrder(order);
    setTimeout(() => {
      window.print();
      if (order.status === "received") {
        handleUpdateOrderStatus(order.id, "processed");
      }
    }, 100);
  }

  function handleViewOrderDetails(order: Order) {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  }

  function handleGenerateFreeLink() {
    const id = parseInt(freeProductId);
    if (!id) return;
    createFreeLink.mutate(
      { data: { productId: id } },
      {
        onSuccess: (link) => {
          const baseUrl = window.location.origin;
          setGeneratedLink(`${baseUrl}/free-product/${link.token}`);
          queryClient.invalidateQueries({ queryKey: ["adminPromoLinks"] });
        },
      },
    );
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
    setConfirmTitle("Delete category?");
    setConfirmDescription(
      "This removes the category record. Products currently linked to this category will need reassignment.",
    );
    setConfirmLabel("Delete");
    setConfirmAction(() => async () => {
      setIsSavingCategory(true);
      try {
        const response = await fetch(`/api/admin/categories/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!response.ok) {
          const error = await response.json().catch(() => null);
          throw new Error(error?.error || "Failed to delete category");
        }
        await queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
        toast.success("Category deleted");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Delete failed");
        throw error;
      } finally {
        setIsSavingCategory(false);
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
      <div className="flex min-h-screen flex-col md:flex-row">
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
              />
            )}

            {activeSection === "products" && (
              <ProductsSection
                products={productsData?.products}
                categories={categoriesData?.categories}
                productForm={productForm}
                imageUrls={imageUrls}
                setImageUrls={setImageUrls}
                isProductDialogOpen={isProductDialogOpen}
                onProductDialogOpenChange={(open) => {
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
                page={orderPage}
                onPageChange={setOrderPage}
                totalOrders={ordersData?.total}
                onOrderStatusChange={handleUpdateOrderStatus}
                onViewOrderDetails={handleViewOrderDetails}
                onPrintReceipt={handlePrintReceipt}
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

            {activeSection === "promo" && (
              <PromoSection
                freeProductId={freeProductId}
                onFreeProductIdChange={setFreeProductId}
                generatedLink={generatedLink}
                products={productsData?.products}
                generatePending={createFreeLink.isPending}
                onGenerateLink={handleGenerateFreeLink}
                promoLinks={promoLinksData?.links}
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
      />

      <OrderReceipt order={selectedOrder} />

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
