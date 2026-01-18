import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs-extra';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const currentDir = process.cwd();
    const dataDir = path.join(currentDir, '../_build/data');
    const indexPath = path.join(dataDir, 'posts-index.json');
    
    const response = {
      currentDir,
      dataDir,
      indexPath,
      exists: await fs.pathExists(indexPath),
      dirContents: await fs.pathExists(dataDir) ? await fs.readdir(dataDir) : 'Directory not found'
    };
    
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}