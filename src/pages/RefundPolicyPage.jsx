import Seo from '../components/Seo';
import PageHero from '../components/PageHero';

export default function RefundPolicyPage() {
  return (
    <>
      <Seo
        title="Refund Policy | BELL"
        description="Learn about BELL's return and refund policy for orders."
      />
      <PageHero eyebrow="BELL / CUSTOMER CARE" title={<em>Refund Policy</em>} />

      <article className="shell legal-page">
        <p className="eyebrow">RETURNS & REFUNDS</p>
        <h2>Our return promise.</h2>
        <p>
          We want you to have a rewarding experience while shopping with BELL. The following terms
          apply to returns and refunds on all purchases.
        </p>

        <h3>When can you return a product?</h3>
        <p>You can return a product if:</p>
        <ul>
          <li>The product delivered is incorrect (not opened and still includes all original packaging).</li>
          <li>The product is damaged or flawed compared to the listing on our website.</li>
        </ul>

        <h3>Change of mind returns</h3>
        <p>
          You can return a product for a change of mind within 10 days of receiving it, and we
          guarantee a refund provided the product is undamaged, unused, and in its original
          packaging. A fee of up to 20% of the item price may be deducted to cover operational
          expenses.
        </p>

        <h3>Opened packaging</h3>
        <p>
          If the packaging has been opened but the product is not defective, unused, and shows no
          visible scratches or marks, a fee of up to 20% of the item price may still be deducted.
        </p>

        <h3>Refused deliveries</h3>
        <p>
          For items not accepted for delivery by the customer, a fee corresponding to operational
          expenses (up to 20% of the item price) may be deducted from the refund.
        </p>

        <h3>How to request a refund</h3>
        <p>
          Contact our support team via the Contact page with your order number and reason for
          return. We will confirm eligibility and provide instructions for returning the item.
        </p>

        <h3>Contact Us</h3>
        <p>For questions about a return or refund, email us at contact@BELLPHONESS.COM.</p>
      </article>
    </>
  );
}