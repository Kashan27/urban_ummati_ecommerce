import { useState } from "react";
import {
  useGetAdminStats,
  useListProducts,
  useCreateProduct,
  useDeleteProduct,
  useUpdateOrderStatus,
  useCreateFreeProductLink,
  getGetAdminStatsQueryKey,
  getListProductsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingBag, DollarSign, Users, Plus, Trash2, Link as LinkIcon, Edit, Eye } from "lucide-react";
import { Link } from "@/lib/router";

const ADMIN_PASSWORD = "admin123";

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  comparePrice: z.coerce.number().optional().nullable(),
  category: z.string().min(2),
  imageUrl: z.string().url(),
  inStock: z.boolean().default(true),
  featured: z.boolean().default(false),
  isUpsell: z.boolean().default(false),
  upsellDiscount: z.coerce.number().optional().nullable(),
  colors: z.string().default(""),
});

type ProductFormValues = z.infer<typeof productSchema>;

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    received: "default",
    processed: "secondary",
    shipped: "outline",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${
      status === "received" ? "bg-blue-100 text-blue-800" :
      status === "processed" ? "bg-yellow-100 text-yellow-800" :
      "bg-green-100 text-green-800"
    }`}>
      {status}
    </span>
  );
}

export function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders" | "promo">("dashboard");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [freeProductId, setFreeProductId] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: statsData, isLoading: statsLoading } = useGetAdminStats({
    query: { enabled: authenticated, queryKey: getGetAdminStatsQueryKey() }
  });

  const { data: productsData } = useListProducts(undefined, {
    query: { enabled: authenticated && activeTab === "products", queryKey: getListProductsQueryKey() }
  });

  const createProduct = useCreateProduct();
  const deleteProduct = useDeleteProduct();
  const updateStatus = useUpdateOrderStatus();
  const createFreeLink = useCreateFreeProductLink();

  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      comparePrice: null,
      category: "Wall Art",
      imageUrl: "",
      inStock: true,
      featured: false,
      isUpsell: false,
      upsellDiscount: null,
      colors: "gold,silver,black",
    },
  });

  function handleLogin() {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
    } else {
      setPasswordError("Invalid password. Try admin123.");
    }
  }

  function handleAddProduct(values: ProductFormValues) {
    createProduct.mutate({
      data: {
        ...values,
        price: values.price,
        comparePrice: values.comparePrice ?? null,
        upsellDiscount: values.upsellDiscount ?? null,
        images: [values.imageUrl],
        colors: values.colors.split(",").map(c => c.trim()).filter(Boolean),
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        setIsAddProductOpen(false);
        productForm.reset();
      }
    });
  }

  function handleDeleteProduct(id: number) {
    if (!confirm("Delete this product?")) return;
    deleteProduct.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
      }
    });
  }

  function handleUpdateStatus(orderId: number, status: "received" | "processed" | "shipped") {
    updateStatus.mutate({ id: orderId, data: { status } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
      }
    });
  }

  function handleGenerateFreeLink() {
    const id = parseInt(freeProductId);
    if (!id) return;
    createFreeLink.mutate({ data: { productId: id } }, {
      onSuccess: (link) => {
        const baseUrl = window.location.origin;
        setGeneratedLink(`${baseUrl}/free-product/${link.token}`);
      }
    });
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm bg-card border border-border rounded-sm p-8">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl tracking-[0.14em] mb-1">URBAN UMMATI</h1>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Admin Panel</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                className="w-full h-10 px-3 border border-input bg-background rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                data-testid="input-admin-password"
                placeholder="Enter admin password"
              />
              {passwordError && <p className="text-xs text-destructive mt-1">{passwordError}</p>}
            </div>
            <Button
              onClick={handleLogin}
              className="w-full uppercase tracking-widest text-sm"
              data-testid="button-admin-login"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const stats = statsData;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl tracking-[0.14em]">URBAN UMMATI Admin</h1>
          <p className="text-xs text-primary-foreground/70 uppercase tracking-widest">Management Panel</p>
        </div>
        <Link href="/" className="text-xs text-primary-foreground/70 uppercase tracking-widest hover:text-primary-foreground">
          View Store
        </Link>
      </div>

      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 flex gap-1">
          {(["dashboard", "products", "orders", "promo"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              data-testid={`tab-admin-${tab}`}
              className={`px-6 py-4 text-sm uppercase tracking-widest font-sans border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "dashboard" && (
          <div>
            <h2 className="font-serif text-2xl mb-6">Dashboard Overview</h2>
            {statsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-card border border-border rounded-sm p-6 animate-pulse h-24" />
                ))}
              </div>
            ) : stats && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-card border border-border rounded-sm p-6" data-testid="stat-total-orders">
                    <div className="flex items-center gap-3 mb-2">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Total Orders</span>
                    </div>
                    <p className="font-serif text-3xl">{stats.totalOrders}</p>
                  </div>
                  <div className="bg-card border border-border rounded-sm p-6" data-testid="stat-revenue">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Revenue</span>
                    </div>
                    <p className="font-serif text-3xl">${stats.totalRevenue.toFixed(0)}</p>
                  </div>
                  <div className="bg-card border border-border rounded-sm p-6" data-testid="stat-pending">
                    <div className="flex items-center gap-3 mb-2">
                      <Package className="h-5 w-5 text-primary" />
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Pending</span>
                    </div>
                    <p className="font-serif text-3xl">{stats.pendingOrders}</p>
                  </div>
                  <div className="bg-card border border-border rounded-sm p-6" data-testid="stat-products">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Products</span>
                    </div>
                    <p className="font-serif text-3xl">{stats.totalProducts}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                    <div key={status} className="bg-card border border-border rounded-sm p-4 text-center">
                      <StatusBadge status={status} />
                      <p className="font-serif text-2xl mt-2">{count}</p>
                    </div>
                  ))}
                </div>

                <h3 className="font-serif text-xl mb-4">Recent Orders</h3>
                <div className="bg-card border border-border rounded-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="text-left p-4">Order</th>
                        <th className="text-left p-4">Customer</th>
                        <th className="text-left p-4">Total</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {stats.recentOrders.map((order: any) => (
                        <tr key={order.id} data-testid={`row-order-${order.id}`}>
                          <td className="p-4 font-mono">#{order.id.toString().padStart(5, "0")}</td>
                          <td className="p-4">
                            <div>{order.customerName}</div>
                            <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                          </td>
                          <td className="p-4">${order.total.toFixed(2)}</td>
                          <td className="p-4"><StatusBadge status={order.status} /></td>
                          <td className="p-4">
                            <select
                              value={order.status}
                              onChange={e => handleUpdateStatus(order.id, e.target.value as any)}
                              className="text-xs border border-input rounded px-2 py-1 bg-background"
                              data-testid={`select-order-status-${order.id}`}
                            >
                              <option value="received">Received</option>
                              <option value="processed">Processed</option>
                              <option value="shipped">Shipped</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl">Products</h2>
              <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                <DialogTrigger asChild>
                  <Button className="uppercase tracking-widest text-xs" data-testid="button-add-product">
                    <Plus className="h-4 w-4 mr-1" /> Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-xl">Add New Product</DialogTitle>
                  </DialogHeader>
                  <Form {...productForm}>
                    <form onSubmit={productForm.handleSubmit(handleAddProduct)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={productForm.control} name="name" render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel className="text-xs uppercase tracking-wider">Product Name</FormLabel>
                            <FormControl><Input {...field} data-testid="input-product-name" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={productForm.control} name="price" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs uppercase tracking-wider">Price (CAD)</FormLabel>
                            <FormControl><Input type="number" step="0.01" {...field} data-testid="input-product-price" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={productForm.control} name="comparePrice" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs uppercase tracking-wider">Compare Price</FormLabel>
                            <FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ""} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={productForm.control} name="category" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs uppercase tracking-wider">Category</FormLabel>
                            <FormControl>
                              <select {...field} className="w-full h-10 px-3 border border-input bg-background rounded-sm text-sm">
                                <option>Wall Art</option>
                                <option>Prayer Rugs</option>
                                <option>Tasbeeh</option>
                                <option>Jewelry</option>
                                <option>Decor</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={productForm.control} name="imageUrl" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs uppercase tracking-wider">Image URL</FormLabel>
                            <FormControl><Input {...field} placeholder="https://..." data-testid="input-product-image" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={productForm.control} name="description" render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel className="text-xs uppercase tracking-wider">Description</FormLabel>
                            <FormControl><textarea {...field} rows={3} className="w-full px-3 py-2 border border-input bg-background rounded-sm text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={productForm.control} name="colors" render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel className="text-xs uppercase tracking-wider">Colors (comma-separated)</FormLabel>
                            <FormControl><Input {...field} placeholder="gold, silver, black" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <div className="col-span-2 flex gap-6">
                          <FormField control={productForm.control} name="featured" render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                              <FormControl><input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4 accent-primary" /></FormControl>
                              <FormLabel className="text-xs uppercase tracking-wider mb-0">Featured</FormLabel>
                            </FormItem>
                          )} />
                          <FormField control={productForm.control} name="isUpsell" render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                              <FormControl><input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4 accent-primary" /></FormControl>
                              <FormLabel className="text-xs uppercase tracking-wider mb-0">Upsell</FormLabel>
                            </FormItem>
                          )} />
                          <FormField control={productForm.control} name="inStock" render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                              <FormControl><input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4 accent-primary" /></FormControl>
                              <FormLabel className="text-xs uppercase tracking-wider mb-0">In Stock</FormLabel>
                            </FormItem>
                          )} />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsAddProductOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={createProduct.isPending} data-testid="button-save-product">
                          {createProduct.isPending ? "Saving..." : "Save Product"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="bg-card border border-border rounded-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left p-4">Product</th>
                    <th className="text-left p-4">Category</th>
                    <th className="text-left p-4">Price</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {productsData?.products.map((product) => (
                    <tr key={product.id} data-testid={`row-product-${product.id}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={product.imageUrl} alt={product.name} className="w-10 h-10 object-cover rounded-sm bg-muted" />
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="flex gap-1 mt-0.5">
                              {product.featured && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">Featured</span>}
                              {product.isUpsell && <span className="text-xs bg-secondary/10 text-secondary-foreground px-1.5 py-0.5 rounded">Upsell</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{product.category}</td>
                      <td className="p-4">${product.price.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${product.inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {product.inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link href={`/products/${product.id}`}>
                            <Button variant="outline" size="sm" data-testid={`button-view-product-${product.id}`}>
                              <Eye className="h-3 w-3" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            data-testid={`button-delete-product-${product.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <h2 className="font-serif text-2xl mb-6">Orders</h2>
            {stats?.recentOrders && (
              <div className="bg-card border border-border rounded-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left p-4">Order #</th>
                      <th className="text-left p-4">Customer</th>
                      <th className="text-left p-4">Items</th>
                      <th className="text-left p-4">Total</th>
                      <th className="text-left p-4">Date</th>
                      <th className="text-left p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {stats.recentOrders.map((order: any) => (
                      <tr key={order.id}>
                        <td className="p-4 font-mono text-muted-foreground">#{order.id.toString().padStart(5, "0")}</td>
                        <td className="p-4">
                          <div>{order.customerName}</div>
                          <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                        </td>
                        <td className="p-4 text-muted-foreground">{order.items.length} item(s)</td>
                        <td className="p-4 font-medium">${order.total.toFixed(2)}</td>
                        <td className="p-4 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("en-CA")}</td>
                        <td className="p-4">
                          <select
                            value={order.status}
                            onChange={e => handleUpdateStatus(order.id, e.target.value as any)}
                            className="text-xs border border-input rounded px-2 py-1 bg-background"
                          >
                            <option value="received">Received</option>
                            <option value="processed">Processed</option>
                            <option value="shipped">Shipped</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "promo" && (
          <div className="max-w-2xl">
            <h2 className="font-serif text-2xl mb-6">Free Product Links</h2>
            <div className="bg-card border border-border rounded-sm p-6">
              <h3 className="font-serif text-lg mb-2">Generate Free Product Link</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Generate a unique link that allows a customer to claim a specific product for free.
                Each link can only be used once. Links do not expire.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-wider block mb-1.5">Product ID</label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={freeProductId}
                      onChange={e => setFreeProductId(e.target.value)}
                      className="flex-1 h-10 px-3 border border-input bg-background rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Enter product ID (e.g. 1)"
                      data-testid="input-free-product-id"
                    />
                    <Button
                      onClick={handleGenerateFreeLink}
                      disabled={createFreeLink.isPending || !freeProductId}
                      data-testid="button-generate-link"
                    >
                      <LinkIcon className="h-4 w-4 mr-1" />
                      {createFreeLink.isPending ? "Generating..." : "Generate"}
                    </Button>
                  </div>
                </div>

                {generatedLink && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-sm">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Generated Link</p>
                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        value={generatedLink}
                        className="flex-1 text-xs font-mono p-2 bg-background border border-border rounded"
                        data-testid="text-generated-link"
                        onClick={e => (e.target as HTMLInputElement).select()}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(generatedLink)}
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Share this link with the customer. It can only be used once.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card border border-border rounded-sm p-6 mt-6">
              <h3 className="font-serif text-lg mb-2">Available Products</h3>
              <p className="text-sm text-muted-foreground mb-4">Reference these IDs when generating links:</p>
              {productsData?.products ? (
                <div className="space-y-2">
                  {productsData.products.slice(0, 10).map(p => (
                    <div key={p.id} className="flex justify-between items-center text-sm py-1.5 border-b border-border/50 last:border-0">
                      <span className="text-muted-foreground font-mono">#{p.id}</span>
                      <span className="flex-1 px-4">{p.name}</span>
                      <span className="text-primary font-medium">${p.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("products")}
                >
                  Load Products
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
