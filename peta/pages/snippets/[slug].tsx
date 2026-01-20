import { GetStaticPaths, GetStaticProps } from 'next';
import fs from 'fs-extra';
import path from 'path';
import { useRouter } from 'next/router';
import Link from 'next/link';
import MathRenderer from '../../components/MathRenderer';
import CodeBlock from '../../components/CodeBlock';

interface SnippetProps {
  snippet: any;
}

export default function Snippet({ snippet }: SnippetProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  if (!snippet || !snippet.title) {
    return <div>Snippet not found</div>;
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
    return content.map((item, index) => {
      if (item.type === 'text') {
        // Convert RST-style text to HTML, preserving math formulas
        const htmlContent = item.content
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
          .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
          .replace(/`(.*?)`/g, '<code>$1</code>') // Inline code
          .replace(/\n\n/g, '</p><p>') // Paragraph breaks
          .replace(/\n/g, '<br />'); // Line breaks
        
        return (
          <MathRenderer 
            key={index} 
            content={`<p>${htmlContent}</p>`}
          />
        );
      } else if (item.type === 'code-block') {
        return (
          <CodeBlock 
            key={index}
            code={item.content}
            language={item.language || 'text'}
          />
        );
      }
      return null;
    });
  };

  return (
    <div className="snippet-page">
      <div className="snippet-header">
        <h1>{snippet.frontmatter.title}</h1>
        <div className="snippet-meta">
          <span className="snippet-date">{formatDate(snippet.frontmatter.date)}</span>
          {snippet.frontmatter.author && (
            <span className="snippet-author"> by {snippet.frontmatter.author}</span>
          )}
          <div className="snippet-tags">
            {snippet.frontmatter.tags?.map((tag: string) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="snippet-content">
        {renderContent(snippet.content)}
      </div>
      <div className="snippet-footer">
        <Link href="/snippets" className="back-link">
          ← Back to Snippets
        </Link>
      </div>
      <style jsx>{`
        .snippet-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .snippet-header {
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #eaeaea;
        }
        .snippet-header h1 {
          margin: 0 0 1rem 0;
          font-size: 2.5rem;
        }
        .snippet-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 1rem;
          color: #666;
          font-size: 0.9rem;
        }
        .snippet-tags {
          display: flex;
          gap: 0.5rem;
        }
        .tag {
          background-color: #f1f3f4;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
        }
        .snippet-content {
          line-height: 1.6;
        }
        .snippet-content :global(h1),
        .snippet-content :global(h2),
        .snippet-content :global(h3) {
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .snippet-content :global(p) {
          margin-bottom: 1rem;
        }
        .snippet-content :global(pre) {
          background-color: #f5f5f5;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
        }
        .snippet-content :global(.katex-display) {
          margin: 1rem 0;
          overflow-x: auto;
          overflow-y: hidden;
        }
        .snippet-footer {
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
    const snippetsIndexPath = path.join(dataDir, 'snippets-index.json');
    
    if (!await fs.pathExists(snippetsIndexPath)) {
      return {
        paths: [],
        fallback: true,
      };
    }

    const snippetsIndex = await fs.readJson(snippetsIndexPath);
    const paths = snippetsIndex.items
      .filter((item: any) => item.frontmatter?.title) // Only include items with titles
      .map((item: any) => {
        // Generate slug from title
        const title = item.frontmatter?.title;
        const slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        
        return {
          params: { slug },
        };
      });

    return {
      paths,
      fallback: true,
    };
  } catch (error) {
    console.error('Error generating paths for snippets:', error);
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
    const snippetsIndexPath = path.join(dataDir, 'snippets-index.json');
    
    if (!await fs.pathExists(snippetsIndexPath)) {
      return { notFound: true };
    }
    
    // Find the snippet by matching slug with title
    const snippetsIndex = await fs.readJson(snippetsIndexPath);
    const snippetItem = snippetsIndex.items.find((item: any) => {
      if (!item.frontmatter?.title) return false;
      const title = item.frontmatter.title;
      const itemSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      return itemSlug === slug;
    });
    
    if (!snippetItem) {
      return { notFound: true };
    }

    return {
      props: { snippet: snippetItem },
    };
  } catch (error) {
    console.error(`Error loading snippet ${slug}:`, error);
    return { notFound: true };
  }
};