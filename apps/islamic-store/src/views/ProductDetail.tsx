import { useState } from "react";
import { useParams, Link } from "@/lib/router";
import { useGetProduct, getGetProductQueryKey } from "@workspace/api-client-react";
import { useCart } from "@/lib/cart-context";
import { Star, StarHalf, Minus, Plus, Truck, ShieldCheck, RefreshCw, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getColorName } from "@/lib/color-utils";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id, 10);
  const { addItem, setIsCartOpen } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<{hex: string; name: string} | undefined>(undefined);
  const [activeImage, setActiveImage] = useState<string>('');

  const { data, isLoading, error } = useGetProduct(productId, {
    query: {
      enabled: !isNaN(productId),
      queryKey: getGetProductQueryKey(productId)
    }
  });

  const product = (data as any)?.product;
  const settings = (data as any)?.settings;

  // Set initial color and image when product loads
  if (product && !selectedColor && product.colors && product.colors.length > 0) {
    setSelectedColor(product.colors[0]);
  }
  if (product && !activeImage) {
    setActiveImage(product.imageUrl || '/product-1.png');
  }

  const isEnforced = settings?.enforce_stock_restrictions === "true";
  const displayStock = settings?.display_stock_to_customers === "true";
  const lowStockThreshold = parseInt(settings?.low_stock_threshold || "5", 10);
  const stockQty = product?.inventoryQuantity;
  const isLowStock = typeof stockQty === "number" && stockQty > 0 && stockQty <= lowStockThreshold;
  const maxPurchaseQty = isEnforced && typeof stockQty === "number" ? stockQty : 99;

  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error("Please select a color");
      return;
    }

    if (isEnforced && typeof stockQty === "number" && quantity > stockQty) {
      toast.error(`Only ${stockQty} items available in stock`);
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      color: selectedColor?.name,
      imageUrl: product.imageUrl
    });
    
    // Reset quantity
    setQuantity(1);
    setIsCartOpen(true);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} size={16} className="fill-[#F59E0B] text-[#F59E0B]" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarHalf key={i} size={16} className="fill-[#F59E0B] text-[#F59E0B]" />);
      } else {
        stars.push(<Star key={i} size={16} className="text-muted-foreground/30" />);
      }
    }
    return stars;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 animate-pulse">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/2 aspect-square bg-muted"></div>
          <div className="w-full md:w-1/2 space-y-6 pt-4">
            <div className="h-4 bg-muted w-32"></div>
            <div className="h-10 bg-muted w-3/4"></div>
            <div className="h-6 bg-muted w-1/4"></div>
            <div className="h-px bg-muted w-full my-8"></div>
            <div className="h-32 bg-muted w-full"></div>
            <div className="h-14 bg-muted w-full mt-8"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="font-serif text-3xl mb-4">Product not found</h2>
        <p className="font-sans text-muted-foreground mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <Link href="/products" className="bg-primary text-primary-foreground px-8 py-3 font-sans uppercase tracking-widest text-sm hover:bg-primary/90 transition-colors">
          Back to Shop
        </Link>
      </div>
    );
  }

  const allImages = [...new Set([product.imageUrl, ...(product.images || [])])].filter(Boolean);
  const categoryLabel = product.categoryName || "";

  return (
    <main className="flex-1 w-full bg-background pt-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link href={`/products?category=${product.categorySlug}`} className="hover:text-primary transition-colors">
            {categoryLabel}
          </Link>
          <ChevronRight size={12} />
          <span className="text-foreground truncate">{product.name}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-12 lg:gap-16">
          
          {/* Images */}
          <div className="w-full md:w-1/2 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails (Left on desktop, bottom on mobile) */}
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto md:w-20 lg:w-24 shrink-0 pb-2 md:pb-0 hide-scrollbar">
              {allImages.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative aspect-square w-20 md:w-full shrink-0 overflow-hidden border-2 transition-colors ${
                    activeImage === img ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img || '/product-1.png'} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            
            {/* Main Image */}
            <div className="relative aspect-square w-full bg-muted flex-1 overflow-hidden group">
              <img 
                src={activeImage || '/product-1.png'} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {product.comparePrice && product.comparePrice > product.price && (
                <div className="absolute top-4 left-4 bg-destructive text-white text-xs font-bold px-3 py-1.5 uppercase tracking-wider">
                  Sale
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="w-full md:w-1/2 pt-2 md:pt-6">
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4 leading-tight">
              {product.name}
            </h1>
            
            {/* <div className="flex items-center gap-4 mb-6">
              <div className="flex gap-0.5">
                {renderStars(product.rating || 5)}
              </div>
              <span className="text-sm text-muted-foreground font-sans">
                {product.reviewCount || 0} Reviews
              </span>
            </div> */}

            <div className="flex items-center gap-4 mb-8">
              <span className="font-sans font-bold text-2xl text-foreground">
                ${product.price.toFixed(2)} CAD
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="font-sans text-lg text-muted-foreground line-through">
                  ${product.comparePrice.toFixed(2)} CAD
                </span>
              )}
            </div>

            <div className="w-full h-px bg-border mb-8"></div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-sans uppercase tracking-widest text-sm font-bold">Color</span>
                  <span className="font-sans text-sm text-muted-foreground capitalize">
                    {selectedColor ? getColorName(selectedColor.hex) : 'Select a color'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color: {hex: string; name: string}) => (
                    <button
                      key={color.hex}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                        selectedColor?.hex === color.hex ? 'border-primary scale-110' : 'border-border hover:border-muted-foreground'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                      aria-label={`Select color ${color.name}`}
                    >
                      {/* Show checkmark for selected color */}
                      {selectedColor === color && (
                        <svg 
                          className="w-5 h-5 text-white drop-shadow-md" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
                {/* Color name hint */}
                <p className="text-xs text-muted-foreground mt-2">
                  Hover over a color to see its name
                </p>
              </div>
            )}

            {/* Stock Indicator */}
            {product.inStock && displayStock && (isLowStock || isEnforced) && (
              <div className="mb-4 flex items-center gap-2">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  isLowStock ? "bg-orange-500 animate-pulse" : "bg-green-500"
                )} />
                <span className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  isLowStock ? "text-orange-600" : "text-green-600"
                )}>
                  {typeof stockQty === "number" 
                    ? (isLowStock ? `ONLY ${stockQty} LEFT IN STOCK` : `${stockQty} IN STOCK`)
                    : "IN STOCK"
                  }
                </span>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <div className="flex items-center border border-border h-14 bg-white">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-5 h-full text-muted-foreground hover:text-foreground transition-colors hover:bg-muted"
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-sans font-bold">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(maxPurchaseQty, quantity + 1))}
                  className="px-5 h-full text-muted-foreground hover:text-foreground transition-colors hover:bg-muted"
                  disabled={quantity >= maxPurchaseQty}
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <button 
                onClick={handleAddToCart}
                disabled={!product.inStock || (isEnforced && stockQty === 0)}
                className={`flex-1 h-14 font-sans uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 ${
                  product.inStock 
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-1 hover:shadow-lg' 
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                {product.inStock ? 'Add to Cart' : 'Sold Out'}
              </button>
            </div>

            {/* Description */}
            <div className="mb-10 prose prose-sm md:prose-base text-foreground/80 font-sans max-w-none">
              <p>{product.description}</p>
            </div>

            {/* Value Props */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-y border-border">
              <div className="flex flex-col items-center text-center gap-2">
                <Truck size={24} className="text-secondary" strokeWidth={1.5} />
                <span className="font-sans text-xs uppercase tracking-wider font-bold">Free Shipping</span>
                <span className="font-sans text-xs text-muted-foreground">Orders over $75</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <ShieldCheck size={24} className="text-secondary" strokeWidth={1.5} />
                <span className="font-sans text-xs uppercase tracking-wider font-bold">Lifetime Warranty</span>
                <span className="font-sans text-xs text-muted-foreground">On all metal art</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RefreshCw size={24} className="text-secondary" strokeWidth={1.5} />
                <span className="font-sans text-xs uppercase tracking-wider font-bold">Free Returns</span>
                <span className="font-sans text-xs text-muted-foreground">Within 30 days</span>
              </div>
            </div>

            {/* Dimensions */}
            {(product.weight || product.length || product.width || product.height) && (
              <div className="py-6 border-b border-border">
                <h3 className="font-sans text-xs uppercase tracking-wider font-bold mb-4 text-foreground/70">
                  Product Dimensions
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {product.weight && (
                    <div className="flex flex-col p-3 bg-muted/50 rounded-lg">
                      <span className="font-sans text-xs text-muted-foreground uppercase tracking-wider">Weight</span>
                      <span className="font-sans font-semibold text-foreground">{Number(product.weight).toFixed(2)} g</span>
                    </div>
                  )}
                  {product.length && (
                    <div className="flex flex-col p-3 bg-muted/50 rounded-lg">
                      <span className="font-sans text-xs text-muted-foreground uppercase tracking-wider">Length</span>
                      <span className="font-sans font-semibold text-foreground">{Number(product.length).toFixed(1)} in</span>
                    </div>
                  )}
                  {product.width && (
                    <div className="flex flex-col p-3 bg-muted/50 rounded-lg">
                      <span className="font-sans text-xs text-muted-foreground uppercase tracking-wider">Width</span>
                      <span className="font-sans font-semibold text-foreground">{Number(product.width).toFixed(1)} in</span>
                    </div>
                  )}
                  {product.height && (
                    <div className="flex flex-col p-3 bg-muted/50 rounded-lg">
                      <span className="font-sans text-xs text-muted-foreground uppercase tracking-wider">Height</span>
                      <span className="font-sans font-semibold text-foreground">{Number(product.height).toFixed(1)} in</span>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}
