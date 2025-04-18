const fs = require('fs');
const path = require('path');

function readFilesRecursively(dir, output = '') {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules and other common directories you want to exclude
      if (!['node_modules', '.git',
        'hooks',
        'navigation',
        'services',
        'types',
        'utils',
        '%ProgramData%',
        'assets',
        '.expo'].includes(file)) {
        output = readFilesRecursively(fullPath, output);
      }
    } else {
      // Skip binary files and specific file types you want to exclude
      const excludeExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.ico'];
      const excludeFiles = ['file_contents.txt', 'package-lock.json', 'promptTextUtility.js', '.env',
        '.env.tampler',
        '.gitignore',
        'app.config.js',
        'App.tsx',
        'babel.config.js',
        'config.ts',
        'duplicates.js',
        'firebaseConfig.ts',
        'index.ts',
        'metro.config.js',
        '.env.template',
        'tsconfig.json',
        'package.json'
      ];
      
      if (!excludeExtensions.includes(path.extname(file)) && !excludeFiles.includes(file)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          output += `FILE: ${fullPath.replace(/\\/g, '/')}\n---\n${content}\n---\n\n`;
        } catch (error) {
          console.error(`Error reading file ${fullPath}: ${error.message}`);
        }
      }
    }
  }

  return output;
}

// Get the current directory
const currentDir = process.cwd();

// Generate the output
const output = readFilesRecursively(currentDir);

// Write to output file
fs.writeFileSync('file_contents.txt', output);

console.log('File contents have been written to file_contents.txt');