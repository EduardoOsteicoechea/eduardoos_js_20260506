export default function SermonPlayer({ sermonPath, audioRef }) {
  if (!sermonPath) return null;

  return (
    <section className="sermon-player" aria-label="Reproductor del sermón">
      <h2 className="sermon-player__label">
        Sermón
      </h2>

      <audio
        ref={audioRef}
        src={sermonPath}
        controls
        preload="metadata"
        className="sermon-player__audio"
      />
    </section>
  );
}
