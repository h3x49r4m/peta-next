import { useState, useEffect } from 'react';
import TagFilter from '../../components/TagFilter';
import ContentList from '../../components/ContentList';
import TableOfContents from '../../components/TableOfContents';
import styles from '../../styles/Articles.module.css';
import MathRenderer from '../../components/MathRenderer';
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
        : postsData;
      
      setPosts(sortedPosts);
      setTags(tagsData);
    } catch (error) {
      console.error('Error loading articles content:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = selectedTag
    ? posts.filter(post => post.tags.includes(selectedTag))
    : posts;

  const handlePostClick = (post: ArticlePost) => {
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

  const parseRST = (text: string, articleTitle: string): string => {
    // Convert RST to HTML while preserving math formulas
    const lines = text.split('\n');
    const output: string[] = [];
    let i = 0;
    let isFirstHeading = true;
    
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
          output.push(`<h${headerLevel}>${headingText}</h${headerLevel}>`);
          i += 2; // Skip the underline
          continue;
        }
      }
      
      // Handle lists - preserve indentation!
      if (line.trim().match(/^(\d+\.|\*|\-)\s/)) {
        const isNumbered = line.trim().match(/^\d+\./);
        const tag = isNumbered ? 'ol' : 'ul';
        const items = [];
        
        // Collect all list items, preserving their original indentation
        while (i < lines.length && lines[i].trim().match(/^(\d+\.|\*|\-)\s/)) {
          const currentLine = lines[i];
          const indent = currentLine.search(/\S/); // Count leading spaces
          
          // Preserve the original line with indentation
          let itemText = currentLine.replace(/^(\s*(\d+\.|\*|\-)\s+)/, '').trim();
          
          // Check if this is a nested item (starts with spaces)
          const isNested = indent > 0;
          
          if (isNested) {
            // For nested items, create a sub-list
            items.push(`<li class="nested">${itemText}</li>`);
          } else {
            items.push(`<li>${itemText}</li>`);
          }
          
          i++;
        }
        
        output.push(`<${tag}>${items.join('')}</${tag}>`);
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
          });
        
        output.push(`<p>${processedLine}</p>`);
      }
      
      i++;
    }
    
    // Post-process to combine broken math formulas
    let result = output.join('\n');
    
    // Fix broken display math with missing closing
    result = result.replace(/\$\$([^$]*\$\$[^$]*\$\$)/g, (match) => {
      const formula = match.replace(/\$\$/g, '');
      return `$$${formula}$$`;
    });
    
    console.log('parseRST output:', result);
    
    return result;
  };

  const renderContent = async (content: any[], articleTitle: string) => {
    const elements: string[] = [];
    
    for (let i = 0; i < content.length; i++) {
      const item = content[i];
      
      if (item.type === 'text') {
        const htmlContent = parseRST(item.content, articleTitle);
        elements.push(htmlContent);
      } else if (item.type === 'snippet-card-ref') {
        // Add a placeholder for the snippet with a proper title
        const snippetId = item.content;
        const snippetTitle = snippetId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        elements.push(`<div class="${styles.snippetCard}" id="snippet-${snippetId}">
          <div class="${styles.snippetHeader}">
            <h3>Snippet: ${snippetTitle}</h3>
            <span class="${styles.snippetType}">Snippet</span>
          </div>
          <div class="${styles.snippetContent}">
            <em>Loading ${snippetId}...</em>
          </div>
        </div>`);
        
        // Load snippet content asynchronously
        try {
          const response = await fetch('/api/content/snippet');
          const snippets = await response.json();
          
          // Debug: Log all snippets for inspection
          console.log('Looking for snippet:', snippetId);
          console.log('Available snippets:', snippets.map(s => ({
            id: s.id || 'no-id',
            title: s.frontmatter?.title || s.title || 'no-title',
            snippet_id: s.frontmatter?.snippet_id || 'no-snippet_id'
          })));
          
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
            let snippetContent = `<div class="${styles.snippetCard}" id="snippet-${snippetId}">
              <div class="${styles.snippetHeader}">
                <h3>${snippet.frontmatter?.title || snippet.title}</h3>
                <span class="${styles.snippetType}">Snippet</span>
              </div>
              <div class="${styles.snippetContent}">`;
            
            snippet.content?.forEach((c: any) => {
              if (c.type === 'text') {
                snippetContent += parseRST(c.content, articleTitle);
              }
            });
            
            snippetContent += `</div></div>`;
            
            // Replace the placeholder with the actual snippet
            setTimeout(() => {
              const placeholder = document.getElementById(`snippet-${snippetId}`);
              if (placeholder) {
                placeholder.outerHTML = snippetContent;
              }
            }, 100);
          } else {
            // Replace placeholder with error message
            setTimeout(() => {
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
            }, 100);
          }
        } catch (error) {
          console.error('Error loading snippet:', error);
          // Replace placeholder with error message
          setTimeout(() => {
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
          }, 100);
        }
      }
    }
    
    return elements.join('\n');
  };

  useEffect(() => {
    if (selectedPost) {
      renderContent(selectedPost.content, selectedPost.title).then(htmlContent => {
        setRenderedContent(htmlContent);
        console.log('Content rendered, showing TOC');
        // Show TOC after content is set
        setTimeout(() => setShowTOC(true), 500);
      });
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
              {showTOC && renderedContent && (
                <TableOfContents 
                  content={renderedContent} 
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
                  <MathRenderer content={renderedContent} />
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