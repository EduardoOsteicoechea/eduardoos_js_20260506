export default function SermonPlayer({ sermonPath, audioRef }) {
  if (!sermonPath) return null;

  return (
    <section className="mb-10" aria-label="Reproductor del sermón">
      <h2 className="mb-3 text-[1.1em] font-semibold uppercase tracking-wide opacity-70">
        Sermón
      </h2>

      <audio
        ref={audioRef}
        src={sermonPath}
        controls
        preload="metadata"
        className="w-full"
      />
    </section>
  );
}
