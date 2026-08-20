import Seo from '../components/Seo';
import PageHero from '../components/PageHero';

const sections = [
  {
    title: 'Agreement to Terms',
    body: [
      'By accessing and placing an order with BELL, you confirm that you agree to be bound by these Terms & Conditions, which apply to the entire website and any communication between you and BELL.',
      'BELL will not provide services or products to any OFAC-sanctioned countries in accordance with UAE law.',
    ],
  },
  {
    title: 'License',
    body: [
      'BELL grants you a revocable, non-exclusive, non-transferable, limited license to use the website strictly in accordance with these Terms.',
    ],
  },
  {
    title: 'Restrictions',
    body: [
      'You agree not to license, sell, rent, distribute, or commercially exploit the website, and not to modify, reverse-engineer, or decompile any part of it.',
    ],
  },
  {
    title: 'Your Suggestions',
    body: [
      'Any feedback, comments, or suggestions you provide about the website become the sole property of BELL and may be used without credit or compensation.',
    ],
  },
  {
    title: 'Term and Termination',
    body: [
      'This Agreement remains in effect until terminated by you or BELL. BELL may suspend or terminate this Agreement at any time, with or without notice, particularly in the event of a violation of these Terms.',
    ],
  },
  {
    title: 'Guidelines for Reviews',
    body: [
      'Reviews should comply with applicable laws and not contain offensive, discriminatory, or misleading content. BELL may accept, reject, or remove any review at its sole discretion.',
    ],
  },
  {
    title: 'Governing Law & Arbitration',
    body: [
      'These Terms are governed by the laws of the Dubai International Financial Centre (DIFC). Any disputes shall be resolved by arbitration under LCIA rules, seated in the DIFC, in English.',
    ],
  },
  {
    title: 'Intellectual Property',
    body: [
      'The website and its entire content, features, and functionality are owned by BELL and protected by UAE and international intellectual property laws. Unauthorized use of any material is prohibited.',
    ],
  },
  {
    title: 'Indemnification',
    body: [
      'You agree to indemnify BELL and its affiliates from any claim arising from your use of the website, violation of these Terms, or violation of any third-party right.',
    ],
  },
  {
    title: 'No Warranties & Limitation of Liability',
    body: [
      'The website is provided "as is" without warranty of any kind. BELL\'s liability under any provision of this Agreement is limited to the amount you paid for the product or service in question.',
    ],
  },
  {
    title: 'Typographical Errors',
    body: [
      'If a product is listed at an incorrect price due to a typographical error, BELL reserves the right to refuse or cancel any order placed for that product, and will issue a full refund if payment was already collected.',
    ],
  },
  {
    title: 'Contact Us',
    body: [
      'For questions about these Terms & Conditions, contact us at contact@BELLPHONESS.COM.',
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <Seo
        title="Terms & Conditions | BELL"
        description="Read the terms and conditions that govern your use of the BELL website and services."
      />
      <PageHero eyebrow="BELL / CUSTOMER CARE" title={<em>Terms & Conditions</em>} />

      <article className="shell legal-page">
        <p className="eyebrow">AGREEMENT</p>
        <h2>Please read carefully.</h2>
        <p>
          These Terms & Conditions are a contract between you and AL JARAS ELECTRONICS TRADING LLC
          (trading as BELL). By using our Service, you agree to be bound by them.
        </p>

        {sections.map((section) => (
          <div key={section.title}>
            <h3>{section.title}</h3>
            {section.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        ))}
      </article>
    </>
  );
}