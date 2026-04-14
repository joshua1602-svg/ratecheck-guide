import BrandMark from "@/components/BrandMark";

const Privacy = () => (
  <div className="min-h-screen bg-primary">
    <div className="mx-auto max-w-form px-5 py-8 animate-fade-in">
      <header className="mb-10 flex justify-center"><BrandMark /></header>
      <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
      <div className="mt-6 space-y-6 text-sm leading-relaxed text-muted-foreground text-justify">
        <section>
          <h2 className="text-base font-semibold text-foreground font-sans">Purpose of Data Collection</h2>
          <p className="mt-2">
            We collect property information and your contact details (specifically your email address) to generate your business rates assessment and deliver your requested reports. If you do not purchase a premium report, we may also use this information to connect you with qualified professional partners who can assist with your business rates challenge, provided you have given us your explicit consent to do so.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground font-sans">Personal vs. Public Data</h2>
          <p className="mt-2">
            While the property valuation data used in our reports is sourced from the Valuation Office Agency (VOA) public bulk dataset, the contact information you provide is treated as private personal data. We link this personal data to your property assessment to provide a tailored service.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground font-sans">Third-Party Sharing &amp; Referrals</h2>
          <p className="mt-2">
            We do not sell your personal data to general marketing lists. Your information is only shared with third-party professional partners (such as Chartered Surveyors or rating agencies) if you explicitly opt-in to a referral or "No Win, No Fee" consultation on our results page. RateCheck may receive a referral fee or commission from these partners if you choose to engage their services.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground font-sans">Payment Processing</h2>
          <p className="mt-2">
            All payments for our Evidence Pack (£149) are processed securely by Stripe. We do not store, process, or have access to your credit or debit card details at any time. Stripe's separate privacy policy applies to all payment data.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground font-sans">Report Delivery</h2>
          <p className="mt-2">
            Paid reports are delivered to the email address you provide and are available via a download link immediately following a successful transaction.
          </p>
        </section>
      </div>
    </div>
  </div>
);

export default Privacy;
