"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminCategory } from "@/components/admin/types";

type Props = {
  categories: AdminCategory[] | undefined;
  newCategoryName: string;
  onNewCategoryNameChange: (value: string) => void;
  isSavingCategory: boolean;
  editingCategoryId: number | null;
  editingCategoryName: string;
  onEditingCategoryNameChange: (value: string) => void;
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
  isSavingCategory,
  editingCategoryId,
  editingCategoryName,
  onEditingCategoryNameChange,
  onStartEdit,
  onCancelEdit,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
}: Props) {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="font-serif text-2xl tracking-tight">Categories</h2>
        <p className="mt-1 text-sm text-muted-foreground">Organize products with slugs for clean URLs.</p>
      </div>

      <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-3 font-serif text-lg">Add Category</h3>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={newCategoryName}
            onChange={(event) => onNewCategoryNameChange(event.target.value)}
            placeholder="Category name"
            data-testid="input-new-category-name"
          />
          <Button
            className="sm:w-auto"
            onClick={onCreateCategory}
            disabled={isSavingCategory || !newCategoryName.trim()}
            data-testid="button-add-category"
          >
            {isSavingCategory ? "Saving..." : "Add"}
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
            {categories?.map((category) => (
              <tr key={category.id}>
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
                          onClick={() => onStartEdit(category)}
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
