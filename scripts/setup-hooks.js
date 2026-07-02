// scripts/setup-hooks.js
// Instala o pre-commit hook automaticamente
// Rode: npm run setup-hooks
import { writeFileSync, chmodSync, existsSync, mkdirSync } from 'fs'

const hooksDir = '.git/hooks'
if (!existsSync(hooksDir)) mkdirSync(hooksDir, { recursive: true })

const hook = `#!/bin/sh
# Auto-bump patch version on every commit
node scripts/bump-version.js patch
git add package.json
`

writeFileSync(`${hooksDir}/pre-commit`, hook)
chmodSync(`${hooksDir}/pre-commit`, 0o755)
console.log('pre-commit hook instalado!')
console.log('Agora cada commit vai incrementar o patch automaticamente.')
console.log('Para features: npm run version:minor antes de commitar.')
