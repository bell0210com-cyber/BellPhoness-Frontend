import Seo from '../components/Seo';
import PageHero from '../components/PageHero';

export default function WarrantyPolicyPage() {
  return (
    <>
      <Seo
        title="Warranty Policy | BELL"
        description="Learn about the standard and extended warranty coverage BELL offers on eligible products."
      />
      <PageHero eyebrow="BELL / CUSTOMER CARE" title={<em>Warranty Policy</em>} />

      <article className="shell legal-page">
        <p className="eyebrow">PRODUCT WARRANTY</p>
        <h2>Coverage you can rely on.</h2>

        <h3>BELL Warranty</h3>
        <p>
          The BELL Warranty covers all eligible products for one year from the date of delivery. It
          provides comprehensive coverage for defects in materials and workmanship, excluding misuse
          and accidental damage. Within the first 10 days of purchase, the warranty covers all
          components of the product, including the screen. After this initial period, the warranty
          covers all components except the screen. Misuse — such as water damage, physical damage,
          or unauthorized modifications — voids the warranty.
        </p>

        <h3>BELL Extended Warranty</h3>
        <p>
          The BELL Extended Warranty extends coverage for an additional year, totalling two years
          from the date of purchase. It provides comprehensive coverage for defects in materials and
          workmanship, including misuse (such as accidental damage), up to a maximum value of AED
          1,500 per claim, limited to one claim per warranty period. Claims exceeding AED 1,500 are
          the responsibility of the customer.
        </p>

        <h3>General terms</h3>
        <ul>
          <li>Both warranties are non-transferable and apply only to the original purchaser.</li>
          <li>Warranty coverage does not extend to accessories or consumable items included with the product.</li>
          <li>BELL reserves the right to repair, replace, or refund the purchase price of any covered product.</li>
          <li>Repairs or modifications by unauthorized parties void the warranty.</li>
          <li>Warranty claims must be initiated through our customer support channels and may require the product to be returned for inspection.</li>
          <li>Proof of purchase may be required to process a warranty claim.</li>
        </ul>

        <h3>Contact Us</h3>
        <p>To initiate a warranty claim, contact our support team at contact@BELLPHONESS.COM.</p>
      </article>
    </>
  );
}