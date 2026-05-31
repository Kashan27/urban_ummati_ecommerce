import { Legal } from "@/views/Legal";

export const metadata = {
  title: "Terms & Conditions | Urban Ummati",
};

export default function TermsPage() {
  return (
    <Legal
      title="Terms & Conditions"
      lastUpdated="May 31, 2026"
      content={
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-medium mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using our website, you agree to be bound by these Terms and Conditions. 
              If you do not agree with any part of these terms, you may not access the website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium mb-4">2. Intellectual Property Rights</h2>
            <p>
              Unless otherwise indicated, the website and its original content, features, and functionality 
              are and will remain the exclusive property of Urban Ummati. Our trademarks and trade dress 
              may not be used in connection with any product or service without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium mb-4">3. User Representations</h2>
            <p>
              By using the website, you represent and warrant that you have the legal capacity and you agree 
              to comply with these Terms and Conditions. You will not use the website for any illegal or 
              unauthorized purpose.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium mb-4">4. Purchase and Payment</h2>
            <p>
              We accept the following forms of payment: Visa, Mastercard, American Express, and other major 
              credit cards via Stripe. You agree to provide current, complete, and accurate purchase and 
              account information for all purchases made via our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium mb-4">5. Shipping and Delivery</h2>
            <p>
              Delivery times may vary depending on your location and the shipping method selected. 
              We are not responsible for delays outside of our control. All items are subject to availability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium mb-4">6. Limitation of Liability</h2>
            <p>
              In no event shall Urban Ummati, nor its directors, employees, partners, or agents, be liable 
              for any indirect, incidental, special, consequential, or punitive damages, including without 
              limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium mb-4">7. Governing Law</h2>
            <p>
              These Terms and Conditions and your use of the website are governed by and construed in 
              accordance with the laws of Canada, without regard to its conflict of law principles.
            </p>
          </section>
        </div>
      }
    />
  );
}
