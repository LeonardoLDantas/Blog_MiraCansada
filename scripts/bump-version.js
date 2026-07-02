// scripts/bump-version.js
// Uso: node scripts/bump-version.js patch   (correcoes: 1.6.0 -> 1.6.1)
//      node scripts/bump-version.js minor   (features:  1.6.0 -> 1.7.0)
//      node scripts/bump-version.js major   (breaking:  1.6.0 -> 2.0.0)
import { readFileSync, writeFileSync } from 'fs'

const type = process.argv[2] || 'patch'
const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))
let [major, minor, patch] = pkg.version.split('.').map(Number)

if (type === 'major') { major++; minor = 0; patch = 0 }
else if (type === 'minor') { minor++; patch = 0 }
else { patch++ }

pkg.version = `${major}.${minor}.${patch}`
writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n')
console.log(`v${pkg.version}`)
