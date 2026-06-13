"use client";

import { useEffect, useState } from "react";
import { Link } from "@/lib/router";
import { HelpCircle, Package, ShieldCheck, Truck, CreditCard, Mail, Info, Hammer, Sparkles, AlertCircle, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "orders", title: "Orders", icon: Package },
  { id: "products", title: "Products", icon: Sparkles },
  { id: "artwork", title: "Islamic Artwork", icon: Info },
  { id: "installation", title: "Installation", icon: Hammer },
  { id: "care", title: "Product Care", icon: ShieldCheck },
  { id: "shipping", title: "Shipping", icon: Truck },
  { id: "issues", title: "Damaged & Lost", icon: AlertCircle },
  { id: "returns", title: "Returns & Refunds", icon: Package },
  { id: "us-orders", title: "U.S. Orders", icon: Globe },
  { id: "payments", title: "Payments", icon: CreditCard },
  { id: "marketing", title: "Email & SMS", icon: Mail },
  { id: "wholesale", title: "Wholesale & Press", icon: Info },
];

export function Faq() {
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
      {/* Editorial Header */}
      <header className="bg-[#152238] py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-[#C9A883] font-bold text-[10px] uppercase tracking-[0.3em] mb-6">
            <HelpCircle size={14} />
            Support Center
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-6 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed uppercase tracking-widest font-medium">
            Find answers to common questions about our products and services.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-12 lg:mt-20">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Sticky Navigation (Desktop) */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-28">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#C9A883] mb-8">
                Categories
              </h3>
              <nav className="flex flex-col gap-1 border-l border-slate-200">
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      "text-left px-6 py-2.5 text-xs font-medium transition-all border-l-2 -ml-[1px] relative group",
                      activeSection === section.id
                        ? "border-[#C9A883] text-[#152238] bg-white shadow-sm"
                        : "border-transparent text-slate-400 hover:text-[#C9A883] hover:border-slate-300"
                    )}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
              
              <div className="mt-12 p-6 bg-white border border-slate-100 rounded-2xl">
                <HelpCircle size={20} className="text-[#C9A883] mb-4" />
                <h4 className="text-sm font-bold text-[#152238] mb-2 uppercase tracking-wider">Still have questions?</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Can't find what you're looking for? Our team is ready to assist.
                </p>
                <a href="mailto:social@urbanummati.store" className="mt-4 inline-block text-[10px] font-bold uppercase tracking-widest text-[#C9A883] hover:text-[#152238] transition-colors">
                  Email Support →
                </a>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <article className="flex-1 max-w-3xl prose prose-slate prose-sm md:prose-base prose-h2:font-serif prose-h2:text-3xl prose-h2:text-[#152238] prose-h2:mb-8 prose-h2:mt-16 prose-p:leading-relaxed prose-p:text-slate-600 prose-li:text-slate-600">
            
            <section id="orders">
              <h2>Orders</h2>
              <div className="space-y-6">
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">How do I place an order?</h4>
                  <p>You can place an order directly through our website by choosing your product, adding it to your cart, and completing checkout. Once your order is placed, you should receive an order confirmation by email.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">I did not receive an order confirmation. What should I do?</h4>
                  <p>Please check your spam or junk folder first. If you still cannot find it, contact us at <a href="mailto:social@urbanummati.store" className="text-[#C9A883] hover:text-[#152238]">social@urbanummati.store</a> with the name and email address used at checkout.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Can I change my order after placing it?</h4>
                  <p>Contact us as soon as possible. We will do our best to help, but changes are not guaranteed once an order has entered production, packing, fulfilment, or shipping.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Can I cancel my order?</h4>
                  <p>If your order has not yet entered production, packing, or shipping, we may be able to cancel it. Custom, personalized, made-to-order, or limited-release items may not be cancellable once production has started.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Do you offer gift cards?</h4>
                  <p>No.</p>
                </div>
              </div>
            </section>

            <section id="products">
              <h2>Products</h2>
              <div className="space-y-6">
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">What does Urban Ummati sell?</h4>
                  <p>Urban Ummati creates Islamic-inspired wall art and home decor designed for modern Muslim homes. Our pieces are created to bring meaning, beauty, and a strong visual presence into your space.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Are your products handmade?</h4>
                  <p>Some Urban Ummati products may be handcrafted, made in small batches, or made-to-order. Because of this, slight differences in finish, colour, grain, texture, or edge detail may occur. These variations are part of the character of the piece and are not considered defects.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">What materials are used?</h4>
                  <p>Our products may use materials such as:</p>
                  <ul className="grid grid-cols-2 gap-x-4">
                    <li>Wood & Veneer</li>
                    <li>Acrylic & MDF</li>
                    <li>Plywood</li>
                    <li>Metal hardware</li>
                    <li>LED lighting (where applicable)</li>
                  </ul>
                  <p>Exact materials will be listed on each product page.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Are the colours exactly as shown in the photos?</h4>
                  <p>We do our best to photograph each product accurately, but colours may vary slightly depending on your screen, lighting, device settings, and material finish. Small differences are normal, especially with wood finishes.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Are the dimensions exact?</h4>
                  <p>Product dimensions are listed on each page. Some measurements may be approximate because of material, finish, and handcrafted production tolerances.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">How heavy are the pieces?</h4>
                  <p>The weight will vary by product and size. Each product page should show the estimated product weight. If you are unsure whether your wall can support a piece, contact us before purchasing.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Are your products suitable for outdoor use?</h4>
                  <p>Unless clearly stated on the product page, Urban Ummati products are intended for indoor use only and should not be exposed to rain, snow, or extreme temperature changes.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Can I request a custom size or colour?</h4>
                  <p>If custom options are available, they will be shown on the product page or handled by request. Custom, personalized, or made-to-order products may be final sale once production begins.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Are limited-release items restocked?</h4>
                  <p>Some limited releases may return, but restocks are not guaranteed. If a product is marked as limited release, it may only be available in small quantities or for a limited time.</p>
                </div>
              </div>
            </section>

            <section id="artwork">
              <h2>Islamic Artwork & Meaning</h2>
              <div className="space-y-6">
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">What is the meaning behind the artwork?</h4>
                  <p>Each Urban Ummati piece is designed to carry meaning, beauty, and presence within the home. Where relevant, product pages may include a short explanation of the artwork or phrase.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Are translations or explanations provided?</h4>
                  <p>Where applicable, we provide general translations for Arabic phrases or Islamic references. These are provided for general understanding and artistic context only.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Are your products religious rulings or scholarly interpretations?</h4>
                  <p>No. Urban Ummati products are decorative and artistic. Explanations on our website are for general context only and should not be treated as religious rulings or scholarly advice.</p>
                </div>
              </div>
            </section>

            <section id="installation">
              <h2>Installation & Mounting</h2>
              <div className="space-y-6">
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Does the artwork come with mounting hardware?</h4>
                  <p>Each product page will state whether mounting hardware is included. For larger or heavier pieces, additional wall anchors or professional installation may be required.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Can I install the piece myself?</h4>
                  <p>Some pieces are suitable for self-installation, while larger or heavier items may require two people or a professional installer. Always check the product weight and wall type first.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">What wall types can I mount the artwork on?</h4>
                  <p>This depends on the product. Common wall types include Drywall, Stud walls, Brick, Concrete, Plaster, and Wood panel walls. Different walls require different anchors.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Is Urban Ummati responsible for installation damage?</h4>
                  <p>Urban Ummati is not responsible for damage, injury, or loss caused by incorrect installation, unsuitable wall anchors, or improper handling. We recommend professional installation for heavy pieces.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Can I hang artwork above a bed, sofa, crib, or stairway?</h4>
                  <p>You may, but extra care is required. For any piece installed above high-traffic or sleeping areas, we strongly recommend using secure mounting hardware and professional installation.</p>
                </div>
              </div>
            </section>

            <section id="care">
              <h2>Product Care</h2>
              <div className="space-y-6">
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">How do I clean my Urban Ummati piece?</h4>
                  <p>Use a soft, dry cloth to gently remove dust. Avoid water, harsh chemicals, abrasive cleaners, wet cloths, sprays, or solvents which can damage the finish.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Can the artwork be exposed to sunlight?</h4>
                  <p>Avoid prolonged direct sunlight, as it may affect colours, finishes, wood, adhesives, or materials over time.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Can I place the artwork in a bathroom or humid area?</h4>
                  <p>Unless clearly stated, we do not recommend placing Urban Ummati products in bathrooms or areas with high moisture. Humidity can affect wood, adhesives, and layered materials.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">What should I do if my piece has LED lighting?</h4>
                  <p>Follow the care and safety instructions provided with that product. Do not expose LED components, wiring, or power supplies to water or moisture. Only use the recommended power supply.</p>
                </div>
              </div>
            </section>

            <section id="shipping">
              <h2>Shipping</h2>
              <div className="space-y-6">
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Where do you ship?</h4>
                  <p>We currently ship to Canada and the United States. Available shipping locations will be shown at checkout.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">How long does shipping take?</h4>
                  <p>Processing takes 2–5 days for ready items and 7–15 days for made-to-order. Shipping transit typically takes 2–8 days in Canada and 3–10 days in the U.S. These are estimates.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Will I receive tracking?</h4>
                  <p>Yes, where tracking is available. Once your order ships, you will receive tracking details by email or SMS.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Which carriers do you use?</h4>
                  <p>We may use UPS, Purolator, Canada Post, FedEx, DHL, or regional carriers depending on the product size, destination, and service selected.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Do you ship to PO boxes?</h4>
                  <p>Large wall art and oversized packages may not be eligible for PO box delivery. We may contact you for an alternative address if needed.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Do you offer local pickup?</h4>
                  <p>Not yet, but you can email <a href="mailto:social@urbanummati.store" className="text-[#C9A883] hover:text-[#152238]">social@urbanummati.store</a> to see if any exceptions can be made for your specific location.</p>
                </div>
              </div>
            </section>

            <section id="issues">
              <h2>Damaged, Lost, or Missing Packages</h2>
              <div className="space-y-6">
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">What should I do if my item arrives damaged?</h4>
                  <p>Contact us within 48 hours of delivery at <a href="mailto:social@urbanummati.store" className="text-[#C9A883] hover:text-[#152238]">social@urbanummati.store</a> with your order number and photos of the product, the outer box, and the inner packaging. Keep everything until we confirm next steps.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Why do I need to keep the packaging?</h4>
                  <p>Shipping carriers may require photos or inspection of the original packaging to process a damage claim. If the packaging is discarded, it may be harder to verify the damage.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">What happens if my package is lost?</h4>
                  <p>If tracking hasn't updated or the package appears lost, contact the carrier first and then contact us. We will assist with tracking or carrier claim information where possible.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">What if tracking says delivered but I cannot find it?</h4>
                  <p>Please check around your delivery location, neighbours, or concierge. Once a package is marked delivered, Urban Ummati is not responsible for theft or porch piracy, but we will assist where possible.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">What if I entered the wrong shipping address?</h4>
                  <p>Contact us immediately. If the order has already shipped, we cannot guarantee changes. Customers are responsible for extra shipping costs caused by incorrect addresses.</p>
                </div>
              </div>
            </section>

            <section id="returns">
              <h2>Returns & Refunds</h2>
              <div className="space-y-6">
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">What is your return policy?</h4>
                  <p>Eligible standard items may be returned within 14 days of delivery if unused and in original condition. Custom, personalized, and made-to-order items are not returnable unless damaged or incorrect.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">How do I start a return?</h4>
                  <p>Email us at <a href="mailto:social@urbanummati.store" className="text-[#C9A883] hover:text-[#152238]">social@urbanummati.store</a> with your order number, product name, and reason for return. Please do not send anything back until your return has been approved.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Who pays for return shipping?</h4>
                  <p>Customers are responsible for return shipping unless the item arrived damaged, defective, or incorrect due to our error.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Are original shipping fees refundable?</h4>
                  <p>Original shipping fees are generally non-refundable unless the return is due to an Urban Ummati error or required by law.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">How long does a refund take?</h4>
                  <p>Once we receive and inspect an approved return, refunds are usually processed within 5–10 business days. Your bank may take additional time to post it.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Can I exchange my item?</h4>
                  <p>Exchanges may be available depending on availability. Because many items are limited-release or made-to-order, exchanges are not guaranteed.</p>
                </div>
              </div>
            </section>

            <section id="us-orders">
              <h2>U.S. Orders, Duties, and Taxes</h2>
              <div className="space-y-6">
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Will I pay duties or taxes on U.S. orders?</h4>
                  <p>Customs duties, taxes, or brokerage fees may apply. Unless stated otherwise, customers are responsible for these charges at delivery.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">What happens if I refuse delivery because of duties?</h4>
                  <p>If a package is refused because of fees, any refund may be reduced by original shipping, return shipping, carrier charges, and non-recoverable fees.</p>
                </div>
              </div>
            </section>

            <section id="payments">
              <h2>Payments & Discounts</h2>
              <div className="space-y-6">
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">What payment methods do you accept?</h4>
                  <p>We accept major credit cards, debit cards, digital wallets, and PayPal. Your information is processed securely through third-party providers.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Can I use more than one discount code?</h4>
                  <p>Unless stated otherwise, discount codes cannot be combined for a single order.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">My discount code is not working. What should I do?</h4>
                  <p>Check the expiry, minimum spend requirements, and product eligibility. If you still have trouble, contact us before placing your order.</p>
                </div>
              </div>
            </section>

            <section id="marketing">
              <h2>Email, SMS, and Accounts</h2>
              <div className="space-y-6">
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Will I receive marketing messages?</h4>
                  <p>Only if you provide consent. You can unsubscribe at any time using the link in our emails or replying "STOP" to SMS messages.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Do I need an account to place an order?</h4>
                  <p>No. Guest checkout is available. Creating an account helps you view order history and manage your details more easily.</p>
                </div>
              </div>
            </section>

            <section id="wholesale">
              <h2>Wholesale, Collaborations, and Press</h2>
              <div className="space-y-6">
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Do you offer wholesale?</h4>
                  <p>Not currently, but you can email <a href="mailto:social@urbanummati.store" className="text-[#C9A883] hover:text-[#152238]">social@urbanummati.store</a> with your request for consideration.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Do you work with influencers or creators?</h4>
                  <p>We may work with selected creators, photographers, and brand partners. For collaboration enquiries, contact us with your social handles.</p>
                </div>
                <div>
                  <h4 className="text-[#152238] font-bold mb-2">Do you accept custom projects?</h4>
                  <p>Yes. We accept custom projects for businesses, masjids, or interior designers. Contact us with your project details, timeline, and size requirements.</p>
                </div>
              </div>
            </section>

            <div className="mt-20 pt-12 border-t border-slate-200 not-prose">
              <div className="bg-[#152238] rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
                <div>
                  <h3 className="font-serif text-2xl mb-2 text-white">Can't find your answer?</h3>
                  <p className="text-slate-300 text-sm">Our support team is always here to help.</p>
                </div>
                <Link href="/contact" className="px-8 py-3 bg-[#C9A883] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#b8976f] transition-all whitespace-nowrap shadow-lg hover:-translate-y-0.5">
                  Contact Support
                </Link>
              </div>
            </div>
          </article>

        </div>
      </div>
    </main>
  );
}
