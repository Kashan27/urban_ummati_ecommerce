"use client";

import { useEffect, useState } from "react";
import { Scale, ShieldCheck, HelpCircle, Mail, RefreshCw, Package, Truck, AlertTriangle, Clock, Camera, Gift, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "s1", title: "1. Contact Info" },
  { id: "s2", title: "2. Return Window" },
  { id: "s3", title: "3. Non-Returnable" },
  { id: "s4", title: "4. How to Start" },
  { id: "s5", title: "5. Shipping Costs" },
  { id: "s6", title: "6. Packaging" },
  { id: "s7", title: "7. Inspection" },
  { id: "s8", title: "8. Refund Timing" },
  { id: "s9", title: "9. Partial Refunds" },
  { id: "s10", title: "10. Exchanges" },
  { id: "s11", title: "11. Damaged Items" },
  { id: "s12", title: "12. Mfg Defects" },
  { id: "s13", title: "13. Variations" },
  { id: "s14", title: "14. Address Issues" },
  { id: "s15", title: "15. Lost Packages" },
  { id: "s16", title: "16. Delayed Shipments" },
  { id: "s17", title: "17. Pre-Orders" },
  { id: "s18", title: "18. Cancellations" },
  { id: "s19", title: "19. Refused Deliveries" },
  { id: "s20", title: "20. U.S. Cross-Border" },
  { id: "s21", title: "21. Gifts" },
  { id: "s22", title: "22. Disputes" },
  { id: "s23", title: "23. Abuse of Policy" },
  { id: "s24", title: "24. Your Legal Rights" },
  { id: "s25", title: "25. Changes to Policy" },
];

export function Returns() {
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
            <RefreshCw size={14} />
            Customer Assurance
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-6 tracking-tight">
            Returns & Refund Policy
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
              At Urban Ummati, we want you to feel confident when purchasing our Islamic-inspired wall art and home decor. Each piece is handled with care, and many of our products may be handcrafted, limited-release, made in small batches, or made-to-order.
            </p>
            <p className="text-slate-600 mb-12">
              This Returns & Refund Policy explains when returns, exchanges, refunds, replacements, and damaged item claims may be accepted. By placing an order with Urban Ummati, you agree to this policy.
            </p>

            <section id="s1">
              <h2>1. Contact Information</h2>
              <p>For all return, refund, exchange, or damaged item requests, contact us at:</p>
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
              <h2>2. Return Window</h2>
              <p>For eligible standard products, you may request a return within: <strong>14 days from the date of delivery.</strong></p>
              <p>To be eligible for a return, the item must be:</p>
              <ul>
                <li>Unused</li>
                <li>Undamaged</li>
                <li>In original condition</li>
                <li>In original packaging where possible</li>
                <li>Complete with all included parts, inserts, mounting guidance, or accessories</li>
                <li>Returned only after receiving return approval from Urban Ummati</li>
              </ul>
              <p>Items sent back without prior approval may not be accepted.</p>
            </section>

            <section id="s3">
              <h2>3. Non-Returnable and Final Sale Items</h2>
              <p>The following items are final sale and are not eligible for return, exchange, or refund unless they arrive damaged, defective, or we made an error with your order:</p>
              <ul>
                <li>Custom products</li>
                <li>Personalized products</li>
                <li>Made-to-order products</li>
                <li>Bespoke size or colour requests</li>
                <li>Limited-release items marked as final sale</li>
                <li>Clearance or sale items marked final sale</li>
                <li>Gift cards</li>
                <li>Products damaged after delivery</li>
                <li>Products altered, installed, mounted, used, or modified by the customer</li>
                <li>Products returned without proper packaging where safe return shipping is not possible</li>
              </ul>
              <p>This does not limit any rights you may have under applicable consumer protection laws.</p>
            </section>

            <section id="s4">
              <h2>4. How to Start a Return</h2>
              <p>To request a return, email us at <a href="mailto:social@urbanummati.store" className="text-[#C9A883] hover:text-[#152238]"><strong>social@urbanummati.store</strong></a> within the return window. Please include:</p>
              <ul>
                <li>Your full name</li>
                <li>Order number</li>
                <li>Email address used at checkout</li>
                <li>Product name</li>
                <li>Reason for return</li>
                <li>Photos of the product</li>
                <li>Photos of the packaging, if relevant</li>
              </ul>
              <p>If your return is approved, we will provide return instructions. Do not send the item back until your return has been approved.</p>
            </section>

            <section id="s5">
              <h2>5. Return Shipping Costs</h2>
              <p>Unless the return is due to our error, the customer is responsible for return shipping costs. This includes returns due to:</p>
              <ul>
                <li>Change of mind</li>
                <li>Ordering the wrong item</li>
                <li>Ordering the wrong size</li>
                <li>Product not matching your room, wall, decor, or personal preference</li>
                <li>Refusal of delivery</li>
                <li>Incorrect shipping address provided by the customer</li>
                <li>Failure to collect or receive the package</li>
              </ul>
              <p>Urban Ummati may cover return shipping or provide a replacement where: The wrong item was sent, the item arrived damaged, the item has a confirmed manufacturing defect, or the order issue was caused by Urban Ummati. Original shipping fees are non-refundable unless required by law or unless the return is due to our error.</p>
            </section>

            <section id="s6">
              <h2>6. Packaging Returned Items</h2>
              <p>Wall art and decor pieces can be fragile, oversized, or easily damaged during return shipping. Returned items must be packaged securely. We strongly recommend using the original packaging.</p>
              <p>If an item is damaged during return shipping because it was not packaged properly, we may reduce or refuse the refund. Customers are responsible for keeping proof of shipment and tracking. We are not responsible for return packages that are lost, delayed, misdelivered, or damaged in transit.</p>
            </section>

            <section id="s7">
              <h2>7. Inspection of Returned Items</h2>
              <p>Once we receive your return, we will inspect the item. We may refuse the return or reduce the refund if the item is:</p>
              <ul>
                <li>Used</li>
                <li>Installed or mounted</li>
                <li>Damaged after delivery</li>
                <li>Missing parts</li>
                <li>Not in original condition</li>
                <li>Returned outside the approved return window</li>
                <li>Returned without authorization</li>
                <li>Packaged unsafely and damaged in transit</li>
              </ul>
              <p>If the return is approved after inspection, we will process your refund.</p>
            </section>

            <section id="s8">
              <h2>8. Refund Timing</h2>
              <p>Approved refunds will be issued to the original payment method. Please allow 5–10 business days after approval for the refund to be processed. Your bank, card issuer, or payment provider may take additional time to post the refund. We will notify you once your refund has been processed.</p>
            </section>

            <section id="s9">
              <h2>9. Partial Refunds</h2>
              <p>A partial refund may be issued where appropriate, including where:</p>
              <ul>
                <li>The item is returned with minor damage</li>
                <li>Parts, accessories, packaging, or inserts are missing</li>
                <li>The item shows signs of handling beyond what is necessary to inspect it</li>
                <li>The product was returned late but accepted at our discretion</li>
                <li>A restocking or return processing fee applies and was disclosed</li>
              </ul>
              <p>Any deduction will be explained to you.</p>
            </section>

            <section id="s10">
              <h2>10. Exchanges</h2>
              <p>We may offer exchanges for eligible products, depending on availability. Exchanges are not guaranteed because many Urban Ummati products may be limited-release, small-batch, handcrafted, or made-to-order.</p>
              <p>If the replacement item costs more, you will be responsible for the price difference. If it costs less, we may refund the difference. Return shipping rules still apply.</p>
            </section>

            <section id="s11">
              <h2>11. Damaged Items on Delivery</h2>
              <p>If your item arrives damaged, contact us within: <strong>48 hours of delivery.</strong></p>
              <p>Please email <a href="mailto:social@urbanummati.store" className="text-[#C9A883] hover:text-[#152238]"><strong>social@urbanummati.store</strong></a> with: Your order number, Photos of the damaged item, Photos of the outer shipping box, Photos of the inner packaging, Photos of the shipping label, and a clear description of the damage.</p>
              <p>Please do not throw away the product, box, or packaging until we confirm the next steps. Depending on the situation, we may offer: a replacement, a repair solution, a partial refund, a full refund, or a shipping carrier claim process.</p>
            </section>

            <section id="s12">
              <h2>12. Manufacturing Defects</h2>
              <p>If you believe your item has a manufacturing defect, contact us at <a href="mailto:social@urbanummati.store" className="text-[#C9A883] hover:text-[#152238]">social@urbanummati.store</a> with your order number and photos. A manufacturing defect does not include:</p>
              <ul>
                <li>Natural wood grain variation</li>
                <li>Slight colour or finish variation</li>
                <li>Minor handmade variation</li>
                <li>Differences caused by screen display settings</li>
                <li>Damage from incorrect installation</li>
                <li>Damage from improper handling</li>
                <li>Damage from moisture, heat, sunlight, or chemicals</li>
                <li>Normal wear and tear</li>
                <li>Damage caused by modifying the product</li>
              </ul>
            </section>

            <section id="s13">
              <h2>13. Natural and Handmade Variations</h2>
              <p>Many Urban Ummati products may involve wood, layered materials, finishes, handcrafted production, or small-batch manufacturing. Slight differences in the following are not considered defects: Colour, Texture, Wood grain, Finish, Edge detail, Minor size tolerance, Natural material variation, Handmade character, and Slight differences from photography or screen display.</p>
            </section>

            <section id="s14">
              <h2>14. Incorrect or Incomplete Shipping Address</h2>
              <p>Customers are responsible for entering the correct shipping address at checkout. Urban Ummati is not responsible for failed delivery, returned packages, lost packages, or extra shipping costs caused by: Incorrect address, Missing unit numbers, Wrong postal code, Customer relocation, Refused delivery, Failure to collect, or Carrier access issues.</p>
              <p>If returned due to address error, we may offer to resend after additional shipping is paid. If a refund is requested, it may exclude original shipping, return charges, and non-refundable costs.</p>
            </section>

            <section id="s15">
              <h2>15. Lost or Stolen Packages</h2>
              <p>If tracking shows that your package was delivered but you cannot locate it, please check your surroundings, neighbors, or concierge. Urban Ummati is not responsible for theft, porch piracy, or missing packages after carrier-confirmed delivery. However, we will reasonably assist you with carrier information where possible.</p>
            </section>

            <section id="s16">
              <h2>16. Delayed Shipments</h2>
              <p>Shipping and delivery timelines are estimates. Delays may occur due to production, volume, carrier issues, weather, holidays, or customs. If there is a significant delay, we will aim to notify you. For U.S. customers, if no timeframe is provided, we aim to ship within 30 days or provide required notices.</p>
            </section>

            <section id="s17">
              <h2>17. Pre-Orders and Made-to-Order Products</h2>
              <p>Estimated production and shipping timelines will be provided where possible. Because these are reserved or produced specifically for you, they may be final sale once production has started, unless defective, damaged, or required by law.</p>
            </section>

            <section id="s18">
              <h2>18. Order Cancellations</h2>
              <p>If you need to cancel, contact us as soon as possible. We cannot guarantee cancellation once an order has entered production, packing, or shipping. For custom, personalized, or made-to-order products, cancellations may not be available once work has started.</p>
            </section>

            <section id="s19">
              <h2>19. Refused Deliveries</h2>
              <p>If you refuse delivery without prior approval, your refund may be reduced by: Original shipping costs, Return shipping costs, Carrier fees, Customs or duties, and Restocking or handling fees. Refused delivery does not automatically qualify for a full refund.</p>
            </section>

            <section id="s20">
              <h2>20. U.S. Orders, Duties, and Cross-Border Returns</h2>
              <p>For U.S. customers, import duties, customs charges, brokerage fees, or local taxes may apply. Unless stated otherwise, the customer is responsible for these charges. If a package is refused because of these fees, any refund may be reduced by non-recoverable costs.</p>
            </section>

            <section id="s21">
              <h2>21. Gifts</h2>
              <p>If the item was marked as a gift and shipped directly to the recipient, we may provide store credit or an exchange. If not marked as a gift, refunds will usually be issued to the original purchaser and payment method.</p>
            </section>

            <section id="s22">
              <h2>22. Chargebacks and Payment Disputes</h2>
              <p>Please contact us first to try to resolve any issue. Filing a chargeback without contact may delay resolution. We reserve the right to provide order records and policy details to the payment provider in response to a dispute.</p>
            </section>

            <section id="s23">
              <h2>23. Abuse of Return Policy</h2>
              <p>We reserve the right to refuse service where we believe there is abuse of our policy, including: Excessive return activity, Fraudulent damage claims, False delivery claims, or Chargeback abuse.</p>
            </section>

            <section id="s24">
              <h2>24. Your Legal Rights</h2>
              <p>Nothing in this policy limits any rights you may have under applicable consumer protection laws. Where this policy conflicts with mandatory law, the mandatory law will apply.</p>
            </section>

            <section id="s25">
              <h2>25. Changes to This Policy</h2>
              <p>We may update this Returns & Refund Policy from time to time. Any changes will be posted on this page with an updated “Last Updated” date. The policy in effect at the time of purchase applies.</p>
            </section>

            <div className="mt-20 pt-12 border-t border-slate-200 not-prose">
              <div className="bg-[#152238] rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
                <div>
                  <h3 className="font-serif text-2xl mb-2 text-white">Need a Return?</h3>
                  <p className="text-slate-300 text-sm">Our team is here to guide you through the process.</p>
                </div>
                <a href="mailto:social@urbanummati.store" className="px-8 py-3 bg-[#C9A883] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#b8976f] transition-all whitespace-nowrap shadow-lg hover:-translate-y-0.5">
                  Email Returns Team
                </a>
              </div>
            </div>
          </article>

        </div>
      </div>
    </main>
  );
}
