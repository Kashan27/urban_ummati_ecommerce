"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Edit, Eye, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AdminProductDialogContent } from "@/components/admin/AdminProductDialog";
import type { AdminProduct, AdminCategory, AdminCollection } from "@/components/admin/types";
import type { ProductFormValues } from "@/components/admin/product-form-schema";
import { Link } from "@/lib/router";

type Props = {
  products: AdminProduct[] | undefined;
  categories: AdminCategory[] | undefined;
  collections: AdminCollection[] | undefined;
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
  categories,
  collections,
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
  const [searchTerm, setSearchTerm] = useState("");

  function handleCancelDialog() {
    onProductDialogOpenChange(false);
  }

  const filteredProducts = products?.filter((product) => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Dialog open={isProductDialogOpen} onOpenChange={onProductDialogOpenChange}>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-serif text-2xl tracking-tight">Products</h2>
              <p className="mt-1 text-sm text-muted-foreground">Manage catalog, pricing, and storefront visibility.</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <DialogTrigger asChild>
            <Button
              className="shrink-0 uppercase tracking-widest text-xs"
              data-testid="button-add-product"
              onClick={openCreateProductDialog}
            >
              <Plus className="mr-1 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
        </div>

        <AdminProductDialogContent
          mode={productDialogMode}
          productForm={productForm}
          imageUrls={imageUrls}
          setImageUrls={setImageUrls}
          categories={categories}
          collections={collections}
          productSaveError={productSaveError}
          isSavingProduct={isSavingProduct}
          onSubmit={onSaveProduct}
          onCancel={handleCancelDialog}
        />
      </Dialog>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/80 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-4 text-left">Product</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Price</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredProducts?.map((product) => (
              <tr key={product.id} data-testid={`row-product-${product.id}`}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-10 w-10 rounded-md bg-muted object-cover"
                    />
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="mt-0.5 flex gap-1">
                        {product.featured ? (
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">Featured</span>
                        ) : null}
                        {product.isUpsell ? (
                          <span className="rounded bg-secondary/10 px-1.5 py-0.5 text-xs text-secondary-foreground">
                            Upsell
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">{product.categoryName || "—"}</td>
                <td className="p-4">${product.price.toFixed(2)}</td>
                <td className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        product.status === "active" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {product.status === "active" ? "Active" : "Inactive"}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        product.inStock ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/products/${product.id}`}>
                      <Button variant="outline" size="sm" data-testid={`button-view-product-${product.id}`}>
                        <Eye className="h-3 w-3" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditProductDialog(product)}
                      data-testid={`button-edit-product-${product.id}`}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleProductActive(product)}
                      disabled={updatingProductId === product.id}
                      data-testid={`button-toggle-product-active-${product.id}`}
                    >
                      {updatingProductId === product.id
                        ? "Updating..."
                        : product.status === "active"
                          ? "Inactive"
                          : "Active"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteProduct(product)}
                      className="text-destructive hover:bg-destructive/10"
                      data-testid={`button-delete-product-${product.id}`}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
