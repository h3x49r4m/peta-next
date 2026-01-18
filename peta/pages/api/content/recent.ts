import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs-extra';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Correct path - data is in _build/data
    const dataDir = path.join(process.cwd(), '../_build/data');
    const recentPath = path.join(dataDir, 'recent.json');
    
    if (await fs.pathExists(recentPath)) {
      const recent = await fs.readJson(recentPath);
      res.status(200).json(recent);
    } else {
      // Generate recent content on the fly
      const recent = await generateRecentContent(dataDir);
      await fs.writeJson(recentPath, recent, { spaces: 2 });
      res.status(200).json(recent);
    }
  } catch (error) {
    console.error('Error loading recent content:', error);
    res.status(500).json({ error: 'Failed to load recent content' });
  }
}

async function generateRecentContent(dataDir: string) {
  const recent = {
    posts: [],
    snippets: [],
    projects: []
  };
  
  // Get recent posts
  const articlesIndexPath = path.join(dataDir, 'articles-index.json');
  if (await fs.pathExists(articlesIndexPath)) {
    const articlesIndex = await fs.readJson(articlesIndexPath);
    recent.posts = articlesIndex.items
      .map((item: any) => ({
        id: path.basename(item.frontmatter.title || '', '').replace(/\s+/g, '-').toLowerCase() || item.id,
        title: item.frontmatter.title || 'Untitled',
        date: item.frontmatter.date || new Date().toISOString().split('T')[0],
        tags: item.frontmatter.tags || [],
        type: 'post'
      }))
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }
  
  // Get recent snippets
  const snippetsIndexPath = path.join(dataDir, 'snippets-index.json');
  if (await fs.pathExists(snippetsIndexPath)) {
    const snippetsIndex = await fs.readJson(snippetsIndexPath);
    recent.snippets = snippetsIndex.items
      .map((item: any) => ({
        id: path.basename(item.frontmatter.title || '', '').replace(/\s+/g, '-').toLowerCase() || item.id,
        title: item.frontmatter.title || 'Untitled',
        date: item.frontmatter.date || new Date().toISOString().split('T')[0],
        tags: item.frontmatter.tags || [],
        type: 'snippet'
      }))
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }
  
  // Get recent projects
  const projectsIndexPath = path.join(dataDir, 'projects-index.json');
  if (await fs.pathExists(projectsIndexPath)) {
    const projectsIndex = await fs.readJson(projectsIndexPath);
    recent.projects = projectsIndex.items
      .map((item: any) => ({
        id: path.basename(item.frontmatter.title || '', '').replace(/\s+/g, '-').toLowerCase() || item.id,
        title: item.frontmatter.title || 'Untitled',
        date: item.frontmatter.date || new Date().toISOString().split('T')[0],
        tags: item.frontmatter.tags || [],
        type: 'project'
      }))
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }
  
  return recent;
}