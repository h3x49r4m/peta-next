import fs from 'fs-extra';
import path from 'path';

export interface ContentItem {
  id: string;
  title: string;
  excerpt?: string;
  date: string;
  tags: string[];
  type: 'post' | 'snippet' | 'project';
}

// Load articles posts
export async function loadArticlesPosts(): Promise<ContentItem[]> {
  try {
    const dataDir = path.join(process.cwd(), '../_build/data');
    const articlesIndexPath = path.join(dataDir, 'articles-index.json');
    
    if (await fs.pathExists(articlesIndexPath)) {
      const articlesIndex = await fs.readJson(articlesIndexPath);
      return articlesIndex.items.map((item: any) => ({
        id: item.id || path.basename(item.frontmatter.title || '', '').replace(/\s+/g, '-').toLowerCase(),
        title: item.frontmatter.title || 'Untitled',
        date: item.frontmatter.date || new Date().toISOString().split('T')[0],
        tags: item.frontmatter.tags || [],
        type: 'post' as const
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading articles posts:', error);
    throw new Error('Failed to load articles posts');
  }
}

// Load snippets
export async function loadSnippets(): Promise<ContentItem[]> {
  try {
    const dataDir = path.join(process.cwd(), '../_build/data');
    const snippetsIndexPath = path.join(dataDir, 'snippets-index.json');
    
    if (await fs.pathExists(snippetsIndexPath)) {
      const snippetsIndex = await fs.readJson(snippetsIndexPath);
      return snippetsIndex.items.map((item: any) => ({
        id: item.id || path.basename(item.frontmatter.title || '', '').replace(/\s+/g, '-').toLowerCase(),
        title: item.frontmatter.title || 'Untitled',
        date: item.frontmatter.date || new Date().toISOString().split('T')[0],
        tags: item.frontmatter.tags || [],
        type: 'snippet' as const
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading snippets:', error);
    throw new Error('Failed to load snippets');
  }
}

// Load projects
export async function loadProjects(): Promise<ContentItem[]> {
  try {
    const dataDir = path.join(process.cwd(), '../_build/data');
    const projectsIndexPath = path.join(dataDir, 'projects-index.json');
    
    if (await fs.pathExists(projectsIndexPath)) {
      const projectsIndex = await fs.readJson(projectsIndexPath);
      return projectsIndex.items.map((item: any) => ({
        id: item.id || path.basename(item.frontmatter.title || '', '').replace(/\s+/g, '-').toLowerCase(),
        title: item.frontmatter.title || 'Untitled',
        date: item.frontmatter.date || new Date().toISOString().split('T')[0],
        tags: item.frontmatter.tags || [],
        type: 'project' as const
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading projects:', error);
    throw new Error('Failed to load projects');
  }
}