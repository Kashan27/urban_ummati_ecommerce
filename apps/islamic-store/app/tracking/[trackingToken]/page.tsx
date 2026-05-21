"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { 
  ArrowRight, 
  Package, 
  Truck, 
  Info, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Globe,
  CreditCard,
  Hash,
  Check
} from "lucide-react";
import { Link } from "@/lib/router";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OrderItem {
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  total: number;
  color?: string | null;
}

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  status: string;
  statusId: number;
  createdAt: string;
}

interface Shipment {
  id: number;
  status: string;
  trackingNumber: string;
  trackingUrl: string;
  carrier: string;
  service: string;
  shipDate: string;
}

interface TrackingData {
  order: Order;
  shipment: Shipment | null;
}

export default function TrackingPage() {
  const { trackingToken } = useParams();
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isLogoSpinning, setIsLogoSpinning] = useState(false);

  const handleCopyUrl = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Automatic Logo Animation (Every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setIsLogoSpinning(true);
      setTimeout(() => setIsLogoSpinning(false), 1000);
    }, 5000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!trackingToken) {
      setError("Tracking link is invalid or expired.");
      setIsLoading(false);
      return;
    }

    const fetchTrackingData = async () => {
      try {
        const response = await fetch(`/api/tracking/${trackingToken}`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || `Failed to fetch tracking data: ${response.statusText}`);
        }
        const data: TrackingData = await response.json();
        setTrackingData(data);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrackingData();
  }, [trackingToken]);

  if (isLoading) {
    return (
      <main className="flex-1 w-full bg-[#f8f9fa] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs font-medium text-muted-foreground animate-pulse">Retrieving secure tracking data...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 w-full bg-[#f8f9fa] px-4 py-20 flex items-center justify-center">
        <div className="max-w-sm w-full bg-white border border-border/60 rounded-2xl p-8 shadow-sm text-center">
          <div className="h-12 w-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Info size={24} />
          </div>
          <h1 className="text-xl font-bold mb-2">Tracking Unavailable</h1>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">{error}</p>
          <Link 
            href="/products" 
            className="flex w-full h-11 items-center justify-center rounded-xl bg-primary text-[13px] font-semibold text-primary-foreground transition-all hover:opacity-90 shadow-lg shadow-primary/10"
          >
            Back to Store
          </Link>
        </div>
      </main>
    );
  }

  if (!trackingData || !trackingData.order) return null;

  const { order, shipment } = trackingData;

  const steps = [
    { label: "Received", done: order.statusId >= 1, current: order.statusId === 1, icon: Clock },
    { label: "Processing", done: order.statusId >= 2, current: order.statusId === 2, icon: Package },
    { label: "Shipped", done: order.statusId >= 3, current: order.statusId === 3, icon: Truck },
    { label: "Delivered", done: order.statusId >= 4, current: order.statusId === 4, icon: CheckCircle2 },
  ];

  return (
    <main className="flex-1 w-full bg-[#f9fafb] min-h-screen">
      {/* Precision Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-3 sticky top-0 z-50 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="transition-opacity hover:opacity-80 group flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="Urban Ummati" 
              className={cn(
                "h-7 w-auto transition-transform duration-1000 ease-in-out group-hover:rotate-[360deg]",
                isLogoSpinning ? "rotate-[360deg]" : "rotate-0"
              )} 
            />
            <span className="font-serif text-lg tracking-[0.2em] text-foreground leading-none mt-1">
              RBAN UMMATI
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none mb-1">Status</p>
              <Badge className="bg-primary/5 text-primary border-primary/20 hover:bg-primary/5 h-5 px-2 text-[9px] font-bold uppercase tracking-widest rounded-md">
                {order.status}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 md:px-6">
        {/* Hero Order Info */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Order <span className="text-primary">#{order.id.toString().padStart(5, "0")}</span>
            </h2>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5"><Clock size={12} /> {format(new Date(order.createdAt), "MMM d, yyyy")}</span>
              <span className="h-1 w-1 rounded-full bg-gray-300" />
              <span className="flex items-center gap-1.5"><Globe size={12} /> Secure Tracking</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCopyUrl}
              className={cn(
                "h-9 px-4 rounded-lg border text-xs font-semibold transition-all flex items-center gap-2",
                isCopied 
                  ? "bg-green-50 border-green-200 text-green-600 shadow-sm" 
                  : "bg-white border-border text-foreground hover:bg-gray-50"
              )}
            >
              {isCopied ? (
                <>
                  <Check size={14} className="text-green-600" /> Copied!
                </>
              ) : (
                <>
                  <Hash size={14} className="text-muted-foreground" /> Copy URL
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Content: Left 8 Columns */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Elegant Status Tracker */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Shipment Progress</h3>
                <span className="text-[10px] font-medium text-primary px-2 py-0.5 bg-primary/5 rounded-md">Live Update</span>
              </div>
              
              <div className="relative pt-2 px-2">
                <div className="absolute top-[17px] left-0 right-0 h-0.5 bg-gray-50 mx-8" />
                <div 
                  className="absolute top-[17px] left-0 h-0.5 bg-primary transition-all duration-1000 mx-8" 
                  style={{ width: `${((steps.filter(s => s.done).length - 1) / (steps.length - 1)) * 100}%` }}
                />
                
                <div className="relative flex justify-between">
                  {steps.map((step, idx) => (
                    <div key={step.label} className="flex flex-col items-center w-1/4">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center transition-all duration-500 z-10",
                        step.done ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-white border border-gray-200 text-gray-300"
                      )}>
                        {step.done ? <CheckCircle2 size={14} /> : <div className="h-1.5 w-1.5 rounded-full bg-current" />}
                      </div>
                      <span className={cn(
                        "mt-3 text-[10px] font-bold uppercase tracking-wider",
                        step.done ? "text-gray-900" : "text-gray-400"
                      )}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="bg-gray-50/50 px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Delivery To</h3>
                <MapPin size={14} className="text-gray-400" />
              </div>
              <div className="p-5">
                <p className="text-xs font-bold mb-1 uppercase tracking-tight">{order.customerName}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {order.shippingAddress}, {order.city}<br />
                  {order.province} {order.postalCode}, {order.country}
                </p>
              </div>
            </div>

            {/* Items List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gray-50/50 px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Order Manifest</h3>
                <ShoppingBag size={14} className="text-gray-400" />
              </div>
              <div className="divide-y divide-gray-50">
                {order.items.map((item) => (
                  <div key={item.productId} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className="h-12 w-12 rounded-lg bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden">
                      <img src={item.productImage} alt={item.productName} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold truncate text-gray-900 uppercase tracking-tight">{item.productName}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Quantity: {item.quantity} {item.color && ` • ${item.color}`}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold">${(item.quantity * item.price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Summary: Right 4 Columns */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-6">Financial Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold text-gray-900">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-semibold text-gray-900">{order.shippingCost === 0 ? "Complimentary" : `$${order.shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Tax</span>
                  <span className="font-semibold text-gray-900">${order.tax.toFixed(2)}</span>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest">Total Paid</span>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">${order.total.toFixed(2)}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">CAD Dollars</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50 flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0">
                  <CreditCard size={14} className="text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1">Payment Verified</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">Your transaction was processed securely via Stripe. Check your email for a PDF receipt.</p>
                </div>
              </div>
            </div>

            <Link 
              href="/products" 
              className="group flex items-center justify-between bg-gray-900 p-5 rounded-2xl text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-gray-900/10"
            >
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest">Storefront</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Return to browsing</p>
              </div>
              <ChevronRight size={18} className="text-gray-500 group-hover:text-white transition-colors" />
            </Link>

            <div className="px-4 py-2">
              <div className="flex items-center gap-2 mb-2">
                <Info size={12} className="text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-wider">Help & Support</p>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                If you have questions about your delivery, please contact our concierge team at <span className="text-primary font-bold">social@urbanummati.store</span>
              </p>
            </div>
          </div>

        </div>
      </div>
      
      <footer className="max-w-6xl mx-auto px-6 py-12 text-center border-t border-gray-100">
        <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-300">
          Refined Urban Lifestyle &bull; Designed in Canada
        </p>
      </footer>
    </main>
  );
}
