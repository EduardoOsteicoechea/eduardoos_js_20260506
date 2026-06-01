import Idea from './Idea';
import BiblicalQuote from './BiblicalQuote';
import Image from './Image';
import List from './List';

/**
 * Maps a JSON content block to the matching presentation component.
 */
export default function ContentBlock({ block, index, outlineOnly = false }) {
  if (!block) return null;

  if (outlineOnly) {
    if (!block.biblical_reference) return null;
    return (
      <BiblicalQuote
        key={index}
        text={block.text}
        reference={block.biblical_reference}
        emphasizedPhrases={block.emphasized_phrases}
      />
    );
  }

  if (block.list?.length) {
    return (
      <List
        key={index}
        items={block.list}
        ordered={Boolean(block.ordered)}
      />
    );
  }

  if (block.image) {
    return (
      <Image
        key={index}
        src={block.image}
        alt={block.alt ?? block.text ?? ''}
      />
    );
  }

  if (block.biblical_reference) {
    return (
      <BiblicalQuote
        key={index}
        text={block.text}
        reference={block.biblical_reference}
        emphasizedPhrases={block.emphasized_phrases}
      />
    );
  }

  return (
    <Idea
      key={index}
      text={block.text}
      emphasizedPhrases={block.emphasized_phrases}
    />
  );
}
