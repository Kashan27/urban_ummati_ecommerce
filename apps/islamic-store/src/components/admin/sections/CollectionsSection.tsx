"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { AdminCollection } from "@/components/admin/types";
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
  onDeleteCollection: (id: number) => void;
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
  onDeleteCollection,
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
    <div className="max-w-6xl">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="font-serif text-2xl tracking-tight">Collections</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Group products into curated sets separate from categories.
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>Add New Collection</Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/80 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-4 text-left">Image</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Slug</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Show on Home</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {collections?.map((collection) => (
              <tr key={collection.id}>
                <td className="p-4">
                  {collection.imageUrl ? (
                    <img src={collection.imageUrl} alt={collection.name} className="h-10 w-16 object-cover rounded border" />
                  ) : (
                    <div className="h-10 w-16 bg-muted rounded border flex items-center justify-center text-[10px] text-muted-foreground">No Image</div>
                  )}
                </td>
                <td className="p-4">
                  <div className="font-medium">{collection.name}</div>
                  {collection.description && (
                    <div className="text-xs text-muted-foreground line-clamp-1 max-w-xs">{collection.description}</div>
                  )}
                </td>
                <td className="p-4 text-muted-foreground">{collection.slug}</td>
                <td className="p-4">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      collection.isActive ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {collection.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      collection.showOnHome ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {collection.showOnHome ? "Yes" : "No"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onStartEdit(collection)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDeleteCollection(collection.id)}
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
  );
}
