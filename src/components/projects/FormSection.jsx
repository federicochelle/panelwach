function FormSection({ eyebrow, title, description, titleMeta, actions, children }) {
  return (
    <section className="panel-card">
      <div className="panel-card__header">
        <div>
          {eyebrow ? <span className="section-tag">{eyebrow}</span> : null}
          <div className="panel-card__title-row">
            <h3>{title}</h3>
            {titleMeta}
          </div>
          {description ? <p>{description}</p> : null}
        </div>
        {actions ? <div className="panel-card__actions">{actions}</div> : null}
      </div>

      {children}
    </section>
  )
}

export default FormSection
