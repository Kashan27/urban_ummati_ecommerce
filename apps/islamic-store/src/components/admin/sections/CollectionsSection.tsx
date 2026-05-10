"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AdminCollection } from "@/components/admin/types";
import { useState } from "react";
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
  isSavingCollection: boolean;
  editingCollectionId: number | null;
  editingCollectionName: string;
  onEditingCollectionNameChange: (value: string) => void;
  editingCollectionDescription: string;
  onEditingCollectionDescriptionChange: (value: string) => void;
  editingCollectionImageUrl: string;
  onEditingCollectionImageUrlChange: (value: string) => void;
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
  isSavingCollection,
  editingCollectionId,
  editingCollectionName,
  onEditingCollectionNameChange,
  editingCollectionDescription,
  onEditingCollectionDescriptionChange,
  editingCollectionImageUrl,
  onEditingCollectionImageUrlChange,
  onStartEdit,
  onCancelEdit,
  onCreateCollection,
  onUpdateCollection,
  onDeleteCollection,
}: Props) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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
              <label className="text-sm font-medium">Header Image URL</label>
              <Input
                value={newCollectionImageUrl}
                onChange={(e) => onNewCollectionImageUrlChange(e.target.value)}
                placeholder="https://..."
              />
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
              <label className="text-sm font-medium">Header Image URL</label>
              <Input
                value={editingCollectionImageUrl}
                onChange={(e) => onEditingCollectionImageUrlChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editingCollectionDescription}
                onChange={(e) => onEditingCollectionDescriptionChange(e.target.value)}
                rows={4}
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
