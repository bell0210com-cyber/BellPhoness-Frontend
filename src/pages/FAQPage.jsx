import { useState } from 'react';
import Seo from '../components/Seo';
import PageHero from '../components/PageHero';

const faqs = [
  ['Orders', 'How do I track an order?', 'You can track your order status anytime from your BELL account under "Orders."'],
  ['Delivery', 'Where do you deliver?', 'We offer free shipping across all Emirates in the UAE.'],
  ['Returns', 'How do returns work?', 'You may return a product within 10 days of delivery if it is unused and in its original packaging. See our Refund Policy for full details.'],
  ['Warranty', 'Is warranty included?', 'Eligible products come with a 12-month BELL Warranty, with an optional Extended Warranty available. See our Warranty Policy for details.'],
  ['Payment', 'Which payment methods are available?', 'Payment options are confirmed at checkout once our payment providers are connected.'],
  ['Products', 'How can I check product availability?', 'Product pages display current stock. Final availability is confirmed when your order is placed.'],
];

export default function FAQPage() {
  const [open, setOpen] = useState(null);

  return (
    <>
      <Seo title="FAQ | BELL" description="Answers to common BELL shopping questions." />
      <PageHero title={<>Frequently asked <em>questions.</em></>} />

      <section className="shell faq-list">
        {faqs.map(([tag, question, answer], i) => (
          <article key={question}>
            <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
              <span>{tag}</span>
              <b>{question}</b>
              <i>{open === i ? '−' : '+'}</i>
            </button>
            {open === i && <p>{answer}</p>}
          </article>
        ))}
      </section>
    </>
  );
}