import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs-extra';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { type } = req.query;
  
  if (!type || typeof type !== 'string') {
    return res.status(400).json({ error: 'Invalid content type' });
  }
  
  try {
    // Correct path - data is in _build/data
    const dataDir = path.join(process.cwd(), '../_build/data');
    
    // Fix: use plural form for the index file (post -> articles, snippet -> snippets, project -> projects)
    const pluralType = type === 'post' ? 'articles' : type === 'snippet' ? 'snippets' : type === 'project' ? 'projects' : type;
    const indexPath = path.join(dataDir, `${pluralType}-index.json`);
    
    console.log('Looking for:', indexPath);
    
    const exists = await fs.pathExists(indexPath);
    console.log('File exists:', exists);
    
    if (exists) {
      const index = await fs.readJson(indexPath);
      console.log('Found index with', index.items?.length || 0, 'items');
      
      // Transform the data structure to match what the frontend expects
      const transformedItems = index.items.map((item: any) => ({
        id: item.id || path.basename(item.frontmatter.title || '', '').replace(/\s+/g, '-').toLowerCase(),
        title: item.frontmatter.title || 'Untitled',
        date: item.frontmatter.date || new Date().toISOString().split('T')[0],
        author: item.frontmatter.author || '',
        tags: item.frontmatter.tags || [],
        content: item.content || [],
        type: type // Keep the singular type for frontend
      }));
      
      console.log('Returning', transformedItems.length, 'transformed items');
      res.status(200).json(transformedItems);
    } else {
      console.log('File not found, listing directory contents');
      const dirContents = await fs.pathExists(dataDir) ? await fs.readdir(dataDir) : 'Directory not found';
      console.log('Directory contents:', dirContents);
      res.status(404).json({ error: 'Content not found', path: indexPath, dirContents });
    }
  } catch (error: any) {
    console.error(`Error loading ${type} content:`, error);
    res.status(500).json({ 
      error: `Failed to load ${type} content`, 
      message: error.message || 'Unknown error' 
    });
  }
}