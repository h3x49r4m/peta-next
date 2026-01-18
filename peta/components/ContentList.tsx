import Link from 'next/link';
import { format } from 'date-fns';
import styles from '../styles/ContentList.module.css';

interface ContentItem {
  id: string;
  title: string;
  type?: string;
  tags: string[];
  date: string;
  author?: string;
}

interface ContentListProps {
  items: ContentItem[];
  type: string;
  onItemClick?: (item: ContentItem) => void;
}

export default function ContentList({ items, type, onItemClick }: ContentListProps) {
  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No {type}s found.</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return dateString; // Return original string if invalid
      }
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      return dateString; // Return original string if error
    }
  };

  const handleItemClick = (item: ContentItem) => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  // Map type to correct path
  const getPathFromType = (contentType: string) => {
    switch (contentType) {
      case 'post': return 'posts';
      case 'snippet': return 'snippets';
      case 'project': return 'projects';
      default: return `${contentType}s`;
    }
  };

  return (
    <div className={styles.list}>
      {items.map((item) => (
        <article key={item.id} className={styles.item}>
          <div className={styles.itemContent}>
            <div className={styles.itemHeader}>
              {onItemClick ? (
                <h2 className={styles.title}>
                  <button 
                    onClick={() => handleItemClick(item)}
                    className={styles.titleButton}
                    aria-label={`Read ${item.title}`}
                  >
                    {item.title}
                  </button>
                </h2>
              ) : (
                <h2 className={styles.title}>
                  <Link href={`/${getPathFromType(type)}/${item.id}`} className={styles.titleLink}>
                    {item.title}
                  </Link>
                </h2>
              )}
              
              <div className={styles.meta}>
                <time className={styles.date} dateTime={item.date}>
                  {formatDate(item.date)}
                </time>
                
                {item.author && (
                  <span className={styles.author}>
                    by {item.author}
                  </span>
                )}
              </div>
            </div>
            
            {item.tags && item.tags.length > 0 && (
              <div className={styles.tags}>
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className={styles.tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}