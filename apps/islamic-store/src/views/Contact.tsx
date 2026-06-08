"use client";

import { Mail, Clock, MapPin, Package, RefreshCw, HelpCircle, Camera } from "lucide-react";
import { Link } from "@/lib/router";

const SUPPORT_EMAIL = "social@urbanummati.store";
const OFFICE_ADDRESS = "5063 N Service Rd #200, Burlington, ON L7L 5H6";

export function Contact() {
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
            <Mail size={14} />
            Customer Concierge
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-6 tracking-tight">
            Contact Us
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed uppercase tracking-widest font-medium">
            We’d love to hear from you. Our team is here to help.
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 mt-16">
        
        <div className="space-y-16">
          
          {/* Primary Contact Cards */}
          <section className="grid gap-6 md:grid-cols-2">
            <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm group hover:border-[#C9A883]/30 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-[#FAF9F6] rounded-xl text-[#C9A883] group-hover:bg-[#C9A883] group-hover:text-white transition-colors duration-300">
                  <Mail size={24} />
                </div>
                <h3 className="font-serif text-xl text-[#152238]">Customer Support</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                For all general enquiries, please reach out to us at:
              </p>
              <a 
                href={`mailto:${SUPPORT_EMAIL}`} 
                className="text-lg font-medium text-[#152238] hover:text-[#C9A883] transition-colors break-all underline decoration-[#C9A883]/20 underline-offset-4"
              >
                {SUPPORT_EMAIL}
              </a>
            </div>

            <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm group hover:border-[#C9A883]/30 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-[#FAF9F6] rounded-xl text-[#C9A883] group-hover:bg-[#C9A883] group-hover:text-white transition-colors duration-300">
                  <Clock size={24} />
                </div>
                <h3 className="font-serif text-xl text-[#152238]">Response Time</h3>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-1">
                We aim to respond within <span className="text-[#152238] font-semibold">1–2 business days</span>.
              </p>
              <p className="text-[11px] uppercase tracking-widest text-[#C9A883] font-bold">
                Monday – Friday
              </p>
            </div>
          </section>

          {/* Detailed Info Sections */}
          <div className="grid gap-12">
            
            {/* Order Support */}
            <section className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-8 md:gap-16">
                  <div className="md:w-1/3">
                    <h2 className="font-serif text-3xl text-[#152238] mb-4">Order Support</h2>
                    <div className="flex items-center gap-2 text-[#C9A883] font-bold text-[10px] uppercase tracking-[0.2em]">
                      <Package size={14} />
                      Existing Orders
                    </div>
                  </div>
                  <div className="flex-1 space-y-8">
                    <div>
                      <p className="text-slate-500 mb-6 leading-relaxed">
                        If your question is about an existing order, please include the following in your email:
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          "Full Name",
                          "Order Number",
                          "Checkout Email",
                          "Product Name",
                          "Issue Description"
                        ].map((item) => (
                          <li key={item} className="flex items-center gap-3 text-sm text-[#152238] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A883]"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-[#C9A883]/10">
                      <div className="flex items-center gap-2 mb-4 text-[#152238]">
                        <Camera size={18} className="text-[#C9A883]" />
                        <h4 className="font-bold text-xs uppercase tracking-wider">Damaged Items</h4>
                      </div>
                      <p className="text-sm text-slate-500 mb-4 italic">Please include photos of:</p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-xs text-slate-600">
                        <li>• Damaged product</li>
                        <li>• Outer shipping box</li>
                        <li>• Inner packaging</li>
                        <li>• Shipping label</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Two Column Section: Shipping & Returns */}
            <section className="grid md:grid-cols-2 gap-8">
              <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm">
                <h3 className="font-serif text-2xl text-[#152238] mb-4">Shipping Questions</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Check your tracking link first. If tracking hasn't updated or your package is delayed, contact us with your <span className="text-[#152238] font-semibold">order and tracking numbers</span>.
                </p>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-sm font-bold uppercase tracking-widest text-[#C9A883] hover:text-[#152238] transition-colors">
                  Contact Shipping →
                </a>
              </div>

              <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm">
                <h3 className="font-serif text-2xl text-[#152238] mb-4">Returns & Refunds</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Review our policy before requesting a return. Do not send items back until you've received instructions from us.
                </p>
                <div className="flex gap-4">
                  <Link href="/shipping-policy" className="text-sm font-bold uppercase tracking-widest text-[#C9A883] hover:text-[#152238] transition-colors">
                    Policy →
                  </Link>
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="text-sm font-bold uppercase tracking-widest text-[#C9A883] hover:text-[#152238] transition-colors">
                    Request Return →
                  </a>
                </div>
              </div>
            </section>

            {/* Product Questions & Address */}
            <section className="bg-[#152238] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
                <div className="flex-1">
                  <div className="flex items-center justify-center md:justify-start gap-2 text-[#C9A883] font-bold text-[10px] uppercase tracking-[0.2em] mb-4">
                    <HelpCircle size={14} />
                    Art Advisory
                  </div>
                  <h3 className="font-serif text-3xl mb-4">Product Questions</h3>
                  <p className="text-slate-300 max-w-md leading-relaxed">
                    Need help choosing a piece, checking dimensions, or understanding materials? We’re happy to help you choose the right artwork for your home.
                  </p>
                </div>
                <div className="shrink-0 w-full md:w-auto">
                  <a 
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="inline-flex h-14 w-full md:w-auto items-center justify-center rounded-xl bg-[#C9A883] px-10 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-[#b8976f] hover:-translate-y-1 shadow-lg"
                  >
                    Email Our Team
                  </a>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-3 text-slate-400">
                  <MapPin size={16} className="text-[#C9A883]" />
                  <span className="text-xs tracking-wide uppercase">{OFFICE_ADDRESS}</span>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Burlington, Ontario</p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}
