import ContentBlock from './ContentBlock';
import { VIEW_MODES } from '../../lib/viewModes';

export default function SectionContent({
  content = [],
  sectionIndex,
  viewMode,
}) {
  const blocks =
    viewMode === VIEW_MODES.outline
      ? content.filter((block) => block?.biblical_reference)
      : content;

  if (!blocks.length) {
    if (viewMode === VIEW_MODES.outline) {
      return (
        <p className="theme-muted text-sm italic">
          Sin referencias bíblicas en esta sección.
        </p>
      );
    }
    return null;
  }

  return blocks.map((block, blockIndex) => (
    <ContentBlock
      key={`${sectionIndex}-${blockIndex}`}
      block={block}
      index={blockIndex}
      outlineOnly={viewMode === VIEW_MODES.outline}
    />
  ));
}
