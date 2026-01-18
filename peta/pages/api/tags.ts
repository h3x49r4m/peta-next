import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs-extra';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { type } = req.query;
  
  try {
    // Correct path - data is in _build/data
    const dataDir = path.join(process.cwd(), '../_build/data');
    const tagsPath = path.join(dataDir, 'tags.json');
    
    if (await fs.pathExists(tagsPath)) {
      const tagsData = await fs.readJson(tagsPath);
      
      // If type is specified, filter tags by content type
      if (type && typeof type === 'string') {
        // Map type to index file name
        const indexFile = type === 'post' ? 'articles-index.json' : 
                         type === 'snippet' ? 'snippets-index.json' : 
                         type === 'project' ? 'projects-index.json' : 
                         `${type}s-index.json`;
        
        const indexPath = path.join(dataDir, indexFile);
        
        if (await fs.pathExists(indexPath)) {
          const indexData = await fs.readJson(indexPath);
          const allTags = new Set<string>();
          
          // Collect all tags from this content type
          indexData.items?.forEach((item: any) => {
            item.frontmatter?.tags?.forEach((tag: string) => {
              allTags.add(tag);
            });
          });
          
          // Count occurrences of each tag in this content type
          const tagCounts: {[key: string]: number} = {};
          indexData.items?.forEach((item: any) => {
            item.frontmatter?.tags?.forEach((tag: string) => {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
          });
          
          // Return tags with counts for this content type, sorted by count
          const filteredTags = Object.entries(tagCounts)
            .map(([name, count]) => ({
              name,
              count
            }))
            .sort((a, b) => b.count - a.count); // Sort by count descending
          
          res.status(200).json(filteredTags);
        } else {
          res.status(200).json([]);
        }
      } else {
        // Return all tags, sorted by count
        const sortedTags = Array.isArray(tagsData) 
          ? tagsData.sort((a: any, b: any) => (b.count || 0) - (a.count || 0))
          : tagsData;
        res.status(200).json(sortedTags);
      }
    } else {
      res.status(404).json({ error: 'Tags not found' });
    }
  } catch (error) {
    console.error('Error loading tags:', error);
    res.status(500).json({ error: 'Failed to load tags' });
  }
}