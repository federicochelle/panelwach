function FieldGroup({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  as = 'input',
  min,
  error,
}) {
  const sharedProps = {
    className: `project-field__control${error ? ' project-field__control--error' : ''}`,
    value,
    onChange,
    placeholder,
  }

  return (
    <label className="project-field">
      <span>{label}</span>
      {as === 'textarea' ? (
        <textarea {...sharedProps} rows="5" />
      ) : (
        <input {...sharedProps} type={type} min={min} />
      )}
      {error ? <small className="project-field__error">{error}</small> : null}
    </label>
  )
}

export default FieldGroup
