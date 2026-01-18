import { format } from 'date-fns';
import styles from '../styles/ProjectGrid.module.css';

interface Project {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  date: string;
  github_url?: string;
  demo_url?: string;
}

interface ProjectGridProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
}

export default function ProjectGrid({ projects, onProjectClick }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No projects found.</p>
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

  const handleCardClick = (project: Project) => {
    if (onProjectClick) {
      onProjectClick(project);
    }
  };

  return (
    <div className={styles.grid}>
      {projects.map((project) => (
        <article 
          key={project.id} 
          className={styles.card}
          onClick={() => handleCardClick(project)}
        >
          <div className={styles.cardContent}>
            <div className={styles.cardHeader}>
              <time className={styles.date} dateTime={project.date}>
                {formatDate(project.date)}
              </time>
            </div>
            
            <h3 className={styles.title}>
              <span className={styles.titleLink}>
                {project.title}
              </span>
            </h3>
            
            {project.description && (
              <div className={styles.description}>
                {project.description.length > 200
                  ? `${project.description.substring(0, 200)}...`
                  : project.description}
              </div>
            )}
            
            <div className={styles.links}>
              {project.github_url && (
                <a 
                  href={project.github_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.link}
                  onClick={(e) => e.stopPropagation()}
                >
                  GitHub
                </a>
              )}
              {project.demo_url && (
                <a 
                  href={project.demo_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.link}
                  onClick={(e) => e.stopPropagation()}
                >
                  Demo
                </a>
              )}
            </div>
            
            {project.tags && project.tags.length > 0 && (
              <div className={styles.tags}>
                {project.tags.map((tag) => (
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