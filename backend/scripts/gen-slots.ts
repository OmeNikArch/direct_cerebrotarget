// Пересобирает список текстовых полей админки из site/index.html → src/content/slots.json.
// После запуска: npm run payload migrate:create texts → npm run migrate (меняется схема БД).
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseHTML } from 'linkedom'
import { collectSlots } from '../src/lib/slots'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const { document } = parseHTML(readFileSync(path.resolve(root, '..', 'site', 'index.html'), 'utf8'))
const slots = collectSlots(document as never)
writeFileSync(path.join(root, 'src/content/slots.json'), JSON.stringify(slots, null, 1) + '\n')
console.log(`slots.json: ${slots.length} текстовых полей`)
