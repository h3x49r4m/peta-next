import styles from '../styles/TagFilter.module.css';

interface TagData {
  name: string;
  count: number;
}

interface TagFilterProps {
  tags: string[] | TagData[];
  selectedTag: string;
  onTagSelect: (tag: string) => void;
}

export default function TagFilter({ tags, selectedTag, onTagSelect }: TagFilterProps) {
  if (tags.length === 0) {
    return null;
  }

  // Convert string tags to TagData format if needed
  const tagData = tags.map(tag => 
    typeof tag === 'string' ? { name: tag, count: 0 } : tag
  );

  // Sort tags by count (most popular first)
  tagData.sort((a, b) => b.count - a.count);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Tags</h3>
      <div className={styles.tagCloud}>
        {tagData.map((tag) => (
          <button
            key={tag.name}
            onClick={() => onTagSelect(tag.name)}
            className={`${styles.tag} ${selectedTag === tag.name ? styles.selected : ''}`}
            aria-label={`Filter by ${tag.name}`}
          >
            <span className={styles.tagName}>{tag.name}</span>
            <span className={styles.tagCount}>({tag.count})</span>
          </button>
        ))}
      </div>
    </div>
  );
}