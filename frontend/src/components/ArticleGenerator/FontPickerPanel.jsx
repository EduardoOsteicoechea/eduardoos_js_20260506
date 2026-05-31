import { FONT_FAMILIES } from '../../lib/fonts';

export default function FontPickerPanel({
  open,
  selectedFontId,
  onSelect,
  onClose,
}) {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 bottom-[45px] z-[55] cursor-default bg-transparent"
        aria-label="Cerrar selector de fuente"
        onClick={onClose}
      />

      <aside
        className="theme-border theme-surface fixed bottom-[45px] left-0 right-0 z-[60] border-t px-4 py-4"
        role="dialog"
        aria-label="Selector de fuente"
      >
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide opacity-70">
          Fuente
        </h2>

        <div className="grid gap-2 sm:grid-cols-2">
          {FONT_FAMILIES.map((font) => {
            const isSelected = font.id === selectedFontId;

            return (
              <button
                key={font.id}
                type="button"
                onClick={() => onSelect(font.id)}
                className={`theme-border rounded-lg border px-4 py-3 text-left transition ${
                  isSelected
                    ? 'ring-2 ring-black dark:ring-white'
                    : 'hover:bg-black/5 dark:hover:bg-white/10'
                }`}
                style={{ fontFamily: font.stack }}
              >
                <span className="block text-base font-semibold">{font.label}</span>
                <span className="theme-muted mt-1 block text-xs">
                  The quick brown fox jumps over the lazy dog.
                </span>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
}
