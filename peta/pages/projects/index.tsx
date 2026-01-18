import { useState, useEffect } from 'react';
import TagFilter from '../../components/TagFilter';
import ProjectGrid from '../../components/ProjectGrid';
import ProjectModal from '../../components/ProjectModal';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../../styles/Projects.module.css';

interface Project {
  id: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  github_url?: string;
  demo_url?: string;
  content: any[];
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadProjectsContent();
  }, []);

  useEffect(() => {
    // Reset selected project when the route changes (e.g., when clicking the Projects link)
    const handleRouteChange = (url: string) => {
      // If navigating to /projects without query params, clear selections
      if (url === '/projects' || url === '/projects?') {
        setSelectedTag('');
        setIsModalOpen(false);
      }
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  // Also check on mount
  useEffect(() => {
    // If URL is just /projects without query params, clear selections
    if (router.asPath === '/projects' || router.asPath === '/projects?') {
      setSelectedTag('');
    }
  }, [router.asPath]);

  useEffect(() => {
    // When a tag is selected, update URL
    if (selectedTag) {
      // Update URL to include tag
      const url = `/projects?tag=${encodeURIComponent(selectedTag)}`;
      window.history.pushState({}, '', url);
    }
  }, [selectedTag]);

  const loadProjectsContent = async () => {
    try {
      const [projectsResponse, tagsResponse] = await Promise.all([
        fetch('/api/content/project'),
        fetch('/api/tags?type=project')
      ]);
      
      const projectsData = await projectsResponse.json();
      const tagsData = await tagsResponse.json();
      
      // Sort projects by date (newest first)
      const sortedProjects = Array.isArray(projectsData) 
        ? projectsData.sort((a: Project, b: Project) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB.getTime() - dateA.getTime(); // Newest first
          })
        : projectsData;
      
      setProjects(sortedProjects);
      setTags(tagsData);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = selectedTag
    ? projects.filter(project => project.tags.includes(selectedTag))
    : projects;

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedTag(''); // Clear selected tag when clicking title
    // Update the URL to just /projects
    window.history.pushState({}, '', '/projects');
  };

  return (
    <div className={styles.pageContainer}>
      {/* Section 1: Header with title and tags */}
      <header className={styles.pageHeader}>
        <div className={styles.headerSection}>
          <Link href="/projects" onClick={handleTitleClick} className={styles.titleLink}>
            <h1 className={styles.title}>Projects</h1>
          </Link>
          <div className={styles.tagsSection}>
            <TagFilter
              tags={tags}
              selectedTag={selectedTag}
              onTagSelect={setSelectedTag}
            />
          </div>
        </div>
      </header>
      
      {/* Section 2: Full-width cards grid */}
      <main className={styles.mainContentFull}>
        {selectedTag && (
          <div className={styles.tagInfo}>
            <p>Showing projects tagged with <strong>{selectedTag}</strong></p>
          </div>
        )}
        
        {loading ? (
          <div className={styles.loading}>
            <p>Loading projects...</p>
          </div>
        ) : (
          <ProjectGrid 
            projects={filteredProjects} 
            onProjectClick={handleProjectClick}
          />
        )}
      </main>
      
      {/* Modal for project details */}
      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
}