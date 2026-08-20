import Seo from '../components/Seo';
import PageHero from '../components/PageHero';

export default function ShippingPolicyPage() {
  return (
    <>
      <Seo
        title="Shipping Policy | BELL"
        description="Learn about BELL's delivery options and shipping across the UAE."
      />
      <PageHero eyebrow="BELL / CUSTOMER CARE" title={<em>Shipping Policy</em>} />

      <article className="shell legal-page">
        <p className="eyebrow">DELIVERY</p>
        <h2>Free shipping, all over the UAE.</h2>
        <p>
          BELL is proud to offer free shipping on eligible orders across the United Arab Emirates.
          Delivery timelines and options are confirmed at checkout based on your location.
        </p>

        <h3>Delivery coverage</h3>
        <p>We currently deliver to all Emirates within the UAE.</p>

        <h3>Delivery timing</h3>
        <p>
          Standard delivery times are confirmed during checkout once your order and address are
          finalized. Delays may occur due to product availability, courier schedules, or
          circumstances outside our control.

        </p>

        <h3>Order tracking</h3>
        <p>
          Once your order has shipped, you can track its status from your BELL account under
          "Orders."
        </p>

        <h3>Failed or refused deliveries</h3>
        <p>
          If a delivery cannot be completed or is refused by the customer, operational charges may
          apply as outlined in our Refund Policy.
        </p>

        <h3>Contact Us</h3>
        <p>For delivery questions, email us at contact@BELLPHONESS.COM.</p>
      </article>
    </>
  );
}