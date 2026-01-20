import { GetStaticPaths, GetStaticProps } from 'next';
import fs from 'fs-extra';
import path from 'path';
import { useRouter } from 'next/router';
import Link from 'next/link';
import MathRenderer from '../../components/MathRenderer';
import CodeBlock from '../../components/CodeBlock';
import { useEffect } from 'react';

interface ProjectProps {
  project: any;
}

export default function Project({ project }: ProjectProps) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to /projects page with project parameter
    if (!router.isFallback && project) {
      router.replace(`/projects?project=${project.id}`);
    }
  }, [router.isFallback, project, router]);

  

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  if (!project || !project.frontmatter?.title) {
    return <div>Project not found</div>;
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      return dateString;
    }
  };

  const renderContent = (content: any[]) => {
    const elements: JSX.Element[] = [];
    
    for (let i = 0; i < content.length; i++) {
      const item = content[i];
      
      if (item.type === 'text') {
        // Convert RST-style text to HTML, preserving math formulas
        const htmlContent = item.content
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
          .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
          .replace(/`(.*?)`/g, '<code>$1</code>') // Inline code
          .replace(/\n\n/g, '</p><p>') // Paragraph breaks
          .replace(/\n/g, '<br />'); // Line breaks
        
        elements.push(
          <MathRenderer 
            key={i} 
            content={`<p>${htmlContent}</p>`}
          />
        );
      } else if (item.type === 'code-block') {
        elements.push(
          <CodeBlock 
            key={i}
            code={item.content}
            language={item.language || 'text'}
          />
        );
      }
    }
    
    return elements;
  };

  return (
    <div className="project-page">
      <div className="project-header">
        <h1>{project.frontmatter.title}</h1>
        <div className="project-meta">
          <span className="project-date">{formatDate(project.frontmatter.date)}</span>
          {project.frontmatter.author && (
            <span className="project-author"> by {project.frontmatter.author}</span>
          )}
          <div className="project-tags">
            {project.frontmatter.tags?.map((tag: string) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="project-content">
        {renderContent(project.content)}
      </div>
      <div className="project-footer">
        <Link href="/projects" className="back-link">
          ← Back to Projects
        </Link>
      </div>
      <style jsx>{`
        .project-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .project-header {
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #eaeaea;
        }
        .project-header h1 {
          margin: 0 0 1rem 0;
          font-size: 2.5rem;
        }
        .project-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 1rem;
          color: #666;
          font-size: 0.9rem;
        }
        .project-tags {
          display: flex;
          gap: 0.5rem;
        }
        .tag {
          background-color: #f1f3f4;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
        }
        .project-content {
          line-height: 1.6;
        }
        .project-content :global(h1),
        .project-content :global(h2),
        .project-content :global(h3) {
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .project-content :global(p) {
          margin-bottom: 1rem;
        }
        .project-content :global(pre) {
          background-color: #f5f5f5;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
        }
        .project-content :global(.katex-display) {
          margin: 1rem 0;
          overflow-x: auto;
          overflow-y: hidden;
        }
        .project-footer {
          margin-top: 3rem;
          padding-top: 1rem;
          border-top: 1px solid #eaeaea;
        }
        .back-link {
          color: #1a73e8;
          text-decoration: none;
        }
        .back-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    // Correct path - data is in _build/data
    const dataDir = path.join(process.cwd(), '../_build/data');
    const projectsIndexPath = path.join(dataDir, 'projects-index.json');
    
    if (!await fs.pathExists(projectsIndexPath)) {
      return {
        paths: [],
        fallback: true,
      };
    }

    const projectsIndex = await fs.readJson(projectsIndexPath);
// Generate paths for all projects with titles
    const paths = projectsIndex.items
      .filter((item: any) => item.frontmatter?.title)
      .map((item: any) => {
        // Use the project ID as the slug
        return {
          params: { slug: item.id },
        };
      });

    return {
      paths,
      fallback: true,
    };
  } catch (error) {
    console.error('Error generating paths for projects:', error);
    return {
      paths: [],
      fallback: true,
    };
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug;

  if (!slug || typeof slug !== 'string') {
    return { notFound: true };
  }

  try {
    // Correct path - data is in _build/data
    const dataDir = path.join(process.cwd(), '../_build/data');
    const projectsIndexPath = path.join(dataDir, 'projects-index.json');
    
    if (!await fs.pathExists(projectsIndexPath)) {
      return { notFound: true };
    }
    
    // Find the project by ID
    const projectsIndex = await fs.readJson(projectsIndexPath);
    const projectItem = projectsIndex.items.find((item: any) => item.id === slug && item.frontmatter?.title);
    
    if (!projectItem) {
      return { notFound: true };
    }

    return {
      props: { project: projectItem },
    };
  } catch (error) {
    console.error(`Error loading project ${slug}:`, error);
    return { notFound: true };
  }
};