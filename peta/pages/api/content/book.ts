import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import { parseRstFallback } from '../../../processors/wasm-bindings/rst-parser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const contentDir = path.join(process.cwd(), '../_content/books');
    
    // Check if books directory exists
    if (!(await fs.pathExists(contentDir))) {
      return res.status(200).json([]);
    }
    
    const bookFolders = await fs.readdir(contentDir);
    const books = [];
    
    for (const folder of bookFolders) {
      const folderPath = path.join(contentDir, folder);
      const stat = await fs.stat(folderPath);
      
      if (stat.isDirectory()) {
        const indexPath = path.join(folderPath, 'index.rst');
        
        if (await fs.pathExists(indexPath)) {
          const content = await fs.readFile(indexPath, 'utf8');
          const parsed = await parseRstFallback(content);
          
          // Read section files
          const sectionFiles = await glob(`${folderPath}/*.rst`);
          const sections = [];
          
          // First, add index.rst as a section
          sections.push({
            id: 'index',
            title: parsed.frontmatter.title || 'Introduction',
            content: parsed.content
          });
          
          // Then add other section files
          for (const sectionFile of sectionFiles) {
            if (!sectionFile.endsWith('index.rst')) {
              const sectionContent = await fs.readFile(sectionFile, 'utf8');
              const sectionParsed = await parseRstFallback(sectionContent);
              const sectionName = path.basename(sectionFile, '.rst');
              sections.push({
                id: sectionName,
                title: sectionParsed.frontmatter.title || sectionName,
                content: sectionParsed.content
              });
            }
          }
          
          books.push({
            id: folder,
            title: parsed.frontmatter.title || 'Untitled',
            author: parsed.frontmatter.author || 'Unknown Author',
            description: parsed.frontmatter.description || '',
            date: parsed.frontmatter.date || new Date().toISOString().split('T')[0],
            tags: parsed.frontmatter.tags || [],
            coverImage: parsed.frontmatter.cover_image || null,
            content: parsed.content,
            sections
          });
        }
      }
    }
    
    res.status(200).json(books);
  } catch (error) {
    console.error('Error loading books:', error);
    res.status(500).json({ error: 'Failed to load books' });
  }
}