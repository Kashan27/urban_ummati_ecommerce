"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminCollection } from "@/components/admin/types";

type Props = {
  collections: AdminCollection[] | undefined;
  newCollectionName: string;
  onNewCollectionNameChange: (value: string) => void;
  isSavingCollection: boolean;
  editingCollectionId: number | null;
  editingCollectionName: string;
  onEditingCollectionNameChange: (value: string) => void;
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
  isSavingCollection,
  editingCollectionId,
  editingCollectionName,
  onEditingCollectionNameChange,
  onStartEdit,
  onCancelEdit,
  onCreateCollection,
  onUpdateCollection,
  onDeleteCollection,
}: Props) {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="font-serif text-2xl tracking-tight">Collections</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Group products into curated sets separate from categories.
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-3 font-serif text-lg">Add Collection</h3>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={newCollectionName}
            onChange={(event) => onNewCollectionNameChange(event.target.value)}
            placeholder="Collection name"
            data-testid="input-new-collection-name"
          />
          <Button
            className="sm:w-auto"
            onClick={onCreateCollection}
            disabled={isSavingCollection || !newCollectionName.trim()}
            data-testid="button-add-collection"
          >
            {isSavingCollection ? "Saving..." : "Add"}
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/80 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
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
                  {editingCollectionId === collection.id ? (
                    <Input
                      value={editingCollectionName}
                      onChange={(event) => onEditingCollectionNameChange(event.target.value)}
                      data-testid={`input-edit-collection-${collection.id}`}
                    />
                  ) : (
                    collection.name
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
                    {editingCollectionId === collection.id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => onUpdateCollection(collection.id)}
                          disabled={isSavingCollection || !editingCollectionName.trim()}
                        >
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={onCancelEdit}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onStartEdit(collection)}
                          data-testid={`button-edit-collection-${collection.id}`}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDeleteCollection(collection.id)}
                          data-testid={`button-delete-collection-${collection.id}`}
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

