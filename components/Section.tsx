export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h2 className="card-title">{title}</h2>
          {description ? <p className="muted mt-1">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}
