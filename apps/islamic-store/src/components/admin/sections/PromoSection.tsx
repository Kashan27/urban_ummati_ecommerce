"use client";

import { useState } from "react";
import { Link as LinkIcon, Copy, Download, Search, Trash2, Edit3, Eye, Plus, Pencil } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
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
    const fullUrl = `${baseUrl}/cart?promoToken=${encodeURIComponent(link.token)}`;
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
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)]">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 space-y-4 pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Free Product Links</h2>
            <p className="text-xs text-muted-foreground">Generate and manage promotional links for products</p>
          </div>
          <Button
            size="sm"
            className="h-8 gap-1.5 px-3 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => setShowGenerateDialog(true)}
          >
            <Plus className="h-3.5 w-3.5" /> Generate Link
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto min-h-0 custom-scrollbar space-y-6">
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
      <Card className="overflow-hidden border-border/60 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur-sm border-b shadow-sm text-muted-foreground font-medium">
                <tr>
                  <th className="p-3 text-left font-semibold">Promotional Item</th>
                  <th className="p-3 text-left font-semibold">Access Token</th>
                  <th className="p-3 text-left font-semibold">Policy Type</th>
                  <th className="p-3 text-left font-semibold">Status</th>
                  <th className="p-3 text-left font-semibold">Usage Log</th>
                  <th className="p-3 text-left font-semibold">Expiry</th>
                  <th className="p-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-primary/[0.02] transition-colors group">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate max-w-[180px]">{link.product?.name || `Product #${link.productId}`}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">${link.product?.price?.toFixed(2)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border/50 text-muted-foreground">{link.token.slice(0, 12)}...</div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider h-5 px-2 border-border/60 bg-background">{getLinkType(link).replace('-', ' ')}</Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-2 w-2 rounded-full shadow-sm",
                          getLinkStatus(link) === "active" ? "bg-emerald-500 shadow-emerald-200" : "bg-amber-500 shadow-amber-200"
                        )} />
                        <span className="font-semibold capitalize text-foreground/80">{getLinkStatus(link)}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1.5 w-32">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-foreground">{getLinkCurrentUsage(link)}</span>
                          <span className="text-muted-foreground">/ {link.usageLimit || "∞"}</span>
                        </div>
                        {link.usageLimit && (
                          <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                getUsagePercentage(link) >= 90 ? "bg-red-500" : 
                                getUsagePercentage(link) >= 70 ? "bg-amber-500" : "bg-emerald-500"
                              )}
                              style={{ width: `${getUsagePercentage(link)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-[10px] font-medium text-muted-foreground">
                        {link.expiresAt 
                          ? new Date(link.expiresAt).toLocaleDateString("en-CA")
                          : "Indefinite"
                        }
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full hover:bg-primary/5 hover:text-primary transition-colors"
                          onClick={() => handleCopyLink(link)}
                          title="Copy Link"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full hover:bg-primary/5 hover:text-primary transition-colors"
                          onClick={() => handleViewUsage(link)}
                          title="View Usage"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full hover:bg-primary/5 hover:text-primary transition-colors"
                          onClick={() => handleEditLink(link)}
                          title="Edit Settings"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Separator orientation="vertical" className="h-4 mx-1 my-auto hidden sm:block opacity-50" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-primary/5"
                          onClick={() => onArchiveLink?.(link.id)}
                        >
                          Archive
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredLinks.length === 0 && (
              <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2">
                <Search className="h-8 w-8 opacity-20" />
                <p className="font-medium text-sm">No promotional links found</p>
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
  </div>
);
}
