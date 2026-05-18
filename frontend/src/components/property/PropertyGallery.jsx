export function PropertyGallery({ images = [] }) {
  if (!images.length) {
    return (
      <div className="gallery">
        <div className="gallery-main" />
      </div>
    );
  }

  const main = images[0];
  const side = images.slice(1, 3);

  return (
    <div className="gallery">
      <div className="gallery-main">
        <img src={main.url} alt={main.alt || ""} />
      </div>
      <div className="gallery-side">
        {side.map((img) => (
          <div className="gallery-cell" key={img.id}>
            <img src={img.url} alt={img.alt || ""} loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
}
