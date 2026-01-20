import Link from 'next/link';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import styles from '../styles/ContentGrid.module.css';

interface ContentItem {
  id: string;
  title: string;
  type: string;
  tags: string[];
  date: string;
  content?: any[];
}

interface ContentGridProps {
  items: ContentItem[];
}

export default function ContentGrid({ items }: ContentGridProps) {
  const router = useRouter();
  // Ensure items is an array
  const itemsArray = Array.isArray(items) ? items : [];
  
  if (itemsArray.length === 0) {
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

  const handleItemClick = (item: ContentItem) => {
    // Navigate to the appropriate page based on content type
    let targetUrl = '';
    
    switch (item.type) {
      case 'article':
        targetUrl = `/articles?post=${item.id}`;
        break;
      case 'snippet':
        targetUrl = `/snippets?snippet=${item.id}`;
        break;
      case 'book':
        targetUrl = `/books?book=${item.id}`;
        break;
      case 'project':
        targetUrl = `/projects?project=${item.id}`;
        break;
      default:
        // Fallback for other types
        targetUrl = `/${item.type}s/${item.id}`;
    }
    
    // Navigate to the target URL
    router.push(targetUrl);
  };

  return (
    <div className={styles.grid}>
      {itemsArray.map((item) => (
        <article 
          key={item.id} 
          className={styles.card}
          onClick={() => handleItemClick(item)}
          style={{ cursor: 'pointer' }}
        >
          <div className={styles.cardContent}>
            <div className={styles.cardHeader}>
              <span className={styles.contentType}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
              <time className={styles.date} dateTime={item.date}>
                {formatDate(item.date)}
              </time>
            </div>
            
            <h3 className={styles.title}>
              <span className={styles.titleLink}>
                {item.title}
              </span>
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