import { useEffect } from 'react';

export default function Seo({ title, description, structuredData }) {
  useEffect(() => {
    document.title = title;
    let descriptionTag = document.head.querySelector('meta[name="description"]');
    if (!descriptionTag) {
      descriptionTag = document.createElement('meta');
      descriptionTag.name = 'description';
      document.head.appendChild(descriptionTag);
    }
    descriptionTag.content = description;

    ['og:title', 'og:description'].forEach((property) => {
      let tag = document.head.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.property = property;
        document.head.appendChild(tag);
      }
      tag.content = property === 'og:title' ? title : description;
    });
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;
    let jsonLd = document.head.querySelector('script[data-bell-jsonld]');
    if (structuredData) {
      if (!jsonLd) {
        jsonLd = document.createElement('script');
        jsonLd.type = 'application/ld+json';
        jsonLd.dataset.bellJsonld = 'true';
        document.head.appendChild(jsonLd);
      }
      jsonLd.textContent = JSON.stringify(structuredData);
    } else if (jsonLd) {
      jsonLd.remove();
    }
  }, [title, description, structuredData]);

  return null;
}
