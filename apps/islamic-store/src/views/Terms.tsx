"use client";

import { useEffect, useState } from "react";
import { Scale, ShieldCheck, HelpCircle, Mail, Globe, Clock, CreditCard, Package, AlertTriangle, UserCheck, FileText, Gavel, ShieldAlert, Hammer, Sparkles, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "s1", title: "1. About Us" },
  { id: "s2", title: "2. Eligibility" },
  { id: "s3", title: "3. Product Information" },
  { id: "s4", title: "4. Islamic Artwork" },
  { id: "s5", title: "5. Orders & Acceptance" },
  { id: "s6", title: "6. Pricing & Taxes" },
  { id: "s7", title: "7. Payment" },
  { id: "s8", title: "8. Promo Codes" },
  { id: "s9", title: "9. Limited Releases" },
  { id: "s10", title: "10. Shipping & Delivery" },
  { id: "s11", title: "11. Address Accuracy" },
  { id: "s12", title: "12. Risk of Loss" },
  { id: "s13", title: "13. Damaged Items" },
  { id: "s14", title: "14. Returns & Exchanges" },
  { id: "s15", title: "15. Non-Returnable" },
  { id: "s16", title: "16. Refunds" },
  { id: "s17", title: "17. Cancellations" },
  { id: "s18", title: "18. Installation & Use" },
  { id: "s19", title: "19. Product Care" },
  { id: "s20", title: "20. Gift Cards" },
  { id: "s21", title: "21. Website Content" },
  { id: "s22", title: "22. Intellectual Property" },
  { id: "s23", title: "23. User Content" },
  { id: "s24", title: "24. Prohibited Uses" },
  { id: "s25", title: "25. Third-Party Services" },
  { id: "s26", title: "26. Marketing Comms" },
  { id: "s28", title: "28. Errors & Inaccuracies" },
  { id: "s30", title: "30. Limitation of Liability" },
  { id: "s31", title: "31. Indemnification" },
  { id: "s32", title: "32. Force Majeure" },
  { id: "s33", title: "33. Dispute Resolution" },
  { id: "s34", title: "34. Governing Law" },
  { id: "s36", title: "36. U.S. Customers" },
  { id: "s37", title: "37. Quebec Customers" },
  { id: "s39", title: "39. Contact Us" },
];

export function Terms() {
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
            <Scale size={14} />
            Legal Documentation
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-6 tracking-tight">
            Terms & Conditions
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
                Policy Navigation
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
              Welcome to Urban Ummati. These Terms & Conditions govern your access to and use of our website, products, services, checkout, communications, and any purchases made through <strong>urbanummati.store</strong>.
            </p>
            <p className="text-slate-600 mb-12">
              By visiting our website, placing an order, creating an account, subscribing to communications, or purchasing from Urban Ummati, you agree to these Terms & Conditions. If you do not agree, please do not use our website or purchase our products.
            </p>

            <section id="s1">
              <h2>1. About Urban Ummati</h2>
              <p>Urban Ummati sells Islamic-inspired wall art, home decor, and related products. Our products may include handcrafted, made-to-order, limited-release, or small-batch items.</p>
              <p>Throughout these Terms, “Urban Ummati,” “we,” “us,” and “our” refer to <strong>Zaynaab Inc</strong>, operating as Urban Ummati.</p>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm not-prose mb-8">
                <ul className="space-y-2 text-sm text-[#152238] font-medium">
                  <li><strong>Business Name:</strong> Zaynaab Inc</li>
                  <li><strong>Operating Name:</strong> Urban Ummati</li>
                  <li><strong>Address:</strong> 5063 N Service Rd #200, Burlington, ON L7L 5H6</li>
                  <li><strong>Email:</strong> <a href="mailto:social@urbanummati.store" className="text-[#C9A883] hover:text-[#152238]">social@urbanummati.store</a></li>
                </ul>
              </div>
            </section>

            <section id="s2">
              <h2>2. Eligibility to Use This Website</h2>
              <p>You must be at least the age of majority in your province, territory, state, or country of residence to use this website or make a purchase. By using our website, you confirm that you have the legal authority to enter into these Terms.</p>
              <p>If you purchase on behalf of another person or organization, you confirm that you have permission to do so.</p>
            </section>

            <section id="s3">
              <h2>3. Product Information</h2>
              <p>We aim to display our products as accurately as possible, including images, colours, dimensions, materials, descriptions, and finishes. However, product images may appear differently depending on your screen, lighting, device settings, photography, and natural material variations.</p>
              <p>Because some Urban Ummati products may be handcrafted, made in small batches, or made using natural materials, slight variations in finish, grain, texture, colour, edge detail, or appearance may occur. These variations are not considered defects.</p>
              <p>Dimensions listed on the website are approximate unless specifically stated otherwise.</p>
            </section>

            <section id="s4">
              <h2>4. Islamic Artwork and Meaning</h2>
              <p>Our products are created with respect for Islamic art, spirituality, and Muslim homes. However, customers are responsible for deciding whether a product is suitable for their personal, religious, cultural, or household preferences.</p>
              <p>Any descriptions, translations, names, or explanations on our website are provided for general informational and artistic context only. They should not be treated as religious rulings, scholarly advice, or formal Islamic guidance.</p>
            </section>

            <section id="s5">
              <h2>5. Orders and Acceptance</h2>
              <p>When you place an order, you are making an offer to purchase the selected product or products. We may accept or reject your order at our discretion.</p>
              <p>After checkout, you may receive an order confirmation email. This confirms that we have received your order, but it does not necessarily mean the order has been accepted, processed, shipped, or fulfilled.</p>
              <p>We reserve the right to refuse, cancel, or limit any order for reasons including:</p>
              <ul>
                <li>Product unavailability</li>
                <li>Pricing or listing errors</li>
                <li>Payment issues</li>
                <li>Suspected fraud or unauthorized activity</li>
                <li>Shipping restrictions</li>
                <li>Incorrect customer information</li>
                <li>Abuse of promotions or discounts</li>
                <li>Operational or production limitations</li>
              </ul>
              <p>If we cancel an order after payment has been taken, we will issue a refund for the cancelled item or order.</p>
            </section>

            <section id="s6">
              <h2>6. Pricing, Currency, Taxes, and Fees</h2>
              <p>Prices are listed in CAD, unless stated otherwise.</p>
              <ul>
                <li>For Canadian customers, applicable taxes may include GST, HST, PST, QST, or other taxes depending on your shipping location.</li>
                <li>For U.S. customers, applicable sales tax may be charged depending on state and local tax rules.</li>
                <li>Shipping fees, taxes, duties, and other charges will be displayed at checkout where applicable.</li>
              </ul>
              <p>We aim to avoid hidden mandatory fees and to provide clear pricing before you complete your purchase. Prices may change at any time without notice. Price changes do not affect orders that have already been accepted, unless there was a clear pricing error.</p>
            </section>

            <section id="s7">
              <h2>7. Payment</h2>
              <p>We accept the payment methods shown at checkout, which may include credit cards, debit cards, digital wallets, or other payment providers.</p>
              <p>By providing payment information, you confirm that:</p>
              <ul>
                <li>You are authorized to use the payment method</li>
                <li>The payment information is accurate</li>
                <li>You authorize us and our payment processors to charge the total order amount</li>
              </ul>
              <p>We do not store full credit card details on our website. Payments are processed by third-party payment providers. If your payment is declined, delayed, reversed, disputed, or flagged for fraud, we may cancel or pause your order.</p>
            </section>

            <section id="s8">
              <h2>8. Discount Codes and Promotions</h2>
              <p>Discount codes, promotional offers, free gifts, limited releases, bundles, or sale pricing may be subject to additional conditions.</p>
              <p>Unless stated otherwise:</p>
              <ul>
                <li>Promotions cannot be combined</li>
                <li>Promotions have no cash value</li>
                <li>Promotions may expire without notice</li>
                <li>Promotions may be limited by product, customer, location, or order value</li>
              </ul>
              <p>We may cancel orders where a promotion has been misused or applied in error. We reserve the right to modify, suspend, or cancel promotions at any time.</p>
            </section>

            <section id="s9">
              <h2>9. Limited Releases and Product Availability</h2>
              <p>Some Urban Ummati products may be sold as limited releases, handcrafted batches, pre-orders, or made-to-order items. Availability is not guaranteed until your order has been accepted and fulfilled.</p>
              <p>If a product becomes unavailable after you place an order, we may offer:</p>
              <ul>
                <li>A replacement product</li>
                <li>A delayed fulfilment option</li>
                <li>Store credit, where permitted</li>
                <li>A full or partial refund</li>
              </ul>
            </section>

            <section id="s10">
              <h2>10. Shipping and Delivery</h2>
              <p>We currently ship to <strong>Canada and USA only</strong>.</p>
              <p>Shipping timelines shown on our website are estimates only unless clearly stated as guaranteed. Production, packing, carrier delays, customs processing, weather, holidays, high-volume periods, or incorrect address details may affect delivery times.</p>
              <p>If no specific shipping timeframe is provided for a U.S. order, we will aim to ship within 30 days, or we will notify you of the delay and provide any required options under applicable law. Once an order is handed to the shipping carrier, delivery timing is partly outside our control.</p>
            </section>

            <section id="s11">
              <h2>11. Shipping Address Accuracy</h2>
              <p>Customers are responsible for providing a complete and accurate shipping address. We are not responsible for lost, delayed, returned, or misdelivered packages caused by:</p>
              <ul>
                <li>Incorrect address details</li>
                <li>Missing unit, suite, buzzer, or apartment numbers</li>
                <li>Failed delivery attempts</li>
                <li>Refusal of delivery</li>
                <li>Unclaimed packages</li>
                <li>Customer relocation</li>
                <li>Carrier access issues</li>
              </ul>
              <p>If an order is returned to us due to an incorrect or incomplete address, we may charge additional shipping fees to resend it.</p>
            </section>

            <section id="s12">
              <h2>12. Risk of Loss</h2>
              <p>Risk of loss or damage may pass to you when the product is delivered to the shipping address you provided, subject to any rights you may have under applicable consumer protection laws.</p>
              <p>If tracking shows that an order was delivered but you cannot locate it, please contact the carrier first and then contact us. We will reasonably assist where possible, but we are not responsible for theft, porch piracy, or loss after confirmed delivery.</p>
            </section>

            <section id="s13">
              <h2>13. Damaged Items</h2>
              <p>We take care in packaging our products. However, if your item arrives damaged, you must contact us at <a href="mailto:social@urbanummati.store" className="text-[#C9A883] hover:text-[#152238]"><strong>social@urbanummati.store</strong></a> within <strong>48 hours</strong> of delivery. Please include:</p>
              <ul>
                <li>Your order number</li>
                <li>Photos of the damaged product</li>
                <li>Photos of the outer shipping box</li>
                <li>Photos of the inner packaging</li>
                <li>A clear description of the issue</li>
              </ul>
              <p>We may offer a replacement, repair, refund, or other resolution depending on the circumstances. Please do not discard the product, packaging, or shipping box until we confirm the next steps. The carrier may require photos or inspection.</p>
            </section>

            <section id="s14">
              <h2>14. Returns and Exchanges</h2>
              <p>Our return policy is as follows:</p>
              <ul>
                <li><strong>Return Window:</strong> 14 or 30 days from delivery</li>
                <li><strong>Condition:</strong> Items must be unused, undamaged, in original condition, and returned with original packaging where possible.</li>
                <li><strong>Return Shipping:</strong> Customer responsible</li>
                <li><strong>Refund Method:</strong> Refunds are issued to the original payment method unless otherwise agreed.</li>
              </ul>
              <p>To start a return, contact us at <a href="mailto:social@urbanummati.store" className="text-[#C9A883] hover:text-[#152238]"><strong>social@urbanummati.store</strong></a> before sending anything back. Unauthorized returns may not be accepted. Original shipping fees are non-refundable unless required by law or unless the return is due to our error.</p>
            </section>

            <section id="s15">
              <h2>15. Non-Returnable Items</h2>
              <p>The following items are final sale and may not be eligible for return unless defective, damaged, or required by law:</p>
              <ul>
                <li>Custom products</li>
                <li>Personalized products</li>
                <li>Made-to-order products</li>
                <li>Limited-release items marked final sale</li>
                <li>Gift cards</li>
                <li>Clearance items</li>
                <li>Products damaged after delivery</li>
                <li>Products returned without original packaging where safe return shipping is not possible</li>
              </ul>
              <p>This does not limit any mandatory consumer rights you may have under applicable law.</p>
            </section>

            <section id="s16">
              <h2>16. Refunds</h2>
              <p>Once we receive and inspect an approved return, we will notify you whether the refund has been approved. If approved, the refund will be processed to the original payment method. Processing times may vary depending on your bank, card issuer, or payment provider.</p>
              <p>We may deduct amounts for:</p>
              <ul>
                <li>Missing parts</li>
                <li>Damage caused after delivery</li>
                <li>Excessive wear or misuse</li>
                <li>Return shipping fees, if applicable</li>
                <li>Restocking fees, if clearly disclosed and permitted by law</li>
              </ul>
            </section>

            <section id="s17">
              <h2>17. Cancellations and Order Changes</h2>
              <p>If you need to cancel or change an order, contact us as soon as possible at <a href="mailto:social@urbanummati.store" className="text-[#C9A883] hover:text-[#152238]"><strong>social@urbanummati.store</strong></a>. We cannot guarantee changes or cancellations once an order has entered production, packing, fulfilment, or shipping.</p>
              <p>For made-to-order, personalized, custom, or limited-release products, cancellations may not be possible once production has started.</p>
            </section>

            <section id="s18">
              <h2>18. Installation and Use</h2>
              <p>Customers are responsible for safely installing, mounting, handling, and displaying their purchased products. Unless expressly stated, our products do not include professional installation.</p>
              <p>You agree to follow any installation instructions provided. You are responsible for using suitable hardware, anchors, tools, and methods for your wall type and product weight. We are not responsible for damage, injury, loss, or defects caused by:</p>
              <ul>
                <li>Incorrect installation or Unsuitable wall surfaces</li>
                <li>Improper mounting hardware or Failure to follow instructions</li>
                <li>Modifications to the product or Misuse/neglect</li>
                <li>Exposure to moisture, heat, or direct sunlight unless rated for such use</li>
              </ul>
              <p>For heavy or oversized pieces, we recommend professional installation.</p>
            </section>

            <section id="s19">
              <h2>19. Product Care</h2>
              <p>Product care instructions may vary by item. Customers are responsible for following care guidance provided by Urban Ummati.</p>
              <p>Unless stated otherwise, products should be kept indoors, away from excessive humidity, water exposure, direct heat, harsh chemicals, and prolonged direct sunlight. Damage caused by improper care is not considered a manufacturing defect.</p>
            </section>

            <section id="s20">
              <h2>20. Gift Cards</h2>
              <p>If we offer gift cards, they are subject to any additional terms displayed at purchase. Gift cards are not redeemable for cash unless required by law. Lost or stolen gift cards may not be replaced.</p>
            </section>

            <section id="s21">
              <h2>21. Website Content</h2>
              <p>All website content, including product images, videos, designs, text, logos, graphics, icons, branding, layout, photography, and product names, belongs to Urban Ummati or its licensors and is protected by intellectual property laws.</p>
              <p>You may not copy, reproduce, distribute, modify, sell, exploit, scrape, or use our content without written permission.</p>
            </section>

            <section id="s22">
              <h2>22. Intellectual Property and Designs</h2>
              <p>All Urban Ummati product designs, artwork, concepts, patterns, layouts, files, product photography, branding, packaging, and related creative assets are owned by Urban Ummati or used under licence.</p>
              <p>Purchasing a product does not give you ownership of the design, artwork file, copyright, trademark, or any reproduction rights. You may not reproduce, copy, trace, resell, manufacture, distribute, or commercially exploit our designs or products without our written permission.</p>
            </section>

            <section id="s23">
              <h2>23. User Content, Reviews, and Social Media</h2>
              <p>If you submit reviews, photos, videos, testimonials, social media tags, comments, or other content, you grant us a non-exclusive, worldwide, royalty-free right to use, share, display, reproduce, edit, and repost that content for marketing, website, advertising, and social media purposes.</p>
              <p>You confirm that any content you submit is accurate, lawful, and does not violate anyone else’s rights. We may remove or refuse to display user content at our discretion.</p>
            </section>

            <section id="s24">
              <h2>24. Prohibited Uses</h2>
              <p>You agree not to use our website or services to:</p>
              <ul>
                <li>Violate any law or regulation</li>
                <li>Infringe intellectual property rights</li>
                <li>Submit false, misleading, or fraudulent information</li>
                <li>Interfere with website security or functionality</li>
                <li>Attempt unauthorized access to systems or accounts</li>
                <li>Upload malicious code, viruses, or harmful files</li>
                <li>Scrape, copy, or harvest website data without permission</li>
                <li>Abuse promotions, refunds, chargebacks, or customer service processes</li>
                <li>Harass, threaten, or abuse our team or other customers</li>
              </ul>
              <p>We may suspend or block access to our website if we believe these Terms have been violated.</p>
            </section>

            <section id="s25">
              <h2>25. Third-Party Services</h2>
              <p>Our website may use third-party services, including payment processors, shipping carriers, email/SMS providers, analytics tools, marketing platforms, review tools, and website hosting providers. We are not responsible for the actions, errors, downtime, policies, or security practices of third-party providers. Your use of third-party services may be subject to their own terms and privacy policies.</p>
            </section>

            <section id="s26">
              <h2>26. Email, SMS, and Marketing Communications</h2>
              <p>If you sign up for our email list, SMS list, giveaway, discount offer, or account notifications, you agree to receive communications from Urban Ummati. Marketing communications may include product launches, offers, abandoned cart reminders, order updates, and brand news.</p>
              <p>You can unsubscribe from marketing emails by using the link in our emails. SMS messages may be stopped by replying “STOP”. Transactional messages related to your order may still be sent even if you unsubscribe from marketing.</p>
            </section>

            <section id="s27">
              <h3 className="text-xl font-serif text-[#152238] mt-8 mb-4">27. Privacy</h3>
              <p>Your use of our website is also governed by our Privacy Policy, which explains how we collect, use, disclose, and protect personal information.</p>
            </section>

            <section id="s28">
              <h2>28. Errors and Inaccuracies</h2>
              <p>We try to ensure that all website information is accurate, but errors may occur. These may include errors in pricing, product descriptions, images, availability, shipping information, promotions, or technical details.</p>
              <p>We reserve the right to correct errors, update information, cancel orders, or refuse orders affected by such errors, even after an order has been placed. If your order is cancelled due to an error and payment has been taken, we will issue a refund.</p>
            </section>

            <section id="s29">
              <h3 className="text-xl font-serif text-[#152238] mt-8 mb-4">29. No Warranty Beyond What Is Stated</h3>
              <p>Our products are provided as described on our website and subject to applicable consumer protection laws. To the maximum extent permitted by law, we disclaim warranties that are not expressly stated, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>
            </section>

            <section id="s30">
              <h2>30. Limitation of Liability</h2>
              <p>To the maximum extent permitted by law, Urban Ummati is not liable for indirect, incidental, special, consequential, punitive, or exemplary damages, including loss of profits, loss of business, loss of data, emotional distress, property damage caused by improper installation, or other losses arising from your use of our website or products.</p>
              <p>Our total liability for any claim related to a product or order will not exceed the amount you paid for that product or order, unless applicable law requires otherwise.</p>
            </section>

            <section id="s31">
              <h2>31. Indemnification</h2>
              <p>You agree to indemnify and hold harmless Urban Ummati, its owners, directors, employees, contractors, suppliers, partners, and affiliates from any claims, losses, damages, liabilities, costs, or expenses arising from:</p>
              <ul>
                <li>Your breach of these Terms</li>
                <li>Your misuse of our website or products</li>
                <li>Your violation of any law or third-party rights</li>
                <li>Your improper installation, handling, modification, or resale of our products</li>
              </ul>
            </section>

            <section id="s32">
              <h2>32. Force Majeure</h2>
              <p>Urban Ummati is not responsible for delays or failures caused by events outside our reasonable control, including natural disasters, severe weather, labour disruptions, supply shortages, customs delays, carrier delays, pandemics, power outages, cyberattacks, government action, war, civil unrest, or manufacturing disruptions.</p>
            </section>

            <section id="s33">
              <h2>33. Dispute Resolution</h2>
              <p>Before starting any formal legal claim, you agree to contact us first at <a href="mailto:social@urbanummati.store" className="text-[#C9A883] hover:text-[#152238]"><strong>social@urbanummati.store</strong></a> so we can try to resolve the issue informally. Most issues can be resolved quickly through customer support.</p>
            </section>

            <section id="s34">
              <h2>34. Governing Law</h2>
              <p>These Terms are governed by the laws of the Province of Ontario, Canada, and the federal laws of Canada applicable in Ontario, without regard to conflict of law principles.</p>
              <p>If you are a consumer outside Ontario, you may also have rights under the consumer protection laws of your province, territory, state, or country of residence that cannot be waived by these Terms.</p>
            </section>

            <section id="s35">
              <h3 className="text-xl font-serif text-[#152238] mt-8 mb-4">35. Severability</h3>
              <p>If any part of these Terms is found to be unenforceable, the remaining provisions will continue to be in full force and effect.</p>
            </section>

            <section id="s36">
              <h2>36. U.S. Customers</h2>
              <p>For customers in the United States, certain federal or state laws may apply to your purchase, shipping, taxes, privacy rights, returns, marketing communications, and consumer protection rights. Nothing in these Terms is intended to limit rights that cannot legally be waived under applicable U.S. law.</p>
            </section>

            <section id="s37">
              <h2>37. Quebec Customers</h2>
              <p>If we sell to customers in Quebec, French-language requirements may apply to consumer-facing materials, product information, commercial advertising, and customer communications. Quebec’s Bill 96 amended the Charter of the French Language and reinforces French as the language of commerce and business in Quebec.</p>
            </section>

            <section id="s38">
              <h3 className="text-xl font-serif text-[#152238] mt-8 mb-4">38. Changes to These Terms</h3>
              <p>We may update these Terms from time to time. The updated version will be posted on this page with a new “Last Updated” date. Your continued use of our website after changes are posted means you accept the updated Terms.</p>
            </section>

            <section id="s39">
              <h2>39. Contact Us</h2>
              <p>For questions about these Terms, your order, returns, shipping, or product issues, contact us at:</p>
              <div className="bg-[#152238] rounded-3xl p-8 text-white mt-8 shadow-xl not-prose">
                <ul className="space-y-2 text-sm">
                  <li><strong>Urban Ummati</strong></li>
                  <li><strong>Email:</strong> <a href="mailto:social@urbanummati.store" className="text-[#C9A883] hover:text-[#152238]">social@urbanummati.store</a></li>
                  <li><strong>Address:</strong> 5063 N Service Rd #200, Burlington, ON L7L 5H6</li>
                </ul>
              </div>
            </section>
          </article>

        </div>
      </div>
    </main>
  );
}
