import Link from 'next/link';
import { format } from 'date-fns';
import styles from '../styles/ContentGrid.module.css';

interface ContentItem {
  id: string;
  title: string;
  type: string;
  tags: string[];
  date: string;
}

interface ContentGridProps {
  items: ContentItem[];
}

export default function ContentGrid({ items }: ContentGridProps) {
  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No content found.</p>
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
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return dateString; // Return original string if error
    }
  };

  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <article key={item.id} className={styles.card}>
          <div className={styles.cardContent}>
            <div className={styles.cardHeader}>
              <span className={styles.contentType}>{item.type}</span>
              <time className={styles.date} dateTime={item.date}>
                {formatDate(item.date)}
              </time>
            </div>
            
            <h3 className={styles.title}>
              <Link href={`/${item.type}s/${item.id}`} className={styles.titleLink}>
                {item.title}
              </Link>
            </h3>
            
            {item.tags && item.tags.length > 0 && (
              <div className={styles.tags}>
                {item.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
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