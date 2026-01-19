import { GetStaticPaths, GetStaticProps } from 'next';
import fs from 'fs-extra';
import path from 'path';
import { useRouter } from 'next/router';
import Link from 'next/link';
import MathRenderer from '../../components/MathRenderer';
import { useEffect } from 'react';

interface PostProps {
  post: any;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to /articles page with post parameter
    if (!router.isFallback && post) {
      const title = post.frontmatter?.title || 'untitled';
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      router.replace(`/articles?post=${slug}`);
    }
  }, [router.isFallback, post, router]);

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return <div>Post not found</div>;
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
      } else if (item.type === 'embedded-snippet') {
        // Render snippet with proper formatting
        return (
          <div key={index} className="embedded-snippet">
            <h3>{item.title}</h3>
            {renderContent(item.content)}
            <style jsx>{`
              .embedded-snippet {
                background-color: #f8f9fa;
                border-left: 4px solid #1a73e8;
                padding: 1rem 1.5rem;
                margin: 1.5rem 0;
                border-radius: 4px;
              }
              .embedded-snippet h3 {
                margin-top: 0;
                margin-bottom: 1rem;
                color: #1a73e8;
                font-size: 1.2rem;
              }
            `}</style>
          </div>
        );
      }
      return null;
    });
  };

  return (
    <div className="post-page">
      <div className="post-header">
        <h1>{post.frontmatter.title}</h1>
        <div className="post-meta">
          <span className="post-date">{formatDate(post.frontmatter.date)}</span>
          {post.frontmatter.author && (
            <span className="post-author"> by {post.frontmatter.author}</span>
          )}
          <div className="post-tags">
            {post.frontmatter.tags?.map((tag: string) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="post-content">
        {renderContent(post.content)}
      </div>
      <div className="post-footer">
        <Link href="/articles" className="back-link">
          ← Back to Articles
        </Link>
      </div>
      <style jsx>{`
        .post-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .post-header {
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #eaeaea;
        }
        .post-header h1 {
          margin: 0 0 1rem 0;
          font-size: 2.5rem;
        }
        .post-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 1rem;
          color: #666;
          font-size: 0.9rem;
        }
        .post-tags {
          display: flex;
          gap: 0.5rem;
        }
        .tag {
          background-color: #f1f3f4;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
        }
        .post-content {
          line-height: 1.6;
        }
        .post-content :global(h1),
        .post-content :global(h2),
        .post-content :global(h3) {
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .post-content :global(p) {
          margin-bottom: 1rem;
        }
        .post-content :global(pre) {
          background-color: #f5f5f5;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
        }
        .post-content :global(.katex-display) {
          margin: 1rem 0;
          overflow-x: auto;
          overflow-y: hidden;
        }
        .post-footer {
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
    const articlesIndexPath = path.join(dataDir, 'articles-index.json');
    
    if (!await fs.pathExists(articlesIndexPath)) {
      return {
        paths: [],
        fallback: true,
      };
    }

    const articlesIndex = await fs.readJson(articlesIndexPath);
    const paths = articlesIndex.items.map((item: any) => {
      // Generate slug from title
      const title = item.frontmatter?.title || 'untitled';
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
    console.error('Error generating paths for posts:', error);
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
    const articlesIndexPath = path.join(dataDir, 'articles-index.json');
    
    if (!await fs.pathExists(articlesIndexPath)) {
      return { notFound: true };
    }
    
    // Find the post by matching slug with title
    const articlesIndex = await fs.readJson(articlesIndexPath);
    const postItem = articlesIndex.items.find((item: any) => {
      const title = item.frontmatter?.title || 'untitled';
      const itemSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      return itemSlug === slug;
    });
    
    if (!postItem) {
      return { notFound: true };
    }

    return {
      props: { post: postItem },
    };
  } catch (error) {
    console.error(`Error loading post ${slug}:`, error);
    return { notFound: true };
  }
};