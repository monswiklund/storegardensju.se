import fs from 'fs'
import path from 'path'

function walk(dir: string): string[] {
  let results: string[] = []
  const list = fs.readdirSync(dir)
  list.forEach((file) => {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath))
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      if (
        !fullPath.includes('.test.') &&
        !fullPath.includes('/test/') &&
        !fullPath.includes('/scripts/') &&
        !fullPath.includes('AdminPage') &&
        !fullPath.includes('adminService.js')
      ) {
        results.push(fullPath)
      }
    }
  })
  return results
}

const files = walk('./src')
const swedishRegex = /[åäöÅÄÖ]|(?:[a-zA-Z]{3,}\s+[a-zA-Z]{3,})/

const technicalTokens = new Set([
  'GET', 'POST', 'PUT', 'DELETE', 'application/json', 'utf-8', 'button', 'submit', 'text',
  'email', 'tel', 'date', 'number', 'main', 'region', 'navigation', 'group', 'dialog',
  'alert', 'status', 'listbox', 'option', 'checkbox', 'radio', 'search', 'none', 'true',
  'false', 'lazy', 'async', 'eager', 'cover', 'contain', 'center', 'smooth', 'light',
  'dark', 'green', 'white', 'alt', 'linen', 'clay', 'forest', 'compact', 'airy',
  'centered', 'editorial', 'original', 'soft', 'strong', 'split', 'columns', 'wave',
  'hill', 'valley', 'card', 'hero', 'thumbnail', 'production', 'development',
  'application', 'strict-origin-when-cross-origin', 'no-referrer', 'same-origin',
  'touchstart', 'touchend', 'touchmove', 'scroll', 'resize', 'click', 'input',
  'change', 'keydown', 'keyup', 'keypress', 'load', 'error', 'focus', 'blur'
])

const fileFindings = new Map<string, Array<{ line: number; text: string; source: string }>>()

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8')
  const lines = content.split('\n')
  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (
      trimmed.startsWith('import ') ||
      trimmed.startsWith('//') ||
      trimmed.startsWith('/*') ||
      trimmed.startsWith('*')
    )
      return

    // Check string literals
    const stringMatches = line.match(/(?:"([^"]+)"|'([^']+)'|`([^`]+)`)/g)
    if (stringMatches) {
      for (const m of stringMatches) {
        const raw = m.slice(1, -1).trim()
        if (
          raw.startsWith('http') ||
          raw.startsWith('/') ||
          raw.startsWith('#') ||
          raw.startsWith('data-') ||
          raw.startsWith('sg-') ||
          raw.startsWith('lucide-') ||
          raw.startsWith('event-') ||
          raw.startsWith('nav-') ||
          raw.startsWith('btn-')
        )
          continue
        if (technicalTokens.has(raw)) continue

        if (
          swedishRegex.test(raw) &&
          !line.includes('copy(') &&
          !line.includes('media(') &&
          !line.includes('list(') &&
          !line.includes('siteCopy(') &&
          !line.includes('homeCopy(')
        ) {
          if (!fileFindings.has(file)) fileFindings.set(file, [])
          fileFindings.get(file)!.push({ line: idx + 1, text: raw, source: trimmed })
        }
      }
    }

    // Check raw JSX text: >Some text<
    const jsxTextMatches = line.match(/>([^<>{}$\n]+)</g)
    if (jsxTextMatches) {
      for (const j of jsxTextMatches) {
        const rawText = j.slice(1, -1).trim()
        if (rawText && rawText.length > 1 && !rawText.match(/^[\s\d\W]+$/)) {
          if (!fileFindings.has(file)) fileFindings.set(file, [])
          fileFindings.get(file)!.push({ line: idx + 1, text: rawText, source: trimmed })
        }
      }
    }
  })
}

console.log(`Audited ${files.length} public runtime frontend files.`)
console.log(`Found ${fileFindings.size} files with natural language strings:\n`)

for (const [file, items] of fileFindings.entries()) {
  console.log(`### ${file} (${items.length} strings)`)
  items.forEach((item) => {
    console.log(`  - L${item.line}: "${item.text}"`)
  })
  console.log()
}
