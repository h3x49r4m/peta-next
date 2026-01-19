import { format } from 'date-fns';
import styles from '../styles/BookGrid.module.css';

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  date: string;
  tags: string[];
  coverImage?: string;
  sections?: any[];
}

interface BookGridProps {
  books: Book[];
  onBookClick?: (book: Book) => void;
}

export default function BookGrid({ books, onBookClick }: BookGridProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const handleBookClick = (book: Book) => {
    if (onBookClick) {
      onBookClick(book);
    }
  };

  if (!books || books.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No books found.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {books.map((book) => (
        <div key={book.id} className={styles.bookCard}>
          <div className={styles.bookCover}>
            {book.coverImage ? (
              <img src={book.coverImage} alt={book.title} />
            ) : (
              <div className={styles.defaultCover}>
                <span>{book.title.charAt(0)}</span>
              </div>
            )}
          </div>
          <div className={styles.bookInfo}>
            <h3 className={styles.bookTitle}>{book.title}</h3>
            <p className={styles.bookAuthor}>by {book.author}</p>
            <div className={styles.bookMeta}>
              <time className={styles.bookDate} dateTime={book.date}>
                {formatDate(book.date)}
              </time>
            </div>
            {book.tags && book.tags.length > 0 && (
              <div className={styles.bookTags}>
                {book.tags.map((tag) => (
                  <span key={tag} className={styles.bookTag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <p className={styles.bookDescription}>{book.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}