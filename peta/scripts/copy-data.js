const fs = require('fs-extra');
const path = require('path');

async function copyData() {
  const sourceDir = path.join(__dirname, '../_build/data');
  const targetDir = path.join(__dirname, '../out/data');
  
  try {
    if (await fs.pathExists(sourceDir)) {
      await fs.copy(sourceDir, targetDir);
      console.log('Data directory already exists with content');
    } else {
      console.log('Source data directory not found, creating it...');
      await fs.ensureDir(targetDir);
    }
  } catch (error) {
    console.error('Error copying data:', error);
  }
}

copyData();