"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminCategory } from "@/components/admin/types";
import { useRef, useState } from "react";
import { ImagePlus, X, Upload, Pencil, Eye, Info, CheckCircle2, AlertCircle, PlusCircle, Search } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

type Props = {
  categories: AdminCategory[] | undefined;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: "all" | "active" | "inactive";
  onStatusFilterChange: (value: "all" | "active" | "inactive") => void;
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
  onToggleCategoryActive: (category: AdminCategory) => void;
};

// Form Section Header Component
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
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 pb-2 border-b border-border/50">
        {Icon && <Icon className="w-4 h-4 text-primary" />}
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

export function CategoriesSection({
  categories,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
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
  onToggleCategoryActive,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingUploadTarget = useRef<'new' | number | null>(null);
  const [uploadingFor, setUploadingFor] = useState<'new' | number | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const statusCounts = {
    all: (categories || []).length,
    active: (categories || []).filter(c => c.isActive).length,
    inactive: (categories || []).filter(c => !c.isActive).length,
  };

  const filteredCategories = (categories || []).filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "active" && c.isActive) || 
      (statusFilter === "inactive" && !c.isActive);
    return matchesSearch && matchesStatus;
  });

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
    isUploading,
    size = "md"
  }: { 
    imageUrl: string; 
    onRemove: () => void;
    target: 'new' | number;
    isUploading: boolean;
    size?: "sm" | "md" | "lg";
  }) => {
    const sizeClasses = {
      sm: "h-14 w-14",
      md: "h-24 w-24",
      lg: "h-32 w-32"
    };

    return (
      <div className="flex flex-col items-center gap-2">
        <div 
          className={cn(
            "group relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200",
            sizeClasses[size],
            imageUrl ? "border-solid border-primary/20" : "border-border hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          {imageUrl ? (
            <>
              <img 
                src={imageUrl} 
                alt="Category" 
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewImageUrl(imageUrl)}
                  className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => triggerFileInput(target)}
                  className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onRemove}
                  className="p-1.5 rounded-full bg-white/20 hover:bg-destructive text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => triggerFileInput(target)}
              disabled={isUploading}
              className="flex h-full w-full flex-col items-center justify-center text-muted-foreground transition-colors hover:text-primary"
            >
              {isUploading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <>
                  <ImagePlus className={cn(size === "sm" ? "h-4 w-4" : "h-7 w-7 mb-1")} />
                  {size !== "sm" && <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)]">
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
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 space-y-4 pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Categories</h2>
            <p className="text-xs text-muted-foreground">Manage your store's product organization and navigation structure</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-2 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[150px] max-w-sm">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-8 pl-8 text-xs bg-background border-input"
              />
            </div>

            <div className="flex items-center gap-1">
              {(
                [
                  { key: "all", label: "All" },
                  { key: "active", label: "Active" },
                  { key: "inactive", label: "Inactive" },
                ] as const
              ).map((tab) => (
                <Button
                  key={tab.key}
                  variant={statusFilter === tab.key ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-7 px-2.5 text-[11px] font-medium",
                    statusFilter === tab.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => onStatusFilterChange(tab.key)}
                >
                  {tab.label}
                  <span className={cn(
                    "ml-1.5 text-[10px]",
                    statusFilter === tab.key ? "opacity-90" : "opacity-50"
                  )}>
                    {statusCounts[tab.key]}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto min-h-0 custom-scrollbar">
        {/* Compact Add Category Bar - Professional & Space-efficient */}
        <div className="mb-8 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 lg:p-5">
          {/* Image Selection - Small & Integrated */}
          <div className="shrink-0">
            <ImageUploadButton
              imageUrl={newCategoryImageUrl}
              onRemove={() => onNewCategoryImageUrlChange('')}
              target="new"
              isUploading={uploadingFor === 'new'}
              size="sm"
            />
          </div>

          <Separator orientation="vertical" className="hidden sm:block h-10 opacity-50" />

          {/* Input & Action - Single Row */}
          <div className="flex-1 w-full flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full">
              <Input
                value={newCategoryName}
                onChange={(event) => onNewCategoryNameChange(event.target.value)}
                placeholder="Enter new category name (e.g. Wall Art)..."
                className="h-11 pl-4 bg-muted/10 border-border/60 focus:bg-background transition-all duration-200"
                data-testid="input-new-category-name"
              />
            </div>
            
            <Button
              onClick={onCreateCategory}
              disabled={isSavingCategory || !newCategoryName.trim()}
              className="h-11 px-6 font-bold uppercase tracking-widest text-[10px] shrink-0 w-full sm:w-auto shadow-sm"
              data-testid="button-add-category"
            >
              {isSavingCategory ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Category
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur-sm border-b shadow-sm text-muted-foreground font-medium">
            <tr>
              <th className="p-3 text-left font-semibold">Preview</th>
              <th className="p-3 text-left font-semibold">Category Identity</th>
              <th className="p-3 text-left font-semibold">Status</th>
              <th className="p-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredCategories?.map((category) => (
              <tr key={category.id} className="group hover:bg-primary/[0.02] transition-colors">
                <td className="p-3">
                  {editingCategoryId === category.id ? (
                    <ImageUploadButton
                      imageUrl={editingCategoryImageUrl}
                      onRemove={() => onEditingCategoryImageUrlChange('')}
                      target={category.id}
                      isUploading={uploadingFor === category.id}
                      size="sm"
                    />
                  ) : (
                    <div className="relative group/img h-11 w-11 rounded border border-border/50 bg-muted overflow-hidden">
                      {category.imageUrl ? (
                        <>
                          <img 
                            src={category.imageUrl} 
                            alt={category.name}
                            className="h-full w-full object-cover cursor-pointer transition-transform duration-500 group-hover/img:scale-110"
                            onClick={() => setPreviewImageUrl(category.imageUrl!)}
                          />
                          <button
                            type="button"
                            onClick={() => setPreviewImageUrl(category.imageUrl!)}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover/img:opacity-100 transition-opacity"
                          >
                            <Eye className="h-4 w-4" />
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
                          <ImagePlus className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td className="p-3">
                  {editingCategoryId === category.id ? (
                    <div className="space-y-2">
                      <Input
                        value={editingCategoryName}
                        onChange={(event) => onEditingCategoryNameChange(event.target.value)}
                        className="h-9 bg-background text-xs"
                        data-testid={`input-edit-category-${category.id}`}
                      />
                      <p className="text-[10px] text-muted-foreground italic">Slug: {category.slug}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground text-sm tracking-tight">{category.name}</span>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{category.slug}</span>
                    </div>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-2 w-2 rounded-full shadow-sm",
                      category.isActive ? "bg-emerald-500 shadow-emerald-200" : "bg-amber-500 shadow-amber-200"
                    )} />
                    <span className="font-semibold capitalize text-foreground/80">{category.isActive ? "Active" : "Inactive"}</span>
                  </div>
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end items-center gap-1">
                    {editingCategoryId === category.id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => onUpdateCategory(category.id)}
                          disabled={isSavingCategory || !editingCategoryName.trim()}
                          className="h-7 px-3 text-[10px] font-bold uppercase tracking-wider"
                        >
                          {isSavingCategory ? "..." : "Save"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-7 px-3 text-[10px] font-bold uppercase tracking-wider">
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full hover:bg-primary/5 hover:text-primary transition-colors"
                          onClick={() => handleStartEdit(category)}
                          data-testid={`button-edit-category-${category.id}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Separator orientation="vertical" className="h-4 mx-1 opacity-50" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-primary/5"
                          onClick={() => onToggleCategoryActive(category)}
                        >
                          {category.isActive ? "Inactive" : "Active"}
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
  </div>
);
}