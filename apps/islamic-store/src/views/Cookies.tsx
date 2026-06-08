"use client";

import { useEffect, useState } from "react";
import { Scale, ShieldCheck, HelpCircle, Mail, Cookie, Activity, Settings, Target, Globe, MousePointer2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "s1", title: "1. Who We Are" },
  { id: "s2", title: "2. What Are Cookies?" },
  { id: "s3", title: "3. Similar Tech" },
  { id: "s4", title: "4. Types We Use" },
  { id: "s5", title: "5. Essential Cookies" },
  { id: "s6", title: "6. Performance & Analytics" },
  { id: "s7", title: "7. Functional Cookies" },
  { id: "s8", title: "8. Advertising & Retargeting" },
  { id: "s9", title: "9. Email & SMS Tracking" },
  { id: "s10", title: "10. Third-Party Cookies" },
];

export function Cookies() {
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
            <Cookie size={14} />
            Digital Experience & Transparency
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-6 tracking-tight">
            Cookie Policy
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
                      "text-left px-6 py-2.5 text-[10px] font-medium transition-all border-l-2 -ml-[1px] relative group",
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
              This Cookie Policy explains how Urban Ummati uses cookies, pixels, tags, scripts, local storage, and similar tracking technologies when you visit or interact with our website.
            </p>
            <p className="text-slate-600 mb-12">
              This Cookie Policy should be read together with our Privacy Policy and Terms & Conditions. By using our website, you agree that we may use cookies and similar technologies as described in this policy, subject to your cookie choices and applicable law.
            </p>

            <section id="s1">
              <h2>1. Who We Are</h2>
              <p>Urban Ummati sells Islamic-inspired wall art, home decor, and related products. In this Cookie Policy, “Urban Ummati,” “we,” “us,” and “our” refer to:</p>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm not-prose mb-8">
                <ul className="space-y-2 text-sm text-[#152238] font-medium">
                  <li><strong>Legal Business Name:</strong> Zaynaab Inc</li>
                  <li><strong>Operating Name:</strong> Urban Ummati</li>
                  <li><strong>Website:</strong> urbanummati.store</li>
                  <li><strong>Email:</strong> <a href="mailto:social@urbanummati.store" className="text-[#C9A883] hover:text-[#152238]">social@urbanummati.store</a></li>
                  <li><strong>Address:</strong> 5063 N Service Rd #200, Burlington, ON L7L 5H6</li>
                </ul>
              </div>
            </section>

            <section id="s2">
              <h2>2. What Are Cookies?</h2>
              <p>Cookies are small text files placed on your browser, computer, phone, or other device when you visit a website. Cookies can help websites:</p>
              <ul>
                <li>Remember your preferences</li>
                <li>Keep items in your cart</li>
                <li>Support checkout</li>
                <li>Keep the website secure</li>
                <li>Understand how visitors use the website</li>
                <li>Measure advertising performance</li>
                <li>Show relevant ads</li>
                <li>Support email, SMS, and abandoned-cart flows</li>
              </ul>
              <p>Cookies may be placed directly by Urban Ummati or by third-party providers we use.</p>
            </section>

            <section id="s3">
              <h2>3. Similar Tracking Technologies</h2>
              <p>In addition to cookies, we may use similar technologies such as:</p>
              <ul>
                <li>Pixels</li>
                <li>Tags</li>
                <li>Scripts</li>
                <li>Tracking links</li>
                <li>Local storage</li>
                <li>Session storage</li>
                <li>Device identifiers</li>
                <li>Hashed customer identifiers</li>
                <li>Conversion tracking tools</li>
              </ul>
              <p>These technologies may help us understand website behaviour, improve our marketing, measure conversions, and provide a better shopping experience.</p>
            </section>

            <section id="s4">
              <h2>4. Types of Cookies We Use</h2>
              <p>We may use the following categories of cookies and tracking technologies.</p>
            </section>

            <section id="s5">
              <h2>5. Essential Cookies</h2>
              <p>Essential cookies are required for the website to work properly. These may be used to:</p>
              <ul>
                <li>Enable shopping cart functionality</li>
                <li>Support checkout</li>
                <li>Process payments</li>
                <li>Remember privacy choices</li>
                <li>Keep the website secure</li>
                <li>Prevent fraud</li>
                <li>Load pages properly</li>
                <li>Manage customer accounts, if available</li>
              </ul>
              <p>You cannot usually disable essential cookies through our cookie settings because the website may not function properly without them. You may block cookies through your browser settings, but this may affect checkout, cart functionality, and website performance.</p>
            </section>

            <section id="s6">
              <h2>6. Performance and Analytics Cookies</h2>
              <p>Performance and analytics cookies help us understand how visitors use our website. These may tell us:</p>
              <ul>
                <li>Which pages are visited</li>
                <li>How long visitors stay on the website</li>
                <li>Which products are viewed</li>
                <li>Where visitors came from</li>
                <li>Whether visitors experience errors</li>
                <li>How customers move through the shopping journey</li>
                <li>Which campaigns drive traffic or sales</li>
              </ul>
              <p>We may use analytics tools such as:</p>
              <ul>
                <li>Google Analytics</li>
                <li>Website analytics tools</li>
                <li>Platform analytics</li>
                <li>Conversion tracking tools</li>
              </ul>
              <p>This helps us improve our website, product pages, customer experience, and marketing.</p>
            </section>

            <section id="s7">
              <h2>7. Functional Cookies</h2>
              <p>Functional cookies help us remember choices you make and improve your experience. These may include:</p>
              <ul>
                <li>Region or currency preferences</li>
                <li>Recently viewed products</li>
                <li>Saved cart details</li>
                <li>Form information</li>
                <li>Language preferences, where available</li>
                <li>Customer support chat settings</li>
                <li>Product display preferences</li>
              </ul>
              <p>If functional cookies are disabled, some features may not work as smoothly.</p>
            </section>

            <section id="s8">
              <h2>8. Advertising and Retargeting Cookies</h2>
              <p>Advertising and retargeting cookies help us show relevant Urban Ummati ads and measure the effectiveness of our campaigns. These may be used to:</p>
              <ul>
                <li>Show ads to people who visited our website</li>
                <li>Remind visitors about products they viewed</li>
                <li>Measure purchases from ads</li>
                <li>Build advertising audiences</li>
                <li>Create lookalike or similar audiences</li>
                <li>Limit repeated ads</li>
                <li>Understand campaign performance</li>
                <li>Improve future advertising</li>
              </ul>
              <p>We may use tools such as:</p>
              <ul>
                <li>Meta Pixel</li>
                <li>Google Ads</li>
                <li>Google Tag Manager</li>
                <li>TikTok Pixel</li>
                <li>Pinterest Tag</li>
                <li>Klaviyo tracking</li>
                <li>Other advertising or retargeting tools</li>
              </ul>
              <p>Depending on your location, some privacy laws may treat certain advertising cookies, retargeting, or sharing with advertising platforms as “targeted advertising,” “sharing,” or a “sale” of personal information. Where required, we will provide opt-out choices.</p>
            </section>

            <section id="s9">
              <h2>9. Email, SMS, and Abandoned Cart Tracking</h2>
              <p>If you provide your email address or phone number, we may use cookies, pixels, or tracking links to support:</p>
              <ul>
                <li>Email marketing</li>
                <li>SMS marketing</li>
                <li>Abandoned cart reminders</li>
                <li>Product launch alerts</li>
                <li>Discount offers</li>
                <li>Back-in-stock alerts</li>
                <li>Customer segmentation</li>
                <li>Email open and click tracking</li>
                <li>Purchase attribution</li>
              </ul>
              <p>For example, if you add a product to your cart or begin checkout, we may send an abandoned cart reminder where permitted by law and your consent preferences. You can unsubscribe from marketing emails using the unsubscribe link in our emails. You can opt out of SMS marketing by following the instructions in the message, such as replying “STOP,” where applicable.</p>
            </section>

            <section id="s10">
              <h2>10. Third-Party Cookies</h2>
              <p>Some cookies and tracking technologies may be placed by third-party providers that help us operate our business. These may include:</p>
              <ul>
                <li>Payment processors</li>
                <li>Shipping providers</li>
                <li>Website hosting providers</li>
                <li>Analytics providers</li>
                <li>Advertising platforms</li>
                <li>Email and SMS platforms</li>
                <li>Fraud prevention providers</li>
                <li>Customer support tools</li>
                <li>Review platforms</li>
                <li>Social media platforms</li>
              </ul>
              <p>These third parties may collect information about your device, browser, website activity, purchases, or interactions with our ads and emails. Their use of information is governed by their own privacy and cookie policies.</p>
            </section>

            <div className="mt-20 pt-12 border-t border-slate-200 not-prose">
              <div className="bg-[#152238] rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
                <div>
                  <h3 className="font-serif text-2xl mb-2 text-white">Digital Privacy Questions?</h3>
                  <p className="text-slate-300 text-sm">Our team is committed to transparency in our digital operations.</p>
                </div>
                <a href="mailto:social@urbanummati.store" className="px-8 py-3 bg-[#C9A883] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#b8976f] transition-all whitespace-nowrap shadow-lg hover:-translate-y-0.5">
                  Contact Privacy Team
                </a>
              </div>
            </div>
          </article>

        </div>
      </div>
    </main>
  );
}
