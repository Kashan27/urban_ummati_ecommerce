"use client";

import { useState } from "react";
import { Link as LinkIcon, Copy, Download, Search, Trash2, Edit3, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { AdminProduct } from "@/components/admin/types";
import { cn } from "@/lib/utils";

// Enhanced types for better link management
type LinkStatus = "active" | "expired" | "disabled";
type LinkType = "single-use" | "multi-use" | "time-limited";

interface PromoLink {
  id: string;
  token: string;
  productId: number;
  product?: AdminProduct;
  status?: LinkStatus;
  type?: LinkType;
  usageLimit?: number;
  currentUsage?: number;
  createdAt: string;
  expiresAt?: string;
  usedBy?: Array<{
    email: string;
    usedAt: string;
    orderId?: string;
  }>;
  notes?: string;
  isArchived: boolean;
}

interface PromoSectionProps {
  products: AdminProduct[] | undefined;
  onGenerateLink: (data: GenerateLinkData) => void;
  generatePending: boolean;
  promoLinks?: PromoLink[];
  onUpdateLink?: (id: string, updates: Partial<PromoLink>) => void;
  onDeleteLink?: (id: string) => void;
  onArchiveLink?: (id: string) => void;
}

interface GenerateLinkData {
  productId: number;
  type: LinkType;
  usageLimit?: number;
  expiresAt?: string;
  notes?: string;
}

export function PromoSection({
  products,
  onGenerateLink,
  generatePending,
  promoLinks = [],
  onUpdateLink,
  onDeleteLink,
  onArchiveLink,
}: PromoSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<LinkStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<LinkType | "all">("all");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showUsageDialog, setShowUsageDialog] = useState(false);
  const [selectedLink, setSelectedLink] = useState<PromoLink | null>(null);
  const [editingLink, setEditingLink] = useState<PromoLink | null>(null);

  // Generate link form state
  const [linkType, setLinkType] = useState<LinkType>("multi-use");
  const [usageLimit, setUsageLimit] = useState<number>(10);
  const [expiresIn, setExpiresIn] = useState<number>(30); // days
  const [linkNotes, setLinkNotes] = useState("");

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const getLinkStatus = (link: PromoLink): LinkStatus => {
    if (link.status === "active" || link.status === "expired" || link.status === "disabled") {
      return link.status;
    }

    if (link.expiresAt && new Date(link.expiresAt).getTime() < Date.now()) {
      return "expired";
    }

    if ((link as any).usedByEmail) {
      return "disabled";
    }

    return "active";
  };

  const getLinkType = (link: PromoLink): LinkType => {
    if (link.type === "single-use" || link.type === "multi-use" || link.type === "time-limited") {
      return link.type;
    }
    return "single-use";
  };

  const getLinkCurrentUsage = (link: PromoLink): number => {
    if (typeof link.currentUsage === "number") return link.currentUsage;
    if (Array.isArray(link.usedBy)) return link.usedBy.length;
    return (link as any).usedByEmail ? 1 : 0;
  };

  const filteredLinks = promoLinks.filter((link) => {
    const matchesSearch = 
      !searchTerm ||
      link.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(link.id).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || getLinkStatus(link) === statusFilter;
    const matchesType = typeFilter === "all" || getLinkType(link) === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCopyLink = async (link: PromoLink) => {
    const fullUrl = `${baseUrl}/free-product/${link.token}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(fullUrl);
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = fullUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand("copy");
        } catch (err) {
          throw new Error("Fallback copy failed");
        }
        document.body.removeChild(textArea);
      }
      toast.success("Link copied to clipboard");
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("Failed to copy link");
    }
  };

  const handleGenerateNewLink = () => {
    if (!selectedProductId) {
      toast.error("Please select a product");
      return;
    }

    const expiresAt = expiresIn > 0 
      ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    onGenerateLink({
      productId: parseInt(selectedProductId),
      type: linkType,
      usageLimit: linkType === "multi-use" ? usageLimit : undefined,
      expiresAt,
      notes: linkNotes,
    });

    setShowGenerateDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedProductId("");
    setLinkType("multi-use");
    setUsageLimit(10);
    setExpiresIn(30);
    setLinkNotes("");
  };

  const handleViewUsage = (link: PromoLink) => {
    setSelectedLink(link);
    setShowUsageDialog(true);
  };

  const handleEditLink = (link: PromoLink) => {
    setEditingLink(link);
    setLinkNotes(link.notes || "");
    setUsageLimit(link.usageLimit || 10);
    setExpiresIn(link.expiresAt 
      ? Math.ceil((new Date(link.expiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
      : 30
    );
  };

  const handleSaveEdit = () => {
    if (!editingLink || !onUpdateLink) return;

    const expiresAt = expiresIn > 0 
      ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    onUpdateLink(editingLink.id, {
      notes: linkNotes,
      usageLimit,
      expiresAt,
    });

    setEditingLink(null);
    setLinkNotes("");
  };

  const getStatusBadge = (link: PromoLink) => {
    const status = getLinkStatus(link);
    const isLegacyRedeemed = !(link.status) && Boolean((link as any).usedByEmail);
    const variants = {
      active: { className: "bg-green-100 text-green-800", label: "Active" },
      expired: { className: "bg-gray-100 text-gray-800", label: "Expired" },
      disabled: { className: "bg-red-100 text-red-800", label: "Disabled" },
    };

    const variant =
      isLegacyRedeemed
        ? { className: "bg-emerald-100 text-emerald-800", label: "Redeemed" }
        : (variants[status] ?? variants.active);
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getTypeBadge = (type: LinkType) => {
    const variants = {
      "single-use": { className: "bg-blue-100 text-blue-800", label: "Single Use" },
      "multi-use": { className: "bg-purple-100 text-purple-800", label: "Multi Use" },
      "time-limited": { className: "bg-orange-100 text-orange-800", label: "Time Limited" },
    };
    const variant = variants[type] ?? variants["single-use"];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getUsagePercentage = (link: PromoLink) => {
    if (!link.usageLimit) return 0;
    return Math.min((getLinkCurrentUsage(link) / link.usageLimit) * 100, 100);
  };

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight">Free Product Links</h1>
          <p className="text-muted-foreground">Generate and manage promotional links for products</p>
        </div>
        <Button onClick={() => setShowGenerateDialog(true)} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Generate New Link
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Links</CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promoLinks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Links</CardTitle>
            <div className="h-4 w-4 text-green-500">●</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promoLinks.filter((l) => getLinkStatus(l) === "active").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Redemptions</CardTitle>
            <div className="h-4 w-4 text-blue-500">●</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promoLinks.reduce((sum, link) => sum + getLinkCurrentUsage(link), 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <div className="h-4 w-4 text-purple-500">●</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {promoLinks.length > 0 
                ? Math.round((promoLinks.filter((l) => getLinkCurrentUsage(l) > 0).length / promoLinks.length) * 100)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by product name, token, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LinkStatus | "all")}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as LinkType | "all")}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="single-use">Single Use</SelectItem>
              <SelectItem value="multi-use">Multi Use</SelectItem>
              <SelectItem value="time-limited">Time Limited</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Links Table */}
      <Card>
        <CardHeader>
          <CardTitle>Link Management</CardTitle>
          <CardDescription>
            {filteredLinks.length} of {promoLinks.length} links match your filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLinks.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{link.product?.name || `Product #${link.productId}`}</p>
                          <p className="text-sm text-muted-foreground">${link.product?.price?.toFixed(2)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-xs">{link.token.slice(0, 8)}...</div>
                    </TableCell>
                    <TableCell>{getTypeBadge(getLinkType(link))}</TableCell>
                    <TableCell>{getStatusBadge(link)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{getLinkCurrentUsage(link)}</span>
                          {link.usageLimit && <span className="text-sm text-muted-foreground">/ {link.usageLimit}</span>}
                        </div>
                        {link.usageLimit && (
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={cn(
                                "h-2 rounded-full",
                                getUsagePercentage(link) >= 90 ? "bg-red-500" : 
                                getUsagePercentage(link) >= 70 ? "bg-yellow-500" : "bg-green-500"
                              )}
                              style={{ width: `${getUsagePercentage(link)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{new Date(link.createdAt).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {link.expiresAt 
                          ? new Date(link.expiresAt).toLocaleDateString()
                          : "Never"
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyLink(link)}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewUsage(link)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              ⋯
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditLink(link)}>
                              <Edit3 className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onArchiveLink?.(link.id)}>
                              <Download className="mr-2 h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onDeleteLink?.(link.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredLinks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No links found matching your criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generate Link Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate New Free Product Link</DialogTitle>
            <DialogDescription>
              Create a promotional link for customers to claim free products
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product">Select Product</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger id="product">
                  <SelectValue placeholder="Choose a product..." />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} - ${product.price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkType">Link Type</Label>
                <Select value={linkType} onValueChange={(value) => setLinkType(value as LinkType)}>
                  <SelectTrigger id="linkType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single-use">Single Use (one customer)</SelectItem>
                    <SelectItem value="multi-use">Multi Use (multiple customers)</SelectItem>
                    <SelectItem value="time-limited">Time Limited (expires after time)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {linkType === "multi-use" && (
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    min="1"
                    max="1000"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(parseInt(e.target.value) || 1)}
                    placeholder="Max uses"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="expiresIn">Expires In</Label>
                <Select value={expiresIn.toString()} onValueChange={(value) => setExpiresIn(parseInt(value))}>
                  <SelectTrigger id="expiresIn">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Never</SelectItem>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="7">1 week</SelectItem>
                    <SelectItem value="30">1 month</SelectItem>
                    <SelectItem value="90">3 months</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about this link..."
                value={linkNotes}
                onChange={(e) => setLinkNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>Cancel</Button>
            <Button onClick={handleGenerateNewLink} disabled={!selectedProductId || generatePending}>
              {generatePending ? "Generating..." : "Generate Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Usage Dialog */}
      <Dialog open={showUsageDialog} onOpenChange={setShowUsageDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Link Usage History</DialogTitle>
            <DialogDescription>
              Detailed redemption history for {selectedLink?.product?.name || `Product #${selectedLink?.productId}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedLink && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Token</p>
                  <p className="text-sm text-muted-foreground font-mono break-all">{selectedLink.token}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Usage</p>
                  <p className="text-sm text-muted-foreground">{getLinkCurrentUsage(selectedLink)} / {selectedLink.usageLimit || "∞"}</p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Email</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Redeemed At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(selectedLink.usedBy ?? []).map((usage, index) => (
                    <TableRow key={index}>
                      <TableCell>{usage.email}</TableCell>
                      <TableCell>{usage.orderId || "-"}</TableCell>
                      <TableCell>{new Date(usage.usedAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingLink} onOpenChange={() => setEditingLink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Link</DialogTitle>
            <DialogDescription>Update link settings</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Usage Limit</Label>
              <Input
                type="number"
                min="1"
                max="1000"
                value={usageLimit}
                onChange={(e) => setUsageLimit(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label>Expires In</Label>
              <Select value={expiresIn.toString()} onValueChange={(value) => setExpiresIn(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Never</SelectItem>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="7">1 week</SelectItem>
                  <SelectItem value="30">1 month</SelectItem>
                  <SelectItem value="90">3 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={linkNotes}
                onChange={(e) => setLinkNotes(e.target.value)}
                placeholder="Add notes..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingLink(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
