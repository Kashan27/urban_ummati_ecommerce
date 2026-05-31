"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Trash2, ArrowRight, Tag, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { AdminProduct } from "@/components/admin/types";

interface Props {
  products: AdminProduct[] | undefined;
  isLoading: boolean;
}

export function UpsellSection({ products, isLoading }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [currentUpsellIds, setCurrentUpsellIds] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [upsellSearchTerm, setUpsellSearchTerm] = useState("");

  const filteredProducts = (products || []).filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.status !== "archived"
  );

  const availableUpsellProducts = (products || []).filter(p => 
    p.id !== selectedProduct?.id && 
    p.status === "active" &&
    p.name.toLowerCase().includes(upsellSearchTerm.toLowerCase())
  );

  const handleManageUpsells = async (product: AdminProduct) => {
    setSelectedProduct(product);
    setCurrentUpsellIds([]);
    setIsManageDialogOpen(true);

    try {
      const response = await fetch(`/api/admin/products/${product.id}/upsells`, {
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUpsellIds(data.upsellProductIds || []);
      }
    } catch (error) {
      console.error("Failed to fetch upsells", error);
      toast.error("Failed to load existing upsells");
    }
  };

  const handleSaveUpsells = async () => {
    if (!selectedProduct) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/products/${selectedProduct.id}/upsells`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ upsellProductIds: currentUpsellIds })
      });

      if (response.ok) {
        toast.success("Upsells updated successfully");
        setIsManageDialogOpen(false);
      } else {
        throw new Error("Failed to save upsells");
      }
    } catch (error) {
      toast.error("Failed to save upsells");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleUpsell = (productId: number) => {
    setCurrentUpsellIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight">Upsell Management</h1>
          <p className="text-muted-foreground">Configure product-to-product upsell recommendations</p>
        </div>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-primary">How it works</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Select a main product to configure which other products should be suggested as "Frequently Bought Together" on its detail page. 
                Products marked as "General Upsell" in the product editor will show up as defaults if no specific upsells are defined here.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Find a product to manage its upsells..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Upsells</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 w-40 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-10 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell className="text-right"><div className="h-8 w-24 ml-auto bg-muted animate-pulse rounded" /></TableCell>
                  </TableRow>
                ))
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img src={product.imageUrl} className="h-8 w-8 rounded object-cover" alt="" />
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{product.categoryName}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Tag className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">Manage...</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-1.5 hover:bg-primary/10 hover:text-primary"
                        onClick={() => handleManageUpsells(product)}
                      >
                        Manage Upsells <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>Configure Upsells for {selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              Selected products will appear as recommendations on this product's page.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products to add..."
                value={upsellSearchTerm}
                onChange={(e) => setUpsellSearchTerm(e.target.value)}
                className="pl-10 h-9 text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto border-y">
            <div className="grid grid-cols-1 sm:grid-cols-2 p-1">
              {availableUpsellProducts.map((p) => {
                const isSelected = currentUpsellIds.includes(p.id);
                return (
                  <div 
                    key={p.id}
                    className={cn(
                      "flex items-center gap-3 p-3 m-1 rounded-lg border cursor-pointer transition-all",
                      isSelected 
                        ? "bg-primary/5 border-primary ring-1 ring-primary/20" 
                        : "hover:bg-muted border-transparent"
                    )}
                    onClick={() => toggleUpsell(p.id)}
                  >
                    <img src={p.imageUrl} className="h-10 w-10 rounded object-cover shrink-0" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium truncate", isSelected ? "text-primary" : "text-foreground")}>
                        {p.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">${p.price.toFixed(2)}</p>
                    </div>
                    <div className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0",
                      isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"
                    )}>
                      {isSelected && <Plus className="h-3 w-3" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="px-6 py-4 flex items-center justify-between bg-muted/30 rounded-b-lg">
            <div className="text-xs text-muted-foreground font-medium">
              {currentUpsellIds.length} products selected as upsells
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsManageDialogOpen(false)} size="sm">
                Cancel
              </Button>
              <Button onClick={handleSaveUpsells} disabled={isSaving} size="sm">
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
