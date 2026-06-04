"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminCategory } from "@/components/admin/types";
import { useRef, useState } from "react";
import { ImagePlus, X, Upload, Pencil } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type Props = {
  categories: AdminCategory[] | undefined;
  newCategoryName: string;
  onNewCategoryNameChange: (value: string) => void;
  newCategoryImageUrl: string;
  onNewCategoryImageUrlChange: (value: string) => void;
  isSavingCategory: boolean;
  editingCategoryId: number | null;
  editingCategoryName: string;
  onEditingCategoryNameChange: (value: string) => void;
  editingCategoryImageUrl: string;
  onEditingCategoryImageUrlChange: (value: string) => void;
  onStartEdit: (category: AdminCategory) => void;
  onCancelEdit: () => void;
  onCreateCategory: () => void;
  onUpdateCategory: (id: number) => void;
  onDeleteCategory: (id: number) => void;
};

export function CategoriesSection({
  categories,
  newCategoryName,
  onNewCategoryNameChange,
  newCategoryImageUrl,
  onNewCategoryImageUrlChange,
  isSavingCategory,
  editingCategoryId,
  editingCategoryName,
  onEditingCategoryNameChange,
  editingCategoryImageUrl,
  onEditingCategoryImageUrlChange,
  onStartEdit,
  onCancelEdit,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingUploadTarget = useRef<'new' | number | null>(null);
  const [uploadingFor, setUploadingFor] = useState<'new' | number | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/uploads/product-image", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    return data.url as string;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, target: 'new' | number) => {
    const file = event.target.files?.[0];
    if (!file) {
      setUploadingFor(null);
      return;
    }

    setUploadingFor(target);

    try {
      const url = await handleImageUpload(file);
      if (target === 'new') {
        onNewCategoryImageUrlChange(url);
      } else {
        onEditingCategoryImageUrlChange(url);
      }
    } catch (error) {
      alert("Failed to upload image");
    } finally {
      setUploadingFor(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileInput = (target: 'new' | number) => {
    pendingUploadTarget.current = target;
    fileInputRef.current?.click();
  };

  const handleStartEdit = (category: AdminCategory) => {
    onStartEdit(category);
    onEditingCategoryImageUrlChange(category.imageUrl || '');
  };

  const handleCancelEdit = () => {
    onCancelEdit();
    onEditingCategoryImageUrlChange('');
  };

  const ImageUploadButton = ({ 
    imageUrl, 
    onRemove, 
    target,
    isUploading 
  }: { 
    imageUrl: string; 
    onRemove: () => void;
    target: 'new' | number;
    isUploading: boolean;
  }) => (
    <div className="flex items-center gap-3">
      {imageUrl ? (
        <div className="relative group">
          <img 
            src={imageUrl} 
            alt="Category" 
            className="h-16 w-16 rounded-lg object-cover border border-border cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setPreviewImageUrl(imageUrl)}
          />
          {isUploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => triggerFileInput(target)}
                className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => triggerFileInput(target)}
          disabled={isUploading}
          className="h-16 w-16 rounded-lg border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
        >
          {isUploading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <>
              <ImagePlus className="h-4 w-4" />
              <span className="text-[10px]">Add</span>
            </>
          )}
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-5xl">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (pendingUploadTarget.current !== null) {
            handleFileChange(e, pendingUploadTarget.current);
            pendingUploadTarget.current = null;
          }
        }}
      />

      {/* Image Preview Modal */}
      <Dialog open={!!previewImageUrl} onOpenChange={() => setPreviewImageUrl(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none">
          {previewImageUrl && (
            <img 
              src={previewImageUrl} 
              alt="Category Preview" 
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="mb-8">
        <h2 className="font-serif text-2xl tracking-tight">Categories</h2>
        <p className="mt-1 text-sm text-muted-foreground">Organize products with slugs for clean URLs.</p>
      </div>

      {/* Add Category Form */}
      <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 font-serif text-lg">Add Category</h3>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <ImageUploadButton
              imageUrl={newCategoryImageUrl}
              onRemove={() => onNewCategoryImageUrlChange('')}
              target="new"
              isUploading={uploadingFor === 'new'}
            />
            <div className="flex-1">
              <Input
                value={newCategoryName}
                onChange={(event) => onNewCategoryNameChange(event.target.value)}
                placeholder="Category name"
                data-testid="input-new-category-name"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={onCreateCategory}
              disabled={isSavingCategory || !newCategoryName.trim()}
              data-testid="button-add-category"
            >
              {isSavingCategory ? "Saving..." : "Add Category"}
            </Button>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/80 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-4 text-left">Image</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Slug</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories?.map((category) => (
              <tr key={category.id}>
                <td className="p-4">
                  {editingCategoryId === category.id ? (
                    <ImageUploadButton
                      imageUrl={editingCategoryImageUrl}
                      onRemove={() => onEditingCategoryImageUrlChange('')}
                      target={category.id}
                      isUploading={uploadingFor === category.id}
                    />
                  ) : (
                    <div className="relative group h-12 w-12 rounded-lg bg-muted overflow-hidden border border-border">
                      {category.imageUrl ? (
                        <>
                          <img 
                            src={category.imageUrl} 
                            alt={category.name}
                            className="h-full w-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setPreviewImageUrl(category.imageUrl!)}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              handleStartEdit(category);
                              setTimeout(() => triggerFileInput(category.id), 0);
                            }}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <div 
                          className="h-full w-full flex items-center justify-center text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                          onClick={() => {
                            handleStartEdit(category);
                            setTimeout(() => triggerFileInput(category.id), 0);
                          }}
                        >
                          <ImagePlus className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td className="p-4">
                  {editingCategoryId === category.id ? (
                    <Input
                      value={editingCategoryName}
                      onChange={(event) => onEditingCategoryNameChange(event.target.value)}
                      data-testid={`input-edit-category-${category.id}`}
                    />
                  ) : (
                    category.name
                  )}
                </td>
                <td className="p-4 text-muted-foreground">{category.slug}</td>
                <td className="p-4">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      category.isActive ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {editingCategoryId === category.id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => onUpdateCategory(category.id)}
                          disabled={isSavingCategory || !editingCategoryName.trim()}
                        >
                          {isSavingCategory ? "Saving..." : "Save"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartEdit(category)}
                          data-testid={`button-edit-category-${category.id}`}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDeleteCategory(category.id)}
                          data-testid={`button-delete-category-${category.id}`}
                        >
                          Delete
                        </Button>
                      </>
                    )}
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