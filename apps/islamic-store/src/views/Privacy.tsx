"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, HelpCircle, Mail, Eye, Lock, Globe, UserCheck, Scale, MousePointer2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "s1", title: "1. Who We Are" },
  { id: "s2", title: "2. Info We Collect" },
  { id: "s3", title: "3. Payment Information" },
  { id: "s4", title: "4. Auto Collection" },
  { id: "s5", title: "5. Cookies & Tracking" },
  { id: "s6", title: "6. How We Use Info" },
  { id: "s7", title: "7. Email & SMS" },
  { id: "s8", title: "8. Abandoned Cart" },
  { id: "s9", title: "9. How We Share" },
  { id: "s10", title: "10. Retargeting" },
  { id: "s11", title: "11. Sell Data?" },
  { id: "s12", title: "12. Intl Transfers" },
  { id: "s13", title: "13. Data Retention" },
  { id: "s14", title: "14. How We Protect" },
  { id: "s15", title: "15. Privacy Choices" },
  { id: "s16", title: "16. Canadian Rights" },
  { id: "s17", title: "17. U.S. State Rights" },
  { id: "s18", title: "18. Children's Privacy" },
  { id: "s19", title: "19. Reviews & Social" },
  { id: "s20", title: "20. Giveaways" },
  { id: "s21", title: "21. Third-Party Links" },
  { id: "s22", title: "22. Accessibility" },
  { id: "s23", title: "23. Changes to Policy" },
  { id: "s24", title: "24. Contact Us" },
];

export function Privacy() {
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
            <ShieldCheck size={14} />
            Data Privacy & Security
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-6 tracking-tight">
            Privacy Policy
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
              At Urban Ummati, we respect your privacy. This Privacy Policy explains how we collect, use, disclose, store, and protect personal information when you visit our website, make a purchase, contact us, subscribe to our communications, interact with our ads, or use our services.
            </p>
            <p className="text-slate-600 mb-12">
              This Privacy Policy applies to <strong>urbanummati.store</strong> and any related Urban Ummati online services. By using our website or providing personal information to us, you agree to the practices described in this Privacy Policy.
            </p>

            <section id="s1">
              <h2>1. Who We Are</h2>
              <p>Urban Ummati sells Islamic-inspired wall art, home decor, and related products.</p>
              <p>In this Privacy Policy, “Urban Ummati,” “we,” “us,” and “our” refer to:</p>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm not-prose mb-8">
                <ul className="space-y-2 text-sm text-[#152238] font-medium">
                  <li><strong>Business Name:</strong> Zaynaab Inc</li>
                  <li><strong>Operating Name:</strong> Urban Ummati</li>
                  <li><strong>Address:</strong> 5063 N Service Rd #200, Burlington, ON L7L 5H6</li>
                  <li><strong>Email:</strong> <a href="mailto:social@urbanummati.store" className="text-[#C9A883] hover:text-[#152238]">social@urbanummati.store</a></li>
                </ul>
              </div>
              <p>For privacy questions, requests, or complaints, contact us at:</p>
              <p><strong>Privacy Contact:</strong> Syed Shah - Operations Director | <strong>Email:</strong> <a href="mailto:social@urbanummati.store" className="text-[#C9A883] hover:text-[#152238]">social@urbanummati.store</a></p>
            </section>

            <section id="s2">
              <h2>2. Personal Information We Collect</h2>
              <p>We may collect personal information directly from you, automatically through our website, or from third-party service providers.</p>
              <h3>Information You Provide to Us</h3>
              <p>We may collect:</p>
              <ul>
                <li>Name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Billing address</li>
                <li>Shipping address</li>
                <li>Payment-related information</li>
                <li>Order details</li>
                <li>Account login details, if accounts are available</li>
                <li>Product preferences</li>
                <li>Messages you send to us</li>
                <li>Reviews, photos, videos, or testimonials you submit</li>
                <li>Giveaway, contest, or promotional entry details</li>
                <li>Marketing consent preferences</li>
                <li>Customer service communications</li>
              </ul>
              <p>We do not intentionally collect sensitive personal information unless you choose to provide it.</p>
            </section>

            <section id="s3">
              <h2>3. Payment Information</h2>
              <p>When you place an order, payment information is processed by third-party payment providers such as Stripe and PayPal</p>
              <p>We do not store your full credit card number on our own systems. Payment providers may collect, process, and store payment details according to their own privacy policies and security standards.</p>
              <p>We may receive limited payment-related information, such as transaction status, billing name, billing address, last four digits of a payment card, fraud screening results, or confirmation that payment was completed.</p>
            </section>

            <section id="s4">
              <h2>4. Information Collected Automatically</h2>
              <p>When you visit our website, we or our service providers may automatically collect information such as:</p>
              <ul>
                <li>IP address</li>
                <li>Browser type</li>
                <li>Device type</li>
                <li>Operating system</li>
                <li>Pages viewed</li>
                <li>Links clicked</li>
                <li>Time spent on pages</li>
                <li>Referring website</li>
                <li>Approximate location based on IP address</li>
                <li>Shopping cart activity</li>
                <li>Checkout activity</li>
                <li>Email engagement, such as opens and clicks</li>
                <li>Ad interaction data</li>
                <li>Cookie and tracking identifiers</li>
              </ul>
              <p>This information helps us operate the website, understand customer behaviour, improve our store, measure advertising performance, prevent fraud, and personalize marketing.</p>
            </section>

            <section id="s5">
              <h2>5. Cookies and Tracking Technologies</h2>
              <p>We may use cookies, pixels, tags, scripts, local storage, and similar technologies.</p>
              <p>These technologies may be used to:</p>
              <ul>
                <li>Keep the website functioning properly</li>
                <li>Remember cart contents</li>
                <li>Remember preferences</li>
                <li>Enable checkout</li>
                <li>Improve site performance</li>
                <li>Understand website traffic</li>
                <li>Measure marketing campaigns</li>
                <li>Personalize ads</li>
                <li>Retarget visitors with relevant advertising</li>
                <li>Support abandoned cart reminders</li>
                <li>Detect fraud or abuse</li>
              </ul>
              <p>Examples of tools we may use include:</p>
              <ul>
                <li>Google Analytics</li>
                <li>Google Ads</li>
                <li>Meta Pixel</li>
                <li>TikTok Pixel</li>
                <li>Klaviyo</li>
                <li>Email/SMS marketing tools</li>
                <li>Payment processors</li>
                <li>Shipping and fulfilment tools</li>
                <li>Review platforms</li>
                <li>Website hosting tools</li>
              </ul>
              <p>Your browser may allow you to block or delete cookies. However, blocking some cookies may affect website functionality, checkout, cart tracking, or your shopping experience.</p>
            </section>

            <section id="s6">
              <h2>6. How We Use Personal Information</h2>
              <p>We may use personal information to:</p>
              <ul>
                <li>Process and fulfil orders</li>
                <li>Accept payments</li>
                <li>Ship products</li>
                <li>Send order confirmations</li>
                <li>Provide tracking updates</li>
                <li>Respond to customer service requests</li>
                <li>Handle returns, refunds, claims, and damaged item reports</li>
                <li>Prevent fraud and unauthorized transactions</li>
                <li>Improve our website, products, and customer experience</li>
                <li>Personalize content, product recommendations, and advertising</li>
                <li>Run promotions, giveaways, or limited releases</li>
                <li>Send marketing emails or SMS messages where permitted</li>
                <li>Recover abandoned carts</li>
                <li>Request reviews or feedback</li>
                <li>Maintain business records</li>
                <li>Comply with legal, tax, accounting, and regulatory obligations</li>
                <li>Enforce our Terms & Conditions</li>
                <li>Protect our rights, customers, website, and business</li>
              </ul>
              <p>We collect and use personal information only for reasonable business purposes and as permitted by applicable law.</p>
            </section>

            <section id="s7">
              <h2>7. Email and SMS Marketing</h2>
              <p>If you subscribe to our email list, SMS list, giveaway, discount offer, product launch list, or other promotional communication, we may send you marketing messages.</p>
              <p>These may include:</p>
              <ul>
                <li>New product launches</li>
                <li>Limited releases</li>
                <li>Discounts and promotions</li>
                <li>Abandoned cart reminders</li>
                <li>Back-in-stock alerts</li>
                <li>Brand updates</li>
                <li>Content related to Islamic home decor and Urban Ummati products</li>
              </ul>
              <p>For Canadian customers, commercial electronic messages are subject to CASL, which generally requires consent, sender identification, and an unsubscribe mechanism.</p>
              <p>You can unsubscribe from marketing emails by clicking the unsubscribe link in the email. You can opt out of SMS marketing by following the instructions in the SMS message, such as replying “STOP,” where applicable.</p>
              <p>Even if you unsubscribe from marketing, we may still send transactional messages related to your orders, shipping, customer service, returns, refunds, or account activity.</p>
            </section>

            <section id="s8">
              <h2>8. Abandoned Cart Communications</h2>
              <p>If you begin checkout, add items to your cart, or provide your email or phone number, we may use that information to send abandoned cart reminders, subject to applicable law and your consent preferences.</p>
              <p>These reminders may be sent by email, SMS, or other communication channels through tools such as Klaviyo or similar providers.</p>
            </section>

            <section id="s9">
              <h2>9. How We Share Personal Information</h2>
              <p>We may share personal information with trusted third parties that help us operate our business, including:</p>
              <ul>
                <li>Website hosting providers</li>
                <li>Payment processors</li>
                <li>Fraud prevention tools</li>
                <li>Shipping carriers</li>
                <li>Fulfilment partners</li>
                <li>Email marketing providers</li>
                <li>SMS marketing providers</li>
                <li>Analytics providers</li>
                <li>Advertising platforms</li>
                <li>Customer support tools</li>
                <li>Review platforms</li>
                <li>Accounting, tax, and bookkeeping providers</li>
                <li>Legal, compliance, and professional advisors</li>
                <li>IT and security providers</li>
              </ul>
              <p>We share only the information reasonably necessary for these providers to perform services for us.</p>
              <p>We may also disclose personal information if required to:</p>
              <ul>
                <li>Comply with law</li>
                <li>Respond to lawful requests</li>
                <li>Protect our legal rights</li>
                <li>Prevent fraud or abuse</li>
                <li>Enforce our Terms & Conditions</li>
                <li>Protect customers, our business, or the public</li>
                <li>Complete a business transaction such as a merger, acquisition, restructuring, or sale of assets</li>
              </ul>
            </section>

            <section id="s10">
              <h2>10. Advertising and Retargeting</h2>
              <p>We may work with advertising platforms such as Google, Meta, TikTok, Pinterest, or others to show relevant ads and measure campaign performance.</p>
              <p>These platforms may use cookies, pixels, device identifiers, hashed customer information, or browsing activity to help us:</p>
              <ul>
                <li>Measure ad performance</li>
                <li>Build audiences</li>
                <li>Retarget website visitors</li>
                <li>Find similar customers</li>
                <li>Understand conversions</li>
                <li>Improve marketing efficiency</li>
              </ul>
              <p>Depending on your location, some privacy laws may treat certain types of targeted advertising, retargeting, or data sharing as a “sale,” “sharing,” or targeted advertising activity. Where required, we will provide opt-out choices.</p>
            </section>

            <section id="s11">
              <h2>11. Do We Sell Personal Information?</h2>
              <p>We do not sell personal information for money.</p>
              <p>However, some U.S. privacy laws define “sale” or “sharing” broadly and may include certain advertising, retargeting, analytics, or pixel-based activities.</p>
              <p>If applicable law gives you the right to opt out of the sale or sharing of personal information, you may contact us at <a href="mailto:social@urbanummati.store" className="text-[#C9A883] hover:text-[#152238]"><strong>social@urbanummati.store</strong></a> or use any available “Do Not Sell or Share My Personal Information” link on our website.</p>
            </section>

            <section id="s12">
              <h2>12. International Transfers</h2>
              <p>Urban Ummati is based in Canada, but our service providers may process or store personal information in Canada, the United States, or other countries.</p>
              <p>When personal information is processed outside your province, state, or country, it may be subject to the laws of that location, including lawful access by courts, law enforcement, or government authorities.</p>
              <p>By using our website or providing personal information, you understand that your information may be transferred to service providers outside your location.</p>
            </section>

            <section id="s13">
              <h2>13. Data Retention</h2>
              <p>We keep personal information only as long as reasonably necessary for the purposes described in this Privacy Policy, including:</p>
              <ul>
                <li>Completing transactions</li>
                <li>Providing customer support</li>
                <li>Maintaining order history</li>
                <li>Handling returns, refunds, warranty issues, or disputes</li>
                <li>Meeting tax, accounting, and legal obligations</li>
                <li>Preventing fraud</li>
                <li>Maintaining marketing preferences</li>
                <li>Enforcing our agreements</li>
              </ul>
              <p>When personal information is no longer needed, we will delete, anonymize, or securely retain it as required by law or business necessity.</p>
            </section>

            <section id="s14">
              <h2>14. How We Protect Personal Information</h2>
              <p>We use reasonable physical, technical, and organizational safeguards to protect personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.</p>
              <p>These safeguards may include:</p>
              <ul>
                <li>Secure checkout through third-party payment processors</li>
                <li>SSL/HTTPS encryption</li>
                <li>Limited access to customer information</li>
                <li>Password-protected systems</li>
                <li>Fraud detection tools</li>
                <li>Internal access controls</li>
                <li>Vendor security practices</li>
              </ul>
              <p>No website, payment system, email platform, or online service can guarantee complete security. You are responsible for keeping your account login details safe if customer accounts are available.</p>
            </section>

            <section id="s15">
              <h2>15. Your Privacy Choices</h2>
              <p>Depending on your location, you may have the right to:</p>
              <ul>
                <li>Access personal information we hold about you</li>
                <li>Correct inaccurate personal information</li>
                <li>Withdraw consent, where applicable</li>
                <li>Request deletion of personal information, subject to legal exceptions</li>
                <li>Opt out of marketing emails</li>
                <li>Opt out of SMS marketing</li>
                <li>Request information about how your data is used or shared</li>
                <li>Opt out of certain targeted advertising or data sharing, where required by law</li>
                <li>File a privacy complaint</li>
              </ul>
              <p>To make a request, contact us at <a href="mailto:social@urbanummati.store" className="text-[#C9A883] hover:text-[#152238]"><strong>social@urbanummati.store</strong></a>. We may need to verify your identity before responding to certain requests.</p>
            </section>

            <section id="s16">
              <h2>16. Canadian Privacy Rights</h2>
              <p>If you are in Canada, you may request access to personal information we hold about you and ask us to correct inaccurate information, subject to legal exceptions. You may also withdraw your consent to certain uses of personal information, although this may affect our ability to provide products, services, order updates, marketing communications, or customer support.</p>
              <p>PIPEDA requires organizations to be accountable for personal information and to identify purposes, obtain meaningful consent, limit collection, limit use/disclosure/retention, use safeguards, provide openness, allow access, and provide a way to challenge compliance.</p>
            </section>

            <section id="s17">
              <h2>17. U.S. State Privacy Rights</h2>
              <p>Depending on where you live, you may have privacy rights under U.S. state privacy laws, including rights to:</p>
              <ul>
                <li>Know what personal information is collected</li>
                <li>Access personal information</li>
                <li>Correct personal information</li>
                <li>Delete personal information</li>
                <li>Opt out of targeted advertising</li>
                <li>Opt out of sale or sharing of personal information</li>
                <li>Limit certain uses of sensitive personal information, if applicable</li>
                <li>Appeal a denied privacy request, where required</li>
              </ul>
              <p>California residents may have rights under the CCPA/CPRA if Urban Ummati meets the applicable legal thresholds. These rights can include:</p>
              <ul>
                <li>knowing what personal information is collected</li>
                <li>deleting personal information</li>
                <li>correcting inaccurate information</li>
                <li>opting out of sale or sharing</li>
                <li>limiting certain uses of sensitive personal information</li>
              </ul>
              <p>To exercise privacy rights, contact us at <a href="mailto:social@urbanummati.store" className="text-[#C9A883] hover:text-[#152238]"><strong>social@urbanummati.store</strong></a>.</p>
            </section>

            <section id="s18">
              <h2>18. Children’s Privacy</h2>
              <p>Our website and products are not directed to children under the age of 13 in the United States or under the applicable age of consent in Canada. We do not knowingly collect personal information from children without appropriate consent. If you believe a child has provided personal information to us, contact us at <a href="mailto:social@urbanummati.store" className="text-[#C9A883] hover:text-[#152238]">social@urbanummati.store</a>, and we will take reasonable steps to delete it.</p>
            </section>

            <section id="s19">
              <h2>19. Customer Reviews, Photos, and Social Media</h2>
              <p>If you submit a review, testimonial, photo, video, tag, comment, or other content related to Urban Ummati, we may use that content for marketing, website, social media, advertising, and promotional purposes, subject to our Terms & Conditions and applicable law. Please do not submit content that includes personal information about someone else unless you have their permission.</p>
            </section>

            <section id="s20">
              <h2>20. Giveaways, Contests, and Free Gifts</h2>
              <p>If you enter a giveaway, contest, free gift promotion, or lead capture offer, we may collect information such as your name, email address, phone number, shipping address, social media handle, and entry details. We may use this information to:</p>
              <ul>
                <li>Administer the promotion</li>
                <li>Contact winners</li>
                <li>Deliver prizes or gifts</li>
                <li>Prevent fraud or duplicate entries</li>
                <li>Send marketing communications, where permitted</li>
                <li>Comply with legal requirements</li>
              </ul>
              <p>Promotions may have separate rules, which will apply in addition to this Privacy Policy.</p>
            </section>

            <section id="s21">
              <h2>21. Third-Party Links</h2>
              <p>Our website may contain links to third-party websites, social media platforms, payment providers, delivery tracking pages, or other external services. We are not responsible for the privacy practices, content, or security of third-party websites. You should review their privacy policies before providing personal information.</p>
            </section>

            <section id="s22">
              <h2>22. Accessibility</h2>
              <p>We aim to make our privacy information clear and accessible. If you need this Privacy Policy in an alternative format, contact us at <a href="mailto:social@urbanummati.store" className="text-[#C9A883] hover:text-[#152238]"><strong>social@urbanummati.store</strong></a>.</p>
            </section>

            <section id="s23">
              <h2>23. Changes to This Privacy Policy</h2>
              <p>We may update this Privacy Policy from time to time. When we make changes, we will update the “Last Updated” date at the top of this page. If changes are significant, we may provide additional notice, such as through the website or by email. Your continued use of our website after changes are posted means you accept the updated Privacy Policy.</p>
            </section>

            <section id="s24">
              <h2>24. Contact Us</h2>
              <p>For privacy questions, access requests, correction requests, deletion requests, marketing opt-outs, or complaints, contact:</p>
              <div className="bg-[#152238] rounded-3xl p-8 text-white mt-8 shadow-xl not-prose">
                <ul className="space-y-2 text-sm">
                  <li><strong>Urban Ummati</strong></li>
                  <li><strong>Privacy Contact:</strong> Syed Shah - Operations Director</li>
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
