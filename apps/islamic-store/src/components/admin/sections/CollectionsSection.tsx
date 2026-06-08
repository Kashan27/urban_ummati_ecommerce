"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { AdminCollection } from "@/components/admin/types";
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Edit, Eye, Trash2, Plus, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  collections: AdminCollection[] | undefined;
  newCollectionName: string;
  onNewCollectionNameChange: (value: string) => void;
  newCollectionDescription: string;
  onNewCollectionDescriptionChange: (value: string) => void;
  newCollectionImageUrl: string;
  onNewCollectionImageUrlChange: (value: string) => void;
  newCollectionShowOnHome: boolean;
  onNewCollectionShowOnHomeChange: (value: boolean) => void;
  isSavingCollection: boolean;
  editingCollectionId: number | null;
  editingCollectionName: string;
  onEditingCollectionNameChange: (value: string) => void;
  editingCollectionDescription: string;
  onEditingCollectionDescriptionChange: (value: string) => void;
  editingCollectionImageUrl: string;
  onEditingCollectionImageUrlChange: (value: string) => void;
  editingCollectionShowOnHome: boolean;
  onEditingCollectionShowOnHomeChange: (value: boolean) => void;
  onStartEdit: (collection: AdminCollection) => void;
  onCancelEdit: () => void;
  onCreateCollection: () => void;
  onUpdateCollection: (id: number) => void;
  onToggleCollectionActive: (collection: AdminCollection) => void;
};

export function CollectionsSection({
  collections,
  newCollectionName,
  onNewCollectionNameChange,
  newCollectionDescription,
  onNewCollectionDescriptionChange,
  newCollectionImageUrl,
  onNewCollectionImageUrlChange,
  newCollectionShowOnHome,
  onNewCollectionShowOnHomeChange,
  isSavingCollection,
  editingCollectionId,
  editingCollectionName,
  onEditingCollectionNameChange,
  editingCollectionDescription,
  onEditingCollectionDescriptionChange,
  editingCollectionImageUrl,
  onEditingCollectionImageUrlChange,
  editingCollectionShowOnHome,
  onEditingCollectionShowOnHomeChange,
  onStartEdit,
  onCancelEdit,
  onCreateCollection,
  onUpdateCollection,
  onToggleCollectionActive,
}: Props) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const addFileInputRef = useRef<HTMLInputElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = async (
    file: File,
    onSuccess: (url: string) => void
  ) => {
    setUploadingImage(true);
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

      const data = await response.json();
      onSuccess(data.url);
    } catch (err) {
      console.error("Image upload error:", err);
      setUploadError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)]">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 space-y-4 pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Collections</h2>
            <p className="text-xs text-muted-foreground">Group products into curated sets separate from categories</p>
          </div>
          <Button
            size="sm"
            className="h-8 gap-1.5 px-3 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" /> Add Collection
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto min-h-0 custom-scrollbar">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur-sm border-b shadow-sm text-muted-foreground font-medium">
            <tr>
              <th className="p-3 text-left font-semibold">Preview</th>
              <th className="p-3 text-left font-semibold">Collection Details</th>
              <th className="p-3 text-left font-semibold">Slug</th>
              <th className="p-3 text-left font-semibold">Status</th>
              <th className="p-3 text-left font-semibold">Home View</th>
              <th className="p-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {collections?.map((collection) => (
              <tr key={collection.id} className="hover:bg-primary/[0.02] transition-colors group">
                <td className="p-3">
                  <div className="h-9 w-14 rounded border border-border/50 bg-muted overflow-hidden shrink-0">
                    {collection.imageUrl ? (
                      <img src={collection.imageUrl} alt={collection.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">No Image</div>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <div className="font-bold text-foreground text-sm">{collection.name}</div>
                  {collection.description && (
                    <div className="text-[10px] text-muted-foreground line-clamp-1 max-w-xs">{collection.description}</div>
                  )}
                </td>
                <td className="p-3 text-muted-foreground font-mono">{collection.slug}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-2 w-2 rounded-full shadow-sm",
                      collection.isActive ? "bg-emerald-500 shadow-emerald-200" : "bg-amber-500 shadow-amber-200"
                    )} />
                    <span className="font-semibold capitalize text-foreground/80">{collection.isActive ? "Active" : "Inactive"}</span>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      collection.showOnHome ? "bg-blue-500" : "bg-slate-300"
                    )} />
                    <span className="font-medium text-muted-foreground">{collection.showOnHome ? "Visible" : "Hidden"}</span>
                  </div>
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end items-center gap-1 transition-all duration-200">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full hover:bg-primary/5 hover:text-primary transition-colors"
                      onClick={() => onStartEdit(collection)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Separator orientation="vertical" className="h-4 mx-1 my-auto hidden sm:block opacity-50" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-primary/5"
                      onClick={() => onToggleCollectionActive(collection)}
                    >
                      {collection.isActive ? "Inactive" : "Active"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={newCollectionName}
                onChange={(e) => onNewCollectionNameChange(e.target.value)}
                placeholder="e.g. Ramzan Special"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Collection Image</label>
              <div className="flex gap-2">
                <Input
                  value={newCollectionImageUrl}
                  onChange={(e) => onNewCollectionImageUrlChange(e.target.value)}
                  placeholder="https://..."
                  className="flex-1"
                />
                <input
                  type="file"
                  accept="image/*"
                  ref={addFileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageUpload(file, (url) => {
                        onNewCollectionImageUrlChange(url);
                      });
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addFileInputRef.current?.click()}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? "Uploading..." : "Upload"}
                </Button>
              </div>
              {uploadError ? <p className="text-sm text-destructive">{uploadError}</p> : null}
              {newCollectionImageUrl && (
                <div className="mt-2">
                  <img
                    src={newCollectionImageUrl}
                    alt="Preview"
                    className="h-24 w-auto rounded border object-cover"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newCollectionDescription}
                onChange={(e) => onNewCollectionDescriptionChange(e.target.value)}
                placeholder="Tell something about this collection..."
                rows={4}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-on-home" className="text-sm font-medium">Show on Home Page</Label>
              <Switch
                id="show-on-home"
                checked={newCollectionShowOnHome}
                onCheckedChange={onNewCollectionShowOnHomeChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              onCreateCollection();
              setIsAddDialogOpen(false);
            }} disabled={isSavingCollection || !newCollectionName.trim()}>
              {isSavingCollection ? "Saving..." : "Create Collection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editingCollectionId !== null} onOpenChange={(open) => !open && onCancelEdit()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editingCollectionName}
                onChange={(e) => onEditingCollectionNameChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Collection Image</label>
              <div className="flex gap-2">
                <Input
                  value={editingCollectionImageUrl}
                  onChange={(e) => onEditingCollectionImageUrlChange(e.target.value)}
                  className="flex-1"
                />
                <input
                  type="file"
                  accept="image/*"
                  ref={editFileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageUpload(file, (url) => {
                        onEditingCollectionImageUrlChange(url);
                      });
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => editFileInputRef.current?.click()}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? "Uploading..." : "Upload"}
                </Button>
              </div>
              {uploadError ? <p className="text-sm text-destructive">{uploadError}</p> : null}
              {editingCollectionImageUrl && (
                <div className="mt-2">
                  <img
                    src={editingCollectionImageUrl}
                    alt="Preview"
                    className="h-24 w-auto rounded border object-cover"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editingCollectionDescription}
                onChange={(e) => onEditingCollectionDescriptionChange(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-show-on-home" className="text-sm font-medium">Show on Home Page</Label>
              <Switch
                id="edit-show-on-home"
                checked={editingCollectionShowOnHome}
                onCheckedChange={onEditingCollectionShowOnHomeChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onCancelEdit}>Cancel</Button>
            <Button onClick={() => onUpdateCollection(editingCollectionId!)} disabled={isSavingCollection || !editingCollectionName.trim()}>
              {isSavingCollection ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>
);
}
