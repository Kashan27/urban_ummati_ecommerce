"use client";

import type { UseFormReturn } from "react-hook-form";
import { useRef, useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, X, Package, DollarSign, Image, Layers, Settings, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminCategory, AdminCollection, AdminProduct } from "@/components/admin/types";
import type { ProductFormValues } from "@/components/admin/product-form-schema";
import { ColorInput } from "@/components/admin/ColorInput";
import { SimpleRichTextEditor } from "@/components/admin/SimpleRichTextEditor";

type Props = {
  mode: "create" | "edit";
  productForm: UseFormReturn<ProductFormValues>;
  imageUrls: string[];
  setImageUrls: React.Dispatch<React.SetStateAction<string[]>>;
  categories: AdminCategory[] | undefined;
  collections: AdminCollection[] | undefined;
  allProducts: AdminProduct[] | undefined;
  isLoadingProducts?: boolean;
  productFetchError?: string;
  productSaveError: string;
  isSavingProduct: boolean;
  onSubmit: (values: ProductFormValues) => void;
};

// Section Header Component
function FormSection({ 
  title, 
  icon: Icon, 
  children,
  className 
}: { 
  title: string; 
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex items-center gap-3 pb-3 border-b-2 border-primary/20">
        {Icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
        <h2 className="text-lg font-bold text-foreground tracking-tight">
          {title}
        </h2>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

// Sub-section component for grouping related fields
function FormSubSection({ 
  title, 
  children,
  className 
}: { 
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {title && (
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

export function AdminProductDialogContent({
  mode,
  productForm,
  imageUrls,
  setImageUrls,
  categories,
  collections,
  allProducts,
  isLoadingProducts: isLoadingProductsProp,
  productFetchError,
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

    setUploadPending(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/uploads/product-image", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Upload failed");
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
      console.error("Image upload error:", err);
      setUploadError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploadPending(false);
    }
  };

  return (
    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto p-0">
      <DialogHeader className="px-6 py-4 border-b bg-muted/30">
        <DialogTitle className="text-xl font-semibold tracking-tight">
          {mode === "edit" ? "Edit Product" : "Add New Product"}
        </DialogTitle>
      </DialogHeader>
      
      <Form {...productForm}>
        <form onSubmit={productForm.handleSubmit(onSubmit)} className="space-y-0">
          {/* Section 1: Basic Product Information */}
          <FormSection title="Basic Product Information" icon={Package} className="px-6 py-5">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={productForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider">Product Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter product name" data-testid="input-product-name" />
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
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider">Status *</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-medium"
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
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider">Category *</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        value={String(field.value ?? "")}
                        onChange={(event) => field.onChange(parseInt(event.target.value, 10))}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-medium"
                      >
                        <option value="">Select category</option>
                        {(categories || [])
                          .filter((c) => c.isActive)
                          .map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormSubSection title="Product Description" className="pt-2">
              <FormField
                control={productForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <SimpleRichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Describe your product..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSubSection>

            {/* Colors */}
            <FormSubSection title="Product Colors" className="pt-4">
              <FormField
                control={productForm.control}
                name="colors"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ColorInput
                        value={field.value || []}
                        onChange={field.onChange}
                        label="Available Colors"
                        placeholder="#FF0000, #00FF00, #0000FF"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSubSection>
          </FormSection>

          <Separator className="mx-6 w-auto" />

          {/* Section 2: Pricing & Inventory */}
          <FormSection title="Pricing & Inventory" icon={DollarSign} className="px-6 py-5">
            <FormSubSection title="Pricing Details">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={productForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider">Sale Price (CAD) *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input 
                            type="number" 
                            step="0.01" 
                            {...field} 
                            className="pl-7"
                            placeholder="0.00"
                            data-testid="input-product-price" 
                          />
                        </div>
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
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider">Original Price</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input 
                            type="number" 
                            step="0.01" 
                            {...field} 
                            className="pl-7"
                            placeholder="0.00"
                            value={field.value ?? ""} 
                          />
                        </div>
                      </FormControl>
                      <p className="text-[10px] text-muted-foreground mt-1">Shows strikethrough if higher than sale price</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormSubSection>

            <FormSubSection title="Inventory Management" className="pt-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={productForm.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider">SKU</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder="e.g. TAS-001"
                        />
                      </FormControl>
                      <p className="text-[10px] text-muted-foreground mt-1">Unique identifier for warehouse</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={productForm.control}
                  name="inventoryQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider">Stock Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value, 10))}
                          placeholder="e.g. 25"
                        />
                      </FormControl>
                      <p className="text-[10px] text-muted-foreground mt-1">Auto-manages in-stock status</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={productForm.control}
                  name="inStock"
                  render={({ field }) => {
                    const quantity = productForm.watch("inventoryQuantity");
                    const isAutoManaged = typeof quantity === "number";
                    const displayValue = isAutoManaged ? quantity > 0 : field.value;

                    return (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider">Stock Status</FormLabel>
                        <div className={cn(
                          "flex items-center gap-3 p-3 rounded-md border transition-colors",
                          displayValue 
                            ? "bg-green-50 border-green-200" 
                            : "bg-red-50 border-red-200"
                        )}>
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            displayValue ? "bg-green-500" : "bg-red-500"
                          )} />
                          <span className={cn(
                            "text-sm font-medium",
                            displayValue ? "text-green-700" : "text-red-700"
                          )}>
                            {displayValue ? "In Stock" : "Out of Stock"}
                          </span>
                        </div>
                        {isAutoManaged && (
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Auto-managed by quantity ({quantity} in stock)
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
            </FormSubSection>
          </FormSection>

          <Separator className="mx-6 w-auto" />

          {/* Section 3: Shipping Dimensions */}
          <FormSection title="Shipping Dimensions" icon={Scale} className="px-6 py-5">
            <FormSubSection title="Product measurements for shipping calculations">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={productForm.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider">Weight (g)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                          placeholder="0.00"
                        />
                      </FormControl>
                      <p className="text-[10px] text-muted-foreground mt-1">Grams</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider">Length (in)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                          placeholder="0.0"
                        />
                      </FormControl>
                      <p className="text-[10px] text-muted-foreground mt-1">Inches</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider">Width (in)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                          placeholder="0.0"
                        />
                      </FormControl>
                      <p className="text-[10px] text-muted-foreground mt-1">Inches</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider">Height (in)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                          placeholder="0.0"
                        />
                      </FormControl>
                      <p className="text-[10px] text-muted-foreground mt-1">Inches</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormSubSection>
          </FormSection>

          <Separator className="mx-6 w-auto" />

          {/* Section 4: Media & Assets */}
          <FormSection title="Media & Assets" icon={Image} className="px-6 py-5">
            <FormSubSection title="Product Images">
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={uploadSelectedFile}
                />
                
                {/* Image Preview Grid */}
                <div className="grid grid-cols-4 gap-3">
                  {imageUrls.map((url, index) => (
                    <div
                      key={index}
                      className={cn(
                        "relative aspect-square rounded-lg border-2 overflow-hidden group",
                        index === 0 
                          ? "border-primary ring-2 ring-primary/20" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <img
                        src={url || '/product-1.png'}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/product-1.png';
                        }}
                      />
                      
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setImageUrls(prev => prev.filter((_, i) => i !== index));
                        }}
                        className="absolute top-1 right-1 w-6 h-6 bg-destructive/90 hover:bg-destructive text-white rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      
                      {/* Primary Badge */}
                      {index === 0 && (
                        <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-medium rounded">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Add Image Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadPending}
                    className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {uploadPending ? (
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-6 h-6 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Add Image</span>
                      </>
                    )}
                  </button>
                </div>
                
                {uploadError && (
                  <p className="text-sm text-destructive flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {uploadError}
                  </p>
                )}
                
                <p className="text-xs text-muted-foreground">
                  First image will be used as the primary product image. Recommended size: 800x800px.
                </p>
              </div>
            </FormSubSection>
          </FormSection>

          <Separator className="mx-6 w-auto" />

          {/* Section 4: Organization & Collections */}
          <FormSection title="Organization & Collections" icon={Layers} className="px-6 py-5">
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={productForm.control}
                name="collectionIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider">Collections</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-1 gap-2 rounded-lg border border-input bg-background p-4 sm:grid-cols-2">
                        {(collections || [])
                          .filter((c) => c.isActive)
                          .map((collection) => {
                            const checked = Array.isArray(field.value)
                              ? field.value.includes(collection.id)
                              : false;
                            return (
                              <label
                                key={collection.id}
                                className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
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
                                  className="w-4 h-4 accent-primary rounded border-input"
                                />
                                <span className="text-sm font-medium">{collection.name}</span>
                              </label>
                            );
                          })}
                        {!collections?.length ? (
                          <div className="col-span-full text-sm text-muted-foreground py-4 text-center bg-muted/30 rounded-md">
                            Create a collection first to assign products.
                          </div>
                        ) : null}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          <Separator className="mx-6 w-auto" />

          {/* Section 5: Upsell Configuration */}
          <FormSection title="Upsell Configuration" icon={Settings} className="px-6 py-5">
            <div className="space-y-6">
              {/* Featured Flag */}
              <FormField
                control={productForm.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-4 h-4 accent-primary mt-0.5"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-semibold">New Arrival / Featured</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Display this product in the "New Arrivals" section and featured areas on the homepage
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {/* General Upsell Flag */}
              <FormField
                control={productForm.control}
                name="isUpsell"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-4 h-4 accent-primary mt-0.5"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-semibold">General Upsell</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Show this product as an upsell when no specific product links exist
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          {/* Error & Action Buttons */}
          <div className="px-6 py-5 bg-muted/30 border-t space-y-4">
            {productSaveError ? (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {productSaveError}
              </div>
            ) : null}
            
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onCancel} className="min-w-[100px]">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSavingProduct} 
                data-testid="button-save-product"
                className="min-w-[120px]"
              >
                {isSavingProduct ? "Saving..." : mode === "edit" ? "Save Changes" : "Create Product"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}

// Add Plus icon import
import { Plus } from "lucide-react";
