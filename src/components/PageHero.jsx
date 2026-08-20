export function PageHero({ title, eyebrow = 'BELL' }) {
  return (
    <section className="page-hero">
      <div className="shell">
        {eyebrow && (
          <p className="eyebrow">
            {eyebrow}
          </p>
        )}

        <h1>{title}</h1>
      </div>
    </section>
  );
}

export default PageHero;