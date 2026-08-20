import { useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { businessConfig } from '../config/businessConfig';
import { submitContactForm } from '../services/contactService';
import PhoneInputModule from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const PhoneInput = PhoneInputModule.default || PhoneInputModule;

const emptyValue = 'Not configured yet';
const contactItems = [
  ['Phone', 'phone', 'Call us'], ['Email', 'email', 'Email us'], ['WhatsApp', 'whatsapp', 'Chat with us'],
  ['Business Address', 'address', 'Location details'], ['Business Hours', 'businessHours', 'Hours to be confirmed'],
];

function getWhatsAppUrl(value) {
  if (value.startsWith('http')) return value;
  return `https://wa.me/${value.replace(/\D/g, '')}`;
}

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Please enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Enter a valid email address.';
  if (!values.phone || values.phone.length < 10) errors.phone = 'Enter a valid phone number with country code.';
  if (!values.subject.trim()) errors.subject = 'Please enter a subject.';
  if (!values.message.trim()) errors.message = 'Please enter a message.';
  return errors;
}

export default function ContactPage() {
  const [values, setValues] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const update = (event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setStatus('loading'); setErrorMessage('');
    try {
      await submitContactForm(values);
      setStatus('success');
      setValues({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message || 'Contact service setup is required before messages can be delivered.');
    }
  };

  return <>
    <Seo title="Contact BELL | Customer Support" description="Contact BELL for help with products, orders, delivery, and support in the UAE." />
    <section className="contact-hero"><div className="shell"><p className="eyebrow">BELL / CUSTOMER CARE</p><h1>Contact <em>BELL</em></h1><p>Have a question? Our team is here to help.</p></div></section>
    <section className="contact-overview shell">
      <div className="contact-info"><p className="section-label">GET IN TOUCH</p><h2>Every great experience begins with a <em>conversation.</em></h2><p className="lead">Our contact details are ready to be configured. Until then, use the form to prepare your request for the BELL support team.</p>
        <div className="contact-card-grid">{contactItems.map(([label, key, hint]) => <div className="contact-card" key={key}><span>{label}</span><strong className={businessConfig[key] ? '' : 'placeholder'}>{businessConfig[key] || emptyValue}</strong><small>{businessConfig[key] ? hint : 'Configuration required'}</small></div>)}</div>
      </div>
      <form className="contact-form" onSubmit={submit} noValidate aria-label="Contact BELL">
        <div className="form-heading"><p className="eyebrow">SEND A MESSAGE</p><h2>How can we <em>help?</em></h2></div>
        {status === 'success' && <div className="form-state success" role="status">Thanks for contacting BELL. Your message has been received.</div>}
        {status === 'error' && <div className="form-state error" role="alert">{errorMessage} Contact service setup is required for `POST /api/contact`.</div>}
        {[['name', 'Full Name', 'text'], ['email', 'Email', 'email'], ['subject', 'Subject', 'text']].map(([name, label, type]) => <label key={name}>{label}<input name={name} type={type} value={values[name]} onChange={update} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined} />{errors[name] && <small id={`${name}-error`} className="field-error">{errors[name]}</small>}</label>)}
        
        <label>
          Phone
          <PhoneInput
            country={'ae'}
            value={values.phone}
            onChange={(phone) => setValues(current => ({ ...current, phone }))}
            inputProps={{
              name: 'phone',
              required: true,
            }}
            containerClass="phone-input-container"
          />
          {errors.phone && <small className="field-error">{errors.phone}</small>}
        </label>
        <label>Message<textarea name="message" value={values.message} onChange={update} rows="5" aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'message-error' : undefined} />{errors.message && <small id="message-error" className="field-error">{errors.message}</small>}</label>
        <button className="button button-gold" disabled={status === 'loading'}>{status === 'loading' ? 'Sending…' : 'Send Message'} <span>→</span></button>
        <p className="form-note">This form sends to <code>POST /api/contact</code>. Connect a backend email or contact service to receive messages.</p>
      </form>
    </section>
    <section className="shell location-section"><div><p className="eyebrow">FIND BELL</p><h2>Visit us when location details are <em>available.</em></h2><p>Business address and map details can be added in the centralized business configuration.</p></div><div className="map-placeholder">{businessConfig.googleMapsUrl ? <iframe title="BELL location" src={businessConfig.googleMapsUrl} loading="lazy" /> : <div><span>⌖</span><strong>Map configuration required</strong><small>Add <code>googleMapsUrl</code> to businessConfig.js</small></div>}</div></section>
    <section className="support-ribbon"><div className="shell support-ribbon-inner"><div><p>WHATSAPP SUPPORT</p><h2>Prefer a quick chat?</h2></div>{businessConfig.whatsapp ? <a className="button button-gold" href={getWhatsAppUrl(businessConfig.whatsapp)} target="_blank" rel="noreferrer">Message on WhatsApp <span>→</span></a> : <span className="config-button">WhatsApp not configured</span>}</div></section>
    <section className="shell help-cta-grid"><div><p className="eyebrow">FAQ</p><h2>Looking for quick <em>answers?</em></h2><Link to="/faq" className="text-link">View FAQs <span>→</span></Link></div><div><p className="eyebrow">ORDER SUPPORT</p><h2>Need help with an <em>order?</em></h2><div className="inline-actions"><Link className="button button-outline-dark" to="/track-order">Track Order</Link><Link className="button button-dark" to="/contact">Contact Support</Link></div></div></section>
  </>;
}
