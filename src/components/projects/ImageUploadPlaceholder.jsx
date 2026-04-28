function ImageUploadPlaceholder({
  label,
  fileName,
  hint,
  previewUrl = '',
  currentUrl = '',
  onFileChange,
  isUploading = false,
}) {
  return (
    <div className="image-upload-placeholder">
      <div className="image-upload-placeholder__preview">
        {previewUrl ? (
          <img src={previewUrl} alt={label} />
        ) : (
          <span>Sin imagen</span>
        )}
      </div>

      <div className="image-upload-placeholder__meta">
        <strong>{fileName || `Todavía no hay ${label.toLowerCase()} seleccionada`}</strong>
        <p>{hint}</p>

        {currentUrl ? <p>URL activa: {currentUrl}</p> : null}

        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          disabled={isUploading}
        />

        <p>
          {isUploading
            ? 'Subiendo imagen a Supabase Storage...'
            : 'Seleccioná una imagen para guardar su URL en `image_cf`.'}
        </p>
      </div>
    </div>
  )
}

export default ImageUploadPlaceholder
