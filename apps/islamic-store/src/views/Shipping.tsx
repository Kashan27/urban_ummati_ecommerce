"use client";

import { useEffect, useState } from "react";
import { HelpCircle, Mail, Truck, Clock, Globe, ShieldCheck, Info, Package, AlertTriangle, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "s1", title: "1. Contact Info" },
  { id: "s2", title: "2. Where We Ship" },
  { id: "s3", title: "3. Processing Times" },
  { id: "s4", title: "4. Shipping Times" },
  { id: "s5", title: "5. Processing vs Shipping" },
  { id: "s6", title: "6. Shipping Rates" },
  { id: "s7", title: "7. Free Shipping" },
  { id: "s8", title: "8. Shipping Carriers" },
  { id: "s9", title: "9. Tracking Info" },
  { id: "s10", title: "10. Delivery Attempts" },
  { id: "s11", title: "11. Signature on Delivery" },
  { id: "s12", title: "12. Address Accuracy" },
  { id: "s13", title: "13. Returned-to-Sender" },
  { id: "s14", title: "14. Lost Packages" },
  { id: "s15", title: "15. Delivered but Missing" },
  { id: "s16", title: "16. Damaged Packages" },
  { id: "s17", title: "17. Oversized & Fragile" },
  { id: "s18", title: "18. Shipping Delays" },
  { id: "s19", title: "19. Pre-Orders" },
  { id: "s20", title: "20. Split Shipments" },
  { id: "s22", title: "22. Canada Orders" },
  { id: "s23", title: "23. U.S. Orders & Duties" },
  { id: "s24", title: "24. Refused U.S. Deliveries" },
  { id: "s25", title: "25. International Shipping" },
  { id: "s26", title: "26. Customs Delays" },
  { id: "s27", title: "27. Incorrect Items" },
  { id: "s28", title: "28. Shipping Insurance" },
  { id: "s29", title: "29. Business Days" },
  { id: "s30", title: "30. Changes to Policy" },
];

export function Shipping() {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0% -35% 0%", threshold: 0 }
    );

    SECTIONS.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <main className="flex-1 w-full bg-[#FAF9F6] pb-24">
      <header className="bg-[#152238] py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-[#C9A883] font-bold text-[10px] uppercase tracking-[0.3em] mb-6">
            <Truck size={14} />
            Fulfilment & Delivery
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-6 tracking-tight">
            Shipping Policy
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed uppercase tracking-widest font-medium">
            Last Updated: June 9, 2026
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-12 lg:mt-20">
        <div className="flex flex-col lg:flex-row gap-16">
          
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-28">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#C9A883] mb-8">
                Detailed Points
              </h3>
              <nav className="flex flex-col gap-1 border-l border-slate-200">
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      "text-left px-6 py-1.5 text-[10px] font-medium transition-all border-l-2 -ml-[1px] relative group",
                      activeSection === section.id
                        ? "border-[#C9A883] text-[#152238] bg-white shadow-sm"
                        : "border-transparent text-slate-400 hover:text-[#C9A883] hover:border-slate-300"
                    )}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <article className="flex-1 max-w-3xl prose prose-slate prose-sm md:prose-base prose-h2:font-serif prose-h2:text-3xl prose-h2:text-[#152238] prose-h2:mb-6 prose-h2:mt-12 prose-h3:text-lg prose-h3:font-bold prose-h3:text-[#152238] prose-p:leading-relaxed prose-p:text-slate-600 prose-li:text-slate-600">
            <p className="text-lg font-medium text-[#152238] leading-relaxed mb-12">
              At Urban Ummati, we take care to package and ship our Islamic-inspired wall art and home decor as safely as possible. Many of our products may be handcrafted, limited-release, oversized, fragile, or made in small batches, so shipping timelines may vary by product.
            </p>
            <p className="text-slate-600 mb-12">
              This Shipping Policy explains how orders are processed, shipped, delivered, and handled if there are delays, damages, lost packages, or address issues. By placing an order with Urban Ummati, you agree to this Shipping Policy.
            </p>

            <section id="s1">
              <h2>1. Contact Information</h2>
              <p>For shipping questions, contact us at:</p>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm not-prose mb-8">
                <ul className="space-y-2 text-sm text-[#152238] font-medium">
                  <li><strong>Urban Ummati</strong></li>
                  <li><strong>Email:</strong> <a href="mailto:social@urbanummati.store" className="text-[#C9A883] hover:text-[#152238]">social@urbanummati.store</a></li>
                  <li><strong>Address:</strong> 5063 N Service Rd #200, Burlington, ON L7L 5H6</li>
                </ul>
              </div>
              <p>Please include your order number when contacting us.</p>
            </section>

            <section id="s2">
              <h2>2. Where We Ship</h2>
              <p>We currently ship to:</p>
              <ul>
                <li>Canada</li>
                <li>United States</li>
              </ul>
              <p>We may not be able to ship to certain remote areas, PO boxes, military addresses, freight forwarding addresses, or locations where oversized packages are restricted. If we cannot ship to your location, we will contact you and may cancel and refund your order.</p>
            </section>

            <section id="s3">
              <h2>3. Order Processing Times</h2>
              <p>Order processing time means the time needed to prepare, produce, inspect, package, and hand your order to the shipping carrier.</p>
              <p>Estimated processing times:</p>
              <ul>
                <li>Ready-to-ship items: 2–5 business days</li>
                <li>Made-to-order items: 7–15 business days</li>
                <li>Pre-orders: 7–15 business days, if longer we will notify you</li>
              </ul>
              <p>Processing times do not include weekends, holidays, carrier transit time, customs delays, or delivery exceptions. During product launches, limited releases, holidays, sales, or high-volume periods, processing may take longer.</p>
            </section>

            <section id="s4">
              <h2>4. Shipping Times</h2>
              <p>Shipping time means the estimated time after your order has been handed to the carrier.</p>
              <p>Estimated shipping times:</p>
              <ul>
                <li>Canada Standard Shipping: 2–8 business days</li>
                <li>Canada Expedited Shipping: 1–5 business days</li>
                <li>U.S. Standard Shipping: 3–10 business days</li>
              </ul>
              <p>These are estimates only and are not guaranteed unless clearly stated at checkout. Delivery times may be affected by carrier delays, weather, holidays, customs processing, incorrect addresses, remote locations, or events outside our control.</p>
            </section>

            <section id="s5">
              <h2>5. Processing Time vs. Shipping Time</h2>
              <p>Processing time and shipping time are separate. For example, if a product has a 5-business-day processing time and a 3-business-day shipping estimate, the total estimated delivery time may be around 8 business days.</p>
              <p>For made-to-order or custom products, production time should be expected before shipping begins.</p>
            </section>

            <section id="s6">
              <h2>6. Shipping Rates</h2>
              <p>Shipping rates may be calculated at checkout based on:</p>
              <ul>
                <li>Delivery location</li>
                <li>Package size</li>
                <li>Product weight</li>
                <li>Carrier service</li>
                <li>Oversized package requirements</li>
                <li>Insurance or signature options</li>
                <li>Promotional shipping offers, if applicable</li>
              </ul>
              <p>Shipping fees are non-refundable unless required by law or unless the issue was caused by Urban Ummati. We aim to show shipping charges clearly before checkout is completed.</p>
            </section>

            <section id="s7">
              <h2>7. Free Shipping</h2>
              <p>If we offer free shipping, it may be subject to conditions such as:</p>
              <ul>
                <li>Minimum order value</li>
                <li>Specific products</li>
                <li>Specific regions</li>
                <li>Promotional periods</li>
                <li>Standard shipping only</li>
              </ul>
              <p>Free shipping promotions may be changed, paused, or cancelled at any time. If an order that received free shipping is returned, we may deduct the original shipping cost from the refund where permitted by law and clearly disclosed.</p>
            </section>

            <section id="s8">
              <h2>8. Shipping Carriers</h2>
              <p>We may use carriers such as:</p>
              <ul>
                <li>UPS</li>
                <li>Purolator</li>
                <li>Canada Post</li>
                <li>FedEx</li>
                <li>DHL</li>
                <li>Other regional or freight carriers</li>
              </ul>
              <p>The carrier may be selected based on product size, delivery location, shipping cost, service reliability, and package requirements. For larger wall art, oversized carriers or special handling may be required.</p>
            </section>

            <section id="s9">
              <h2>9. Tracking Information</h2>
              <p>Once your order ships, you will receive tracking information by email or SMS, where available. Tracking updates may take up to 24–48 hours to appear after the carrier receives the package. If your tracking has not updated for several days, contact the carrier first, then contact us if further assistance is needed.</p>
            </section>

            <section id="s10">
              <h2>10. Delivery Attempts</h2>
              <p>Carriers may make one or more delivery attempts depending on the service and location. If delivery is unsuccessful, the carrier may:</p>
              <ul>
                <li>Attempt redelivery</li>
                <li>Hold the package for pickup</li>
                <li>Leave a delivery notice</li>
                <li>Return the package to us</li>
                <li>Mark the package as undeliverable</li>
              </ul>
              <p>Customers are responsible for monitoring tracking and collecting packages when required. If a package is returned to us because it was not collected, additional shipping fees may apply.</p>
            </section>

            <section id="s11">
              <h2>11. Signature on Delivery</h2>
              <p>For higher-value, oversized, or fragile products, we may require signature on delivery. If signature is required, someone must be available at the delivery address to receive the package. If the carrier cannot obtain a signature, the package may be held for pickup, reattempted, or returned.</p>
            </section>

            <section id="s12">
              <h2>12. Address Accuracy</h2>
              <p>Customers are responsible for entering a complete and accurate shipping address at checkout. Please check: Full name, Street address, Unit/suite/apartment/buzzer number, City, Province/state, Postal/ZIP code, Phone number, and Email address.</p>
              <p>Urban Ummati is not responsible for delays, failed delivery, returned packages, or lost packages caused by incorrect or incomplete shipping information. If you notice an address error, contact us immediately. We cannot guarantee address changes once processing has begun.</p>
            </section>

            <section id="s13">
              <h2>13. Returned-to-Sender Packages</h2>
              <p>If a package is returned to us due to customer error, failed delivery, refusal, or non-collection, we may contact you to arrange reshipment. The customer may be responsible for:</p>
              <ul>
                <li>Original shipping cost</li>
                <li>Return shipping cost</li>
                <li>Reshipment cost</li>
                <li>Carrier fees</li>
                <li>Any non-refundable duties, brokerage, or customs charges</li>
              </ul>
              <p>If you choose not to have the order resent, any eligible refund may be reduced by these costs.</p>
            </section>

            <section id="s14">
              <h2>14. Lost Packages</h2>
              <p>If your package appears lost in transit, contact the carrier first and then contact us. We may work with the carrier to investigate the shipment. A package is not usually considered lost until the carrier confirms it as lost or until a reasonable investigation period has passed.</p>
              <p>Depending on the situation, we may offer replacement, refund, store credit, or carrier claim support. Urban Ummati is not responsible for carrier delays, but we will reasonably assist with tracking and claims where possible.</p>
            </section>

            <section id="s15">
              <h2>15. Delivered but Missing Packages</h2>
              <p>If tracking shows your package was delivered but you cannot find it, please check: Front door, Side door, Porch, Garage, Mailroom, Concierge, Parcel locker, Neighbours, Household members, and Building management.</p>
              <p>Once a package is marked delivered by the carrier, Urban Ummati is not responsible for theft, porch piracy, or missing packages after confirmed delivery. However, we will reasonably assist you with carrier claim information where possible.</p>
            </section>

            <section id="s16">
              <h2>16. Damaged Packages or Products</h2>
              <p>If your item arrives damaged, contact us within 48 hours of delivery. Please email <a href="mailto:social@urbanummati.store" className="text-[#C9A883] hover:text-[#152238]">social@urbanummati.store</a> with: Your order number, Photos of the damaged product, Photos of the outer shipping box, Photos of the inner packaging, Photos of the shipping label, and a description of the damage.</p>
              <p>Do not discard the product, packaging, or shipping box until we confirm next steps. The carrier may require photos or inspection. Depending on the situation, we may offer replacement, repair, partial refund, full refund, or carrier claim support.</p>
            </section>

            <section id="s17">
              <h2>17. Oversized and Fragile Items</h2>
              <p>Some Urban Ummati products may be oversized, fragile, or require special packaging. Oversized products may be subject to:</p>
              <ul>
                <li>Higher shipping rates</li>
                <li>Carrier surcharges</li>
                <li>Longer transit times</li>
                <li>Signature requirements</li>
                <li>Limited delivery areas</li>
                <li>Special handling requirements</li>
              </ul>
              <p>Large wall art may not qualify for standard shipping rates. If additional shipping arrangements are needed, we may contact you before fulfilling your order.</p>
            </section>

            <section id="s18">
              <h2>18. Shipping Delays</h2>
              <p>Shipping delays may occur due to: Carrier delays, Severe weather, Holidays, High order volume, Product launch periods, Customs processing, Incorrect address details, Remote delivery locations, Labour disruptions, Supply chain issues, or Events outside our control.</p>
              <p>For U.S. online orders, the FTC’s Mail, Internet, or Telephone Order Merchandise Rule generally requires sellers to ship within the advertised timeframe, or within 30 days if no timeframe is stated. For Ontario customers, if an ordered product is not delivered within 30 days of the promised delivery date, cancellation rights may apply.</p>
            </section>

            <section id="s19">
              <h2>19. Pre-Orders and Made-to-Order Shipping</h2>
              <p>Pre-order, custom, personalized, and made-to-order products may have longer processing times. Estimated production and shipping timelines will be shown on the product page or order confirmation where possible.</p>
              <p>These timelines are estimates and may change due to material availability, production volume, carrier conditions, or quality control. If there is a significant delay, we will aim to notify you.</p>
            </section>

            <section id="s20">
              <h2>20. Split Shipments</h2>
              <p>If your order includes multiple items, we may ship them separately. This may happen if: Items are different sizes, Items ship from different locations, One item is ready before another, A product requires special packaging, or One item is made-to-order. You may receive more than one tracking number.</p>
            </section>

            <section id="s21">
              <h3 className="text-xl font-serif text-[#152238] mt-8 mb-4">21. Local Pickup</h3>
              <p>Local pickup is currently not available, but you can email <a href="mailto:social@urbanummati.store" className="text-[#C9A883] hover:text-[#152238]">social@urbanummati.store</a> to see if any exception can be made.</p>
            </section>

            <section id="s22">
              <h2>22. Canada Orders</h2>
              <p>For Canadian orders, applicable taxes and shipping charges will be shown at checkout where applicable. Shipping rates and delivery times may vary by province, territory, and postal code. Remote or rural areas may require additional time or additional shipping fees.</p>
            </section>

            <section id="s23">
              <h2>23. U.S. Orders, Duties, Taxes, and Brokerage</h2>
              <p>For U.S. orders, customs duties, import taxes, brokerage fees, processing fees, or other charges may apply. Unless clearly stated at checkout, customers are responsible for any import duties, taxes, brokerage fees, customs charges, or other costs required to receive the shipment.</p>
              <p>U.S. Customs and Border Protection explains that internet purchases may be subject to duty and processing fees depending on the item and shipment. Carriers may collect these charges before or at delivery. UPS notes that shipments entering the U.S. may be subject to duties, taxes, and brokerage fees.</p>
            </section>

            <section id="s24">
              <h2>24. Refused U.S. Deliveries</h2>
              <p>If a U.S. customer refuses delivery because of customs duties, taxes, brokerage fees, or import charges, the package may be returned to us or abandoned by the carrier. If the package is returned, any refund may be reduced by: Original shipping fees, Return shipping fees, Brokerage fees, Customs fees, Duties and taxes, Carrier charges, and Non-recoverable costs.</p>
              <p>If the package is abandoned or destroyed by the carrier or customs authority, a refund may not be available.</p>
            </section>

            <section id="s25">
              <h2>25. International Shipping</h2>
              <p>If we offer international shipping outside Canada and the United States, the customer is responsible for any duties, taxes, customs charges, brokerage fees, import requirements, or delivery restrictions unless stated otherwise at checkout.</p>
              <p>Delivery times for international orders are estimates and may vary significantly due to customs processing and local delivery conditions.</p>
            </section>

            <section id="s26">
              <h2>26. Customs Delays</h2>
              <p>Customs authorities may inspect, delay, hold, assess fees, or reject shipments. Urban Ummati is not responsible for customs delays or charges. Customers are responsible for providing any information required by customs or the carrier to complete delivery.</p>
            </section>

            <section id="s27">
              <h2>27. Incorrect, Missing, or Incomplete Items</h2>
              <p>If your order arrives with the wrong item or a missing item, contact us within 7 days of delivery. Please include: Order number, Photos of the item received, Photos of the packing slip, Photos of the packaging, and Description of the issue. If we confirm an error, we will work to correct it.</p>
            </section>

            <section id="s28">
              <h2>28. Shipping Insurance</h2>
              <p>We may purchase shipping insurance for certain orders at our discretion. Shipping insurance does not guarantee immediate refund or replacement. Carrier claims may require documentation, photos, packaging inspection, and investigation time. Customers must cooperate with any carrier claim process.</p>
            </section>

            <section id="s29">
              <h2>29. Business Days</h2>
              <p>Business days are Monday to Friday, excluding weekends and public holidays. Orders placed after business hours, on weekends, or on holidays will usually begin processing on the next business day.</p>
            </section>

            <section id="s30">
              <h2>30. Changes to This Shipping Policy</h2>
              <p>We may update this Shipping Policy from time to time. Changes will be posted on this page with a new “Last Updated” date. The Shipping Policy in effect at the time of your purchase will generally apply to your order.</p>
            </section>

            <div className="mt-20 pt-12 border-t border-slate-200 not-prose">
              <div className="bg-[#152238] rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
                <div>
                  <h3 className="font-serif text-2xl mb-2 text-white">Specific Shipping Query?</h3>
                  <p className="text-slate-300 text-sm">Our logistics team is here to assist with your delivery.</p>
                </div>
                <a href="/contact" className="px-8 py-3 bg-[#C9A883] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#b8976f] transition-all whitespace-nowrap shadow-lg hover:-translate-y-0.5">
                  Contact Logistics
                </a>
              </div>
            </div>
          </article>

        </div>
      </div>
    </main>
  );
}
