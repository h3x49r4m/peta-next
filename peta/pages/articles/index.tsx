import { useState, useEffect } from 'react';
import TagFilter from '../../components/TagFilter';
import ContentList from '../../components/ContentList';
import TableOfContents from '../../components/TableOfContents';
import styles from '../../styles/Articles.module.css';
import MathRenderer from '../../components/MathRenderer';
import CodeBlock from '../../components/CodeBlock';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface ArticlePost {
  id: string;
  title: string;
  date: string;
  author: string;
  excerpt?: string;
  tags: string[];
  content: any[];
  snippet_refs?: string[];
}

export default function Articles() {
  const [posts, setPosts] = useState<ArticlePost[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<ArticlePost | null>(null);
  const [loading, setLoading] = useState(true);
  const [renderedContent, setRenderedContent] = useState<string>('');
  const [showTOC, setShowTOC] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadArticlesContent();
  }, []);

  useEffect(() => {
    // Reset selected post when the route changes (e.g., when clicking the Articles link)
    const handleRouteChange = (url: string) => {
      // If navigating to /articles without query params, clear selections
      if (url === '/articles' || url === '/articles?') {
        setSelectedPost(null);
        setSelectedTag('');
        setShowTOC(false);
      }
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  // Also check on mount
  useEffect(() => {
    // If URL is just /articles without query params, clear selections
    if (router.asPath === '/articles' || router.asPath === '/articles?') {
      setSelectedPost(null);
      setSelectedTag('');
      setShowTOC(false);
    }
  }, [router.asPath]);

  useEffect(() => {
    // When a tag is selected, clear the selected post to show the filtered list
    if (selectedTag) {
      setSelectedPost(null);
      setShowTOC(false);
      // Update URL to include tag
      const url = `/articles?tag=${encodeURIComponent(selectedTag)}`;
      window.history.pushState({}, '', url);
    }
  }, [selectedTag]);

  // Handle scroll to show/hide back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadArticlesContent = async () => {
    try {
      console.log('Loading articles content...');
      
      const [postsResponse, tagsResponse] = await Promise.all([
        fetch('/api/content/post'),
        fetch('/api/tags?type=post')
      ]);
      
      console.log('Posts response status:', postsResponse.status);
      console.log('Tags response status:', tagsResponse.status);
      
      const postsData = await postsResponse.json();
      const tagsData = await tagsResponse.json();
      
      console.log('Posts data:', postsData);
      console.log('Tags data:', tagsData);
      
      // Sort posts by date (newest first)
      const sortedPosts = Array.isArray(postsData) 
        ? postsData.sort((a: ArticlePost, b: ArticlePost) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB.getTime() - dateA.getTime(); // Newest first
          })
        : [];
      
      setPosts(sortedPosts);
      setTags(Array.isArray(tagsData) ? tagsData : []);
      
      // Check if there's a post parameter in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const postSlug = urlParams.get('post');
      if (postSlug && sortedPosts.length > 0) {
        // Find the post by ID or slug (title converted to slug)
        const post = sortedPosts.find(p => {
          // First try to match by ID
          if (p.id === postSlug) return true;
          // Then try to match by title slug
          const titleSlug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return titleSlug === postSlug;
        });
        
        if (post) {
          console.log('Found post from URL parameter:', post);
          setSelectedPost(post);
          setTimeout(() => setShowTOC(true), 500);
        }
      }
      
      // Also check for tag parameter
      const tagParam = urlParams.get('tag');
      if (tagParam) {
        setSelectedTag(tagParam);
      }
    } catch (error) {
      console.error('Error loading articles content:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = Array.isArray(posts)
    ? selectedTag
      ? posts.filter(post => Array.isArray(post.tags) && post.tags.includes(selectedTag))
      : posts
    : [];

  const handlePostClick = (post: ArticlePost | any) => {
    setSelectedPost(post);
    setShowTOC(false); // Reset TOC visibility
    // Update the URL without navigating
    const url = `/articles?post=${post.id}`;
    window.history.pushState({}, '', url);
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedPost(null);
    setSelectedTag(''); // Clear selected tag when clicking title
    setShowTOC(false); // Reset TOC visibility
    // Update the URL to just /articles
    window.history.pushState({}, '', '/articles');
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag);
    setSelectedPost(null); // Clear selected post when selecting a tag
    setShowTOC(false); // Reset TOC visibility
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const parseNestedList = (lines: string[], startIndex: number): { html: string; nextIndex: number } => {
  const items: string[] = [];
  let i = startIndex;
  let currentIndent = -1;
  
  while (i < lines.length && lines[i].trim().match(/^(\d+\.|\*|\-)\s/)) {
    const line = lines[i];
    const indent = line.search(/\S/);
    const isNumbered = line.trim().match(/^\d+\./);
    
    // Initialize current indent on first item
    if (currentIndent === -1) {
      currentIndent = indent;
    }
    
    // Extract the item text
    const itemText = line.replace(/^(\s*(\d+\.|\*|\-)\s+)/, '').trim();
    
    // Check if this is a nested item (more indented than current level)
    if (indent > currentIndent) {
      // This is a nested list - recursively parse it
      const nestedResult = parseNestedList(lines, i);
      // Add the nested list to the last item
      const lastItem = items[items.length - 1];
      // Determine the nested list type from the first nested line
      const nestedLine = lines[i];
      const nestedIsNumbered = nestedLine.trim().match(/^\d+\./);
      const nestedTag = nestedIsNumbered ? 'ol' : 'ul';
      items[items.length - 1] = lastItem.replace(`</li>`, `<${nestedTag}>${nestedResult.html}</${nestedTag}></li>`);
      i = nestedResult.nextIndex;
      continue;
    } else if (indent < currentIndent) {
      // End of this list level
      break;
    }
    
    // Regular list item
    items.push(`<li>${itemText}</li>`);
    i++;
  }
  
  return {
    html: items.join(''),
    nextIndex: i
  };
};

const parseRST = (text: string, articleTitle: string, snippetId?: string): string => {
    // Convert RST to HTML while preserving math formulas
    const lines = text.split('\n');
    const output: string[] = [];
    let i = 0;
    let isFirstHeading = true;
    let headingCounter = 0; // Add counter for heading IDs
    
    console.log('parseRST input:', text);
    
    while (i < lines.length) {
      const line = lines[i];
      const nextLine = lines[i + 1];
      
      // Handle headers with underlines - this is the main RST heading format
      if (nextLine && (nextLine.startsWith('=') || nextLine.startsWith('-') || nextLine.startsWith('~')) && 
          nextLine.trim().length > 0) {
        // Check if it's a valid underline (all same character)
        const underlineChar = nextLine.trim()[0];
        if (nextLine.trim() === underlineChar.repeat(nextLine.trim().length)) {
          // Determine header level based on underline character
          let headerLevel = 2; // default for =
          if (underlineChar === '-') headerLevel = 3;
          else if (underlineChar === '~') headerLevel = 4;
          
          const headingText = line.trim();
          
          // Skip the first heading if it matches the article title
          if (isFirstHeading && headingText === articleTitle) {
            console.log(`Skipping duplicate heading: ${headingText}`);
            isFirstHeading = false;
            i += 2; // Skip the underline
            continue;
          }
          
          isFirstHeading = false;
          // Convert heading text to slug format for meaningful IDs
          const headingSlug = headingText.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-'); // Replace spaces with hyphens
          const headingId = snippetId ? `${snippetId}-${headingSlug}` : `heading-${headingSlug}`;
          output.push(`<h${headerLevel} id="${headingId}">${headingText}</h${headerLevel}>`);
          i += 2; // Skip the underline
          continue;
        }
      }
      
      // Handle lists - preserve indentation and create proper nested structures!
      if (line.trim().match(/^(\d+\.|\*|\-)\s/)) {
        const isNumbered = line.trim().match(/^\d+\./);
        const tag = isNumbered ? 'ol' : 'ul';
        
        // Parse the entire list with nested structure
        const listResult = parseNestedList(lines, i);
        output.push(`<${tag}>${listResult.html}</${tag}>`);
        i = listResult.nextIndex;
        continue;
      }
      
      // Handle regular paragraphs
      if (line.trim()) {
        let processedLine = line.trim();
        
        // Process the entire line to fix math formulas
        processedLine = processedLine
          // Fix broken display math formulas first
          .replace(/\$\$([^$]*(?:\$\$[^$]*\$\$)*[^$]*)\$\$/g, (match) => {
            // Remove extra $$ and fix the formula
            let formula = match.replace(/\$\$/g, '');
            // Fix common LaTeX syntax issues
            formula = formula
              .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '\\frac{$1}{$2}')
              .replace(/\^([^\s\}]+)/g, '^{$1}')
              .replace(/_\{([^}]*)\}/g, '_{$1}')
              .replace(/\{([^\}]+)\}/g, '{$1}');
            return `$$${formula}$$`;
          })
          // Fix inline math formulas
          .replace(/\$([^$\n]*(?:\$\$[^$\n]*\$\$)*[^$\n]*)\$/g, (match) => {
            // This is likely a broken formula, skip it if it contains display math
            if (match.includes('int_') || match.includes('sum_') || match.includes('lim_')) {
              return match; // Keep as is, will be handled by display math
            }
            return match;
          })
          // Process RST formatting
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
          .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
          .replace(/`(.*?)`/g, '<code>$1</code>'); // Inline code
        
        output.push(`<p>${processedLine}</p>`);
      }
      
      i++;
    }
    
    // Post-process to combine broken math formulas and apply RST formatting
    let result = output.join('\n');
    
    // Fix broken display math with missing closing
    result = result.replace(/\$\$([^$]*\$\$[^$]*\$\$)/g, (match) => {
      const formula = match.replace(/\$\$/g, '');
      return `$$${formula}$$`;
    });
    
    // Apply RST formatting to the entire result
    result = result
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
      .replace(/`(.*?)`/g, '<code>$1</code>'); // Inline code
    
    console.log('parseRST output:', result);
    
    return result;
  };

  const ContentRenderer = ({ content, articleTitle }: { content: any[], articleTitle: string }) => {
    const elements: JSX.Element[] = [];
    
    for (let i = 0; i < content.length; i++) {
      const item = content[i];
      
      if (item.type === 'text') {
        const htmlContent = parseRST(item.content, articleTitle);
        elements.push(
          <MathRenderer key={i} content={htmlContent} />
        );
      } else if (item.type === 'code-block') {
        elements.push(
          <CodeBlock 
            key={i}
            code={item.content}
            language={item.language || 'text'}
          />
        );
      } else if (item.type === 'embedded-snippet') {
        // Render the embedded snippet directly
        const snippetTitle = item.title || item.id;
        const formattedTitle = snippetTitle.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        
        const snippetId = item.id || `snippet-${i}`;
        elements.push(
          <div key={i} className={styles.snippetCard} id={snippetId}>
            <div className={styles.snippetHeader}>
              <h3>{formattedTitle}</h3>
              <span className={styles.snippetType}>Snippet</span>
            </div>
            <div className={styles.snippetContent}>
              {item.content && Array.isArray(item.content) ? 
                item.content.map((c: any, idx: number) => {
                  if (c.type === 'text') {
                    const htmlContent = parseRST(c.content, articleTitle, snippetId);
                    return <MathRenderer key={idx} content={htmlContent} />;
                  }
                  return null;
                }) : 
                <em>No content available</em>
              }
            </div>
          </div>
        );
      } else if (item.type === 'snippet-card-ref') {
        // Fallback for old format - Add a placeholder for the snippet with a proper title
        const snippetId = item.content;
        const snippetTitle = snippetId.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        
        elements.push(
          <div key={i} className={styles.snippetCard} id={`snippet-${snippetId}`}>
            <div className={styles.snippetHeader}>
              <h3>Snippet: {snippetTitle}</h3>
              <span className={styles.snippetType}>Snippet</span>
            </div>
            <div className={styles.snippetContent}>
              <em>Loading {snippetId}...</em>
            </div>
          </div>
        );
        
        // Load snippet content asynchronously
        (async () => {
          try {
            const response = await fetch('/api/content/snippet');
            const snippets = await response.json();
            
            // Try multiple ways to find the snippet
            let snippet = snippets.find((s: any) => {
              // Check by id
              if (s.id === snippetId) return true;
              
              // Check by snippet_id
              if (s.frontmatter?.snippet_id === snippetId) return true;
              
              // Check by title (exact match)
              if (s.frontmatter?.title === snippetId) return true;
              if (s.title === snippetId) return true;
              
              // Check by slugified title
              const snippetSlug = (s.frontmatter?.title || s.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
              if (snippetSlug === snippetId) return true;
              
              // Check partial match (for cases like "wave-function" matching "The Wave Function")
              const snippetTitle = (s.frontmatter?.title || s.title || '').toLowerCase();
              const searchTerm = snippetId.toLowerCase().replace(/-/g, ' ');
              if (snippetTitle.includes(searchTerm) || searchTerm.includes(snippetTitle)) return true;
              
              return false;
            });
            
            if (snippet) {
              const placeholder = document.getElementById(`snippet-${snippetId}`);
              if (placeholder) {
                placeholder.innerHTML = `
                  <div class="${styles.snippetHeader}">
                    <h3>${snippet.frontmatter?.title || snippet.title}</h3>
                    <span class="${styles.snippetType}">Snippet</span>
                  </div>
                  <div class="${styles.snippetContent}">
                    ${snippet.content?.map((c: any) => {
                      if (c.type === 'text') {
                        return parseRST(c.content, articleTitle, `snippet-${snippetId}`);
                      }
                      return '';
                    }).join('') || ''}
                  </div>
                `;
              }
            } else {
              const placeholder = document.getElementById(`snippet-${snippetId}`);
              if (placeholder) {
                placeholder.innerHTML = `
                  <div class="${styles.snippetHeader}">
                    <h3>Snippet not found</h3>
                    <span class="${styles.snippetType}">Error</span>
                  </div>
                  <div class="${styles.snippetContent}">
                    <em>Snippet not found: ${snippetId}</em>
                  </div>
                `;
              }
            }
          } catch (error) {
            console.error('Error loading snippet:', error);
            const placeholder = document.getElementById(`snippet-${snippetId}`);
            if (placeholder) {
              placeholder.innerHTML = `
                <div class="${styles.snippetHeader}">
                  <h3>Error loading snippet</h3>
                  <span class="${styles.snippetType}">Error</span>
                </div>
                <div class="${styles.snippetContent}">
                  <em>Error loading snippet: ${snippetId}</em>
                </div>
              `;
            }
          }
        })();
      } else {
        // Handle other content types
        elements.push(
          <div key={i} className={styles.unknownContent}>
            <p>Unknown content type: {item.type}</p>
            <pre>{JSON.stringify(item, null, 2)}</pre>
          </div>
        );
      }
    }
    
    return <>{elements}</>;
  };

  useEffect(() => {
    if (selectedPost) {
      // Show TOC immediately after post is selected
      setShowTOC(true);
    }
  }, [selectedPost]);

  

  console.log('Filtered posts:', filteredPosts);

  return (
    <div className={styles.pageContainer}>
      {/* Section 1: Header with title and tags */}
      <header className={styles.pageHeader}>
        <div className={styles.headerSection}>
          <Link href="/articles" onClick={handleTitleClick} className={styles.titleLink}>
            <h1 className={styles.title}>Articles</h1>
          </Link>
          <div className={styles.tagsSection}>
            <TagFilter
              tags={tags}
              selectedTag={selectedTag}
              onTagSelect={handleTagSelect}
            />
          </div>
        </div>
      </header>
      
      {/* Section 2: Content with TOC and main content */}
      <div className={styles.contentSection}>
        {loading ? (
          <div className={styles.loading}>
            <p>Loading posts...</p>
          </div>
        ) : selectedPost ? (
          <>
            <aside className={styles.tocAside}>
              {showTOC && selectedPost && (
                <TableOfContents 
                  content={selectedPost.content} 
                  postTitle={selectedPost.title}
                />
              )}
            </aside>
            
            <main className={styles.mainContent}>
              <article className={styles.article}>
                <header className={styles.articleHeader}>
                  <h1 className={styles.articleTitle}>{selectedPost.title}</h1>
                  <div className={styles.articleMeta}>
                    <time className={styles.articleDate} dateTime={selectedPost.date}>
                      {new Date(selectedPost.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                    {selectedPost.author && (
                      <span className={styles.articleAuthor}>
                        by {selectedPost.author}
                      </span>
                    )}
                  </div>
                  {selectedPost.tags && selectedPost.tags.length > 0 && (
                    <div className={styles.articleTags}>
                      {selectedPost.tags.map((tag) => (
                        <span key={tag} className={styles.articleTag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </header>
                
                <div className={styles.articleContent}>
                  <ContentRenderer 
                    content={selectedPost.content} 
                    articleTitle={selectedPost.title} 
                  />
                </div>
              </article>
            </main>
          </>
        ) : (
          <main className={styles.mainContentFull}>
            {selectedTag && (
              <div className={styles.tagInfo}>
                <p>Showing posts tagged with <strong>{selectedTag}</strong></p>
              </div>
            )}
            <ContentList 
              items={filteredPosts} 
              type="post" 
              onItemClick={handlePostClick}
            />
          </main>
        )}
      </div>
      
      {/* Back to top button */}
      {showBackToTop && (
        <button 
          className={styles.backToTop}
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          ↑
        </button>
      )}
    </div>
  );
}