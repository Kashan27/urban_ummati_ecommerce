"use client";

import { type FormEvent, useMemo, useState } from "react";

const SUPPORT_EMAIL = "social@urbanummati.store";
const SUPPORT_PHONE = "+18001234567";

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const mailtoHref = useMemo(() => {
    const subject = `Urban Ummati Support: ${name ? name : "Customer"}${email ? ` (${email})` : ""}`;
    const body = message ? message : "";
    const params = new URLSearchParams({
      subject,
      body,
    });
    return `mailto:${SUPPORT_EMAIL}?${params.toString()}`;
  }, [email, message, name]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    window.location.href = mailtoHref;
  };

  return (
    <main className="flex-1 w-full pt-10 pb-24">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">Contact</h1>
          <div className="w-16 h-0.5 bg-secondary mx-auto mb-6"></div>
          <p className="font-sans text-muted-foreground max-w-2xl mx-auto">
            Reach out for order help, product questions, or anything else.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Email</div>
            <a className="mt-2 block text-sm text-foreground hover:text-primary" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>

            <div className="mt-6 text-xs uppercase tracking-[0.18em] text-muted-foreground">Phone</div>
            <a className="mt-2 block text-sm text-foreground hover:text-primary" href={`tel:${SUPPORT_PHONE}`}>
              +1 (800) 123-4567
            </a>

            <div className="mt-6 text-xs uppercase tracking-[0.18em] text-muted-foreground">Dispatch</div>
            <div className="mt-2 text-sm text-foreground">Canada</div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:col-span-2">
            <h2 className="font-serif text-2xl text-foreground">Send a message</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This opens your email app with the message pre-filled.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="mt-2 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="How can we help?"
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-colors hover:bg-primary/90"
                  disabled={!message.trim()}
                >
                  Email Support
                </button>
                <a
                  href={mailtoHref}
                  className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-6 text-xs font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-muted/30"
                >
                  Open In Email
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
