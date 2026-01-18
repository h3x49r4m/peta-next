import { format } from 'date-fns';
import styles from '../styles/SnippetGrid.module.css';

interface Snippet {
  id: string;
  title: string;
  content: any[]; // Changed to array to match API response
  tags: string[];
  date: string;
}

interface SnippetGridProps {
  snippets: Snippet[];
  onSnippetClick?: (snippet: Snippet) => void;
}

export default function SnippetGrid({ snippets, onSnippetClick }: SnippetGridProps) {
  if (snippets.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No snippets found.</p>
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

  const renderContent = (content: any[]) => {
    // Extract text content from the content array
    return content
      .filter(item => item.type === 'text' && item.content)
      .map(item => item.content)
      .join(' ')
      .substring(0, 200) + '...';
  };

  const handleCardClick = (snippet: Snippet) => {
    if (onSnippetClick) {
      onSnippetClick(snippet);
    }
  };

  return (
    <div className={styles.grid}>
      {snippets.map((snippet) => (
        <article 
          key={snippet.id} 
          className={styles.card}
          onClick={() => handleCardClick(snippet)}
        >
          <div className={styles.cardContent}>
            <div className={styles.cardHeader}>
              <time className={styles.date} dateTime={snippet.date}>
                {formatDate(snippet.date)}
              </time>
            </div>
            
            <h3 className={styles.title}>
              <span className={styles.titleLink}>
                {snippet.title}
              </span>
            </h3>
            
            <div className={styles.content}>
              <p>{renderContent(snippet.content)}</p>
            </div>
            
            {snippet.tags && snippet.tags.length > 0 && (
              <div className={styles.tags}>
                {snippet.tags.map((tag) => (
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