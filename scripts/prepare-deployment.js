#! /usr/bin/env node

/**
 * Deployment Preparation Script
 * 
 * This script prepares the deployment package for GitHub Pages by copying
 * all necessary files to the _site directory. It mirrors the deployment
 * process defined in .github/workflows/deploy.yml.
 * 
 * Usage: node scripts/prepare-deployment.js
 * Or via npm: npm run deploy
 */

const fs = require('fs');
const path = require('path');

// Helper function to copy files recursively
function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  
  if (stats.isDirectory()) {
    // Create directory if it doesn't exist
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    // Copy directory contents
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    // Copy file
    fs.copyFileSync(src, dest);
  }
}

// Helper function to copy file with error handling
function copyFile(src, dest, optional = false) {
  try {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`✓ Copied: ${src}`);
      return true;
    } else if (!optional) {
      console.warn(`⚠ Warning: File not found: ${src}`);
      return false;
    }
    return true;
  } catch (error) {
    if (!optional) {
      console.error(`✗ Error copying ${src}: ${error.message}`);
    }
    return false;
  }
}

// Helper function to copy directory with error handling
function copyDirectory(src, dest, optional = false) {
  try {
    if (fs.existsSync(src)) {
      copyRecursive(src, dest);
      console.log(`✓ Copied directory: ${src}`);
      return true;
    } else if (!optional) {
      console.warn(`⚠ Warning: Directory not found: ${src}`);
      return false;
    }
    return true;
  } catch (error) {
    if (!optional) {
      console.error(`✗ Error copying ${src}: ${error.message}`);
    }
    return false;
  }
}

// Helper function to calculate directory size
function getDirSize(dirPath) {
  try {
    let size = 0;
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      try {
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          size += getDirSize(filePath);
        } else {
          size += stats.size;
        }
      } catch (error) {
        console.warn(`⚠ Warning: Could not stat file ${filePath}: ${error.message}`);
      }
    }
    return size;
  } catch (error) {
    console.error(`✗ Error reading directory ${dirPath}: ${error.message}`);
    return 0;
  }
}

function prepareDeployment() {
  console.log('🚀 Preparing deployment package...\n');
  
  const rootDir = process.cwd();
  const siteDir = path.join(rootDir, '_site');
  
  // Create _site directory
  if (fs.existsSync(siteDir)) {
    console.log('Cleaning existing _site directory...');
    fs.rmSync(siteDir, { recursive: true, force: true });
  }
  fs.mkdirSync(siteDir, { recursive: true });
  
  console.log('\n📄 Copying HTML files...');
  copyFile('index.html', path.join(siteDir, 'index.html'));
  copyFile('editor.html', path.join(siteDir, 'editor.html'));
  copyFile('BeyondGlobal.html', path.join(siteDir, 'BeyondGlobal.html'));
  
  console.log('\n🎨 Copying assets...');
  copyFile('BeyondGlobal.svg', path.join(siteDir, 'BeyondGlobal.svg'));
  copyFile('styles.css', path.join(siteDir, 'styles.css'));
  
  // Create dist directory and copy CSS
  fs.mkdirSync(path.join(siteDir, 'dist'), { recursive: true });
  copyFile('dist/output.css', path.join(siteDir, 'dist', 'output.css'));
  
  console.log('\n⚙️  Copying configuration files...');
  copyFile('CNAME', path.join(siteDir, 'CNAME'));
  copyFile('feature-flags.json', path.join(siteDir, 'feature-flags.json'));
  copyFile('mint.json', path.join(siteDir, 'mint.json'));
  
  console.log('\n💻 Copying source code...');
  copyDirectory('src', path.join(siteDir, 'src'));
  copyDirectory('contracts', path.join(siteDir, 'contracts'));
  
  console.log('\n📚 Copying documentation directories...');
  copyDirectory('api-reference', path.join(siteDir, 'api-reference'));
  copyDirectory('guides', path.join(siteDir, 'guides'));
  copyDirectory('docs', path.join(siteDir, 'docs'));
  copyDirectory('wiki', path.join(siteDir, 'wiki'));
  
  // Copy EIPs directory if exists
  copyDirectory('EIPsInsight', path.join(siteDir, 'EIPsInsight'), true);
  
  console.log('\n📖 Copying main documentation files...');
  copyFile('README.md', path.join(siteDir, 'README.md'));
  copyFile('CHATOPS.md', path.join(siteDir, 'CHATOPS.md'));
  copyFile('DEPLOYMENT.md', path.join(siteDir, 'DEPLOYMENT.md'));
  copyFile('DEPLOYMENT-CHECKLIST.md', path.join(siteDir, 'DEPLOYMENT-CHECKLIST.md'));
  copyFile('ETH_COMPONENT_OWNERSHIP.md', path.join(siteDir, 'ETH_COMPONENT_OWNERSHIP.md'));
  copyFile('OCTANT-V2-CORE.md', path.join(siteDir, 'OCTANT-V2-CORE.md'));
  
  console.log('\n📄 Copying additional documentation files...');
  copyFile('BUILD.md', path.join(siteDir, 'BUILD.md'), true);
  copyFile('SECURITY-GUIDE.md', path.join(siteDir, 'SECURITY-GUIDE.md'), true);
  copyFile('SECURITY-AUDIT-SUMMARY.md', path.join(siteDir, 'SECURITY-AUDIT-SUMMARY.md'), true);
  copyFile('PUBLISHING.md', path.join(siteDir, 'PUBLISHING.md'), true);
  copyFile('MINTLIFY.md', path.join(siteDir, 'MINTLIFY.md'), true);
  copyFile('FRONTEND.md', path.join(siteDir, 'FRONTEND.md'), true);
  
  console.log('\n📝 Copying MDX files...');
  try {
    const files = fs.readdirSync(rootDir);
    const mdxFiles = files.filter(file => file.endsWith('.mdx'));
    mdxFiles.forEach(file => {
      copyFile(file, path.join(siteDir, file), true);
    });
  } catch (error) {
    console.log('No MDX files found or error reading directory');
  }
  
  console.log('\n✅ Deployment package created successfully!');
  console.log('\n📊 Contents of _site:');
  const contents = fs.readdirSync(siteDir);
  contents.forEach(item => {
    const itemPath = path.join(siteDir, item);
    const stats = fs.statSync(itemPath);
    const type = stats.isDirectory() ? '📁' : '📄';
    console.log(`  ${type} ${item}`);
  });
  
  // Calculate total size
  const totalSize = getDirSize(siteDir);
  const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
  console.log(`\n📦 Total size: ${sizeMB} MB`);
  console.log('\n🎉 Ready for deployment!');
}

// Run the script
try {
  prepareDeployment();
  process.exit(0);
} catch (error) {
  console.error('\n❌ Deployment preparation failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
