"use client";

import type { UseFormReturn } from "react-hook-form";
import { useRef, useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { AdminCategory, AdminCollection } from "@/components/admin/types";
import type { ProductFormValues } from "@/components/admin/product-form-schema";

type Props = {
  mode: "create" | "edit";
  productForm: UseFormReturn<ProductFormValues>;
  imageUrls: string[];
  setImageUrls: React.Dispatch<React.SetStateAction<string[]>>;
  categories: AdminCategory[] | undefined;
  collections: AdminCollection[] | undefined;
  productSaveError: string;
  isSavingProduct: boolean;
  onSubmit: (values: ProductFormValues) => void;
};

export function AdminProductDialogContent({
  mode,
  productForm,
  imageUrls,
  setImageUrls,
  categories,
  collections,
  productSaveError,
  isSavingProduct,
  onSubmit,
  onCancel,
}: Props & { onCancel: () => void }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadPending, setUploadPending] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const uploadSelectedFile = async () => {
    const file = fileInputRef.current?.files?.[0] ?? null;
    if (!file) return;

    setUploadError("");
    setUploadPending(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/uploads/product-image", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "Upload failed");
      }

      const data = (await response.json()) as { url: string };
      const uploadedUrl = data.url;
      setImageUrls((prev) => {
        const next = [...prev];
        const idx = next.findIndex((u) => !u.trim());
        if (idx >= 0) next[idx] = uploadedUrl;
        else next.push(uploadedUrl);
        return next;
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadPending(false);
    }
  };

  return (
    <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">{mode === "edit" ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        <Form {...productForm}>
          <form onSubmit={productForm.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={productForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-xs uppercase tracking-wider">Product Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-product-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={productForm.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider">Price (CAD)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} data-testid="input-product-price" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={productForm.control}
                name="comparePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider">Compare Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={productForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider">Status</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        data-testid="select-product-status"
                      >
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={productForm.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider">Category</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        value={String(field.value ?? "")}
                        onChange={(event) => field.onChange(parseInt(event.target.value, 10))}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {(categories || [])
                          .filter((c) => c.isActive)
                          .map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        {!categories?.length && (
                          <>
                            <option value={1}>Wall Art</option>
                          </>
                        )}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={productForm.control}
                name="collectionIds"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-xs uppercase tracking-wider">Collections</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-1 gap-2 rounded-md border border-input bg-background p-3 sm:grid-cols-2">
                        {(collections || [])
                          .filter((c) => c.isActive)
                          .map((collection) => {
                            const checked = Array.isArray(field.value)
                              ? field.value.includes(collection.id)
                              : false;
                            return (
                              <label
                                key={collection.id}
                                className="flex items-center gap-2 text-sm text-foreground"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(event) => {
                                    const current = Array.isArray(field.value) ? field.value : [];
                                    const next = event.target.checked
                                      ? Array.from(new Set([...current, collection.id]))
                                      : current.filter((id) => id !== collection.id);
                                    field.onChange(next);
                                  }}
                                  className="accent-primary"
                                />
                                <span>{collection.name}</span>
                              </label>
                            );
                          })}
                        {!collections?.length ? (
                          <div className="text-sm text-muted-foreground">
                            Create a collection first to assign products.
                          </div>
                        ) : null}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="col-span-2 space-y-2">
                <label className="text-xs uppercase tracking-wider">Product Images</label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="w-full text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={uploadSelectedFile}
                    disabled={uploadPending}
                  >
                    {uploadPending ? "Uploading..." : "Upload"}
                  </Button>
                </div>
                {uploadError ? <p className="text-sm text-destructive">{uploadError}</p> : null}
                {imageUrls.map((url, index) => (
                  <div key={`${index}-${url}`} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={url}
                        onChange={(event) => {
                          const next = [...imageUrls];
                          next[index] = event.target.value;
                          setImageUrls(next);
                        }}
                        placeholder="https://..."
                        data-testid={`input-product-image-${index}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={index === 0}
                        onClick={() => {
                          const next = [...imageUrls];
                          const [selected] = next.splice(index, 1);
                          next.unshift(selected);
                          setImageUrls(next);
                        }}
                      >
                        Primary
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={imageUrls.length === 1}
                        onClick={() => {
                          const next = imageUrls.filter((_, i) => i !== index);
                          setImageUrls(next.length ? next : [""]);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                    {url.trim() ? (
                      <div className="h-24 w-24 overflow-hidden rounded-md border border-border bg-muted">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setImageUrls((prev) => [...prev, ""])}
                  data-testid="button-add-image-url"
                >
                  Add Image
                </Button>
                <p className="text-xs text-muted-foreground">First image is used as cover image.</p>
              </div>
              <FormField
                control={productForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-xs uppercase tracking-wider">Description</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={3}
                        className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={productForm.control}
                name="colors"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-xs uppercase tracking-wider">Colors (comma-separated)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="gold, silver, black" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="col-span-2 flex flex-wrap gap-6">
                <FormField
                  control={productForm.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="accent-primary"
                        />
                      </FormControl>
                      <FormLabel className="mb-0 text-xs uppercase tracking-wider">Featured</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="isUpsell"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="accent-primary"
                        />
                      </FormControl>
                      <FormLabel className="mb-0 text-xs uppercase tracking-wider">Upsell</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="inStock"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value} onChange={field.onChange} className="accent-primary" />
                      </FormControl>
                      <FormLabel className="mb-0 text-xs uppercase tracking-wider">In Stock</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            {productSaveError ? <p className="text-sm text-destructive">{productSaveError}</p> : null}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSavingProduct} data-testid="button-save-product">
                {isSavingProduct ? "Saving..." : mode === "edit" ? "Update Product" : "Save Product"}
              </Button>
            </div>
          </form>
        </Form>
    </DialogContent>
  );
}
