import { useState } from 'react';

import { SiteMenu } from '../SiteMenu';

import VisualizationModePanel from './VisualizationModePanel';



export default function ArticleActivityBar({

  theme,

  fontFamilyId,

  baseFontSize,

  viewMode,

  onToggleTheme,

  onIncreaseFont,

  onDecreaseFont,

  onSelectFont,

  onSelectViewMode,

  onScrollToTop,

  onScrollToBottom,

  onReload,

  isReloading = false,

  hasSermon = false,

  isSermonPlaying = false,

  isSermonLoading = false,

  onToggleSermon,

}) {

  const [viewModePickerOpen, setViewModePickerOpen] = useState(false);



  const handleSelectViewMode = (mode) => {

    onSelectViewMode(mode);

    setViewModePickerOpen(false);

  };



  return (

    <>

      <VisualizationModePanel

        open={viewModePickerOpen}

        selectedMode={viewMode}

        onSelect={handleSelectViewMode}

        onClose={() => setViewModePickerOpen(false)}

      />



      <footer

        className="theme-border theme-surface fixed bottom-0 left-0 right-0 z-50 flex h-[45px] border-t"

        role="toolbar"

        aria-label="Controles del artículo"

      >

        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto overflow-y-hidden px-3 sm:gap-3 sm:px-4">

          <button

            type="button"

            onClick={() => setViewModePickerOpen((open) => !open)}

            className={`theme-toolbar-btn shrink-0 ${viewModePickerOpen ? 'ring-2 ring-black dark:ring-white' : ''}`}

            aria-label="Modo de visualización"

            aria-expanded={viewModePickerOpen}

            title="Modo de visualización"

          >

            M

          </button>



          {hasSermon ? (
            <button
              type="button"
              onClick={onToggleSermon}
              disabled={isSermonLoading && !isSermonPlaying}
              className={`theme-toolbar-btn shrink-0 disabled:cursor-not-allowed disabled:opacity-50 ${
                isSermonPlaying ? 'ring-2 ring-black dark:ring-white' : ''
              }`}
              aria-label={isSermonPlaying ? 'Pausar sermón' : 'Reproducir sermón'}
              title={isSermonPlaying ? 'Pausar sermón' : 'Reproducir sermón'}
            >
              {isSermonLoading && !isSermonPlaying ? '…' : isSermonPlaying ? '❚❚' : '▶'}
            </button>
          ) : null}



          <button

            type="button"

            onClick={onScrollToTop}

            className="theme-toolbar-btn shrink-0"

            aria-label="Ir al inicio"

            title="Ir al inicio"

          >

            ↑

          </button>



          <button

            type="button"

            onClick={onScrollToBottom}

            className="theme-toolbar-btn shrink-0"

            aria-label="Ir al final"

            title="Ir al final"

          >

            ↓

          </button>



          <button

            type="button"

            onClick={onReload}

            disabled={isReloading}

            className="theme-toolbar-btn shrink-0 disabled:cursor-not-allowed disabled:opacity-50"

            aria-label="Recargar artículo desde JSON"

            title="Recargar JSON"

          >

            {isReloading ? '…' : '↻'}

          </button>

        </div>



        <div className="theme-border flex shrink-0 items-center border-l px-2 sm:px-3">

          <SiteMenu

            theme={theme}

            fontFamilyId={fontFamilyId}

            baseFontSize={baseFontSize}

            onToggleTheme={onToggleTheme}

            onIncreaseFont={onIncreaseFont}

            onDecreaseFont={onDecreaseFont}

            onSelectFont={onSelectFont}

          />

        </div>

      </footer>

    </>

  );

}

