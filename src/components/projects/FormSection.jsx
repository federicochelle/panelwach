function FormSection({ eyebrow, title, description, children }) {
  return (
    <section className="panel-card">
      <div className="panel-card__header">
        <div>
          {eyebrow ? <span className="section-tag">{eyebrow}</span> : null}
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
      </div>

      {children}
    </section>
  )
}

export default FormSection
