import BrandMark from "@/components/BrandMark";

const Privacy = () => (
  <div className="min-h-screen bg-primary">
    <div className="mx-auto max-w-form px-5 py-8 animate-fade-in">
      <header className="mb-10"><BrandMark /></header>
      <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
      <div className="mt-6 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-base font-semibold text-foreground font-sans">Purpose of data collection</h2>
          <p className="mt-2">
            We collect property and contact information solely for the purpose of running business rates assessments and delivering reports. Your data is used to generate your personalised assessment and is not used for any other purpose.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground font-sans">Payment processing</h2>
          <p className="mt-2">
            All payments are processed securely by Stripe. We do not store, process, or have access to your card details at any time. Stripe's privacy policy applies to payment data.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground font-sans">Report delivery</h2>
          <p className="mt-2">
            Reports are delivered by email to the address you provide during the assessment process. A download link is also available immediately after payment.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground font-sans">Third-party sharing</h2>
          <p className="mt-2">
            We do not share your personal data or property information with any third parties. Your data is used exclusively for generating your assessment report.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground font-sans">Data deletion</h2>
          <p className="mt-2">
            If you would like your data deleted, please email{" "}
            <a href="mailto:hello@ratecheck.co.uk" className="underline hover:text-foreground">hello@ratecheck.co.uk</a>{" "}
            and we will remove your records within 30 days.
          </p>
        </section>
      </div>
    </div>
  </div>
);

export default Privacy;
