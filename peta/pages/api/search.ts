import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs-extra';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { q } = req.query;
  
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Search query is required' });
  }
  
  try {
    const dataDir = path.join(process.cwd(), '../_build/data');
    const results = await searchWithoutIndex(q, dataDir);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: 'Search failed' });
  }
}

async function searchWithoutIndex(query: string, dataDir: string) {
  const results: any[] = [];
  const lowerQuery = query.toLowerCase();
  
  // Search in articles
  const articlesIndexPath = path.join(dataDir, 'articles-index.json');
  if (await fs.pathExists(articlesIndexPath)) {
    const articlesIndex = await fs.readJson(articlesIndexPath);
    articlesIndex.items.forEach((item: any) => {
      // Extract text content from content array
      const contentText = item.content
        .filter((c: any) => c.type === 'text' && c.content)
        .map((c: any) => c.content)
        .join(' ');
      
      if (
        item.title.toLowerCase().includes(lowerQuery) ||
        contentText.toLowerCase().includes(lowerQuery) ||
        item.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
      ) {
        results.push({
          id: item.id,
          title: item.title,
          type: 'article',
          tags: item.tags,
          date: item.date
        });
      }
    });
  }
  
  // Search in snippets
  const snippetsIndexPath = path.join(dataDir, 'snippets-index.json');
  if (await fs.pathExists(snippetsIndexPath)) {
    const snippetsIndex = await fs.readJson(snippetsIndexPath);
    snippetsIndex.items.forEach((item: any) => {
      // Extract text content from content array
      const contentText = item.content
        .filter((c: any) => c.type === 'text' && c.content)
        .map((c: any) => c.content)
        .join(' ');
      
      if (
        item.title.toLowerCase().includes(lowerQuery) ||
        contentText.toLowerCase().includes(lowerQuery) ||
        item.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
      ) {
        results.push({
          id: item.id,
          title: item.title,
          type: 'snippet',
          tags: item.tags,
          date: item.date
        });
      }
    });
  }
  
  // Search in projects
  const projectsIndexPath = path.join(dataDir, 'projects-index.json');
  if (await fs.pathExists(projectsIndexPath)) {
    const projectsIndex = await fs.readJson(projectsIndexPath);
    projectsIndex.items.forEach((item: any) => {
      // Extract text content from content array
      const contentText = item.content
        .filter((c: any) => c.type === 'text' && c.content)
        .map((c: any) => c.content)
        .join(' ');
      
      if (
        item.title.toLowerCase().includes(lowerQuery) ||
        contentText.toLowerCase().includes(lowerQuery) ||
        item.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
      ) {
        results.push({
          id: item.id,
          title: item.title,
          type: 'project',
          tags: item.tags,
          date: item.date
        });
      }
    });
  }
  
  // Search in books
  const booksIndexPath = path.join(dataDir, 'books-index.json');
  if (await fs.pathExists(booksIndexPath)) {
    const booksIndex = await fs.readJson(booksIndexPath);
    booksIndex.items.forEach((item: any) => {
      // Extract text content from content array
      const contentText = item.content
        .filter((c: any) => c.type === 'text' && c.content)
        .map((c: any) => c.content)
        .join(' ');
      
      // Also search in sections
      const sectionsText = item.sections
        ? item.sections.map((section: any) => 
            section.content
              .filter((c: any) => c.type === 'text' && c.content)
              .map((c: any) => c.content)
              .join(' ')
          ).join(' ')
        : '';
      
      const allContent = contentText + ' ' + sectionsText;
      
      if (
        item.title.toLowerCase().includes(lowerQuery) ||
        allContent.toLowerCase().includes(lowerQuery) ||
        item.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
      ) {
        results.push({
          id: item.id,
          title: item.title,
          type: 'book',
          tags: item.tags,
          date: item.date,
          author: item.author
        });
      }
    });
  }
  
  return results;
}