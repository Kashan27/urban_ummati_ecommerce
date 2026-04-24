"use client";

import type { UseFormReturn } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { AdminCategory } from "@/components/admin/types";
import type { ProductFormValues } from "@/components/admin/product-form-schema";

type Props = {
  mode: "create" | "edit";
  productForm: UseFormReturn<ProductFormValues>;
  imageUrls: string[];
  setImageUrls: React.Dispatch<React.SetStateAction<string[]>>;
  categories: AdminCategory[] | undefined;
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
  productSaveError,
  isSavingProduct,
  onSubmit,
  onCancel,
}: Props & { onCancel: () => void }) {
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
              <div className="col-span-2 space-y-2">
                <label className="text-xs uppercase tracking-wider">Product Images</label>
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
