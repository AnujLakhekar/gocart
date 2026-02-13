const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const prismaOut = path.join(root, 'lib', 'generated', 'prisma');

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (e) {
    return false;
  }
}

function patchFile(file) {
  const full = path.join(prismaOut, file);
  if (!fileExists(full)) return;
  let content = fs.readFileSync(full, 'utf8');
  // Replace imports that end with .js to .ts when corresponding .ts file exists
  content = content.replace(/from\s+(["'])(\.\/.+?)\.js\1/g, (m, q, rel) => {
    const targetTs = path.join(path.dirname(full), rel + '.ts');
    if (fileExists(targetTs)) return `from ${q}${rel}.ts${q}`;
    return m;
  });
  content = content.replace(/export\s+\*\s+from\s+(["'])(\.\/.+?)\.js\1/g, (m, q, rel) => {
    const targetTs = path.join(path.dirname(full), rel + '.ts');
    if (fileExists(targetTs)) return `export * from ${q}${rel}.ts${q}`;
    return m;
  });
  fs.writeFileSync(full, content, 'utf8');
  console.log('Patched', full);
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.isFile() && entry.name.endsWith('.ts')) {
      // Only patch .ts files
      const rel = path.relative(prismaOut, p);
      patchFile(rel);
    }
  }
}

if (!fileExists(prismaOut)) {
  console.error('Prisma output directory not found:', prismaOut);
  process.exit(1);
}

walk(prismaOut);
console.log('Prisma patching complete.');
