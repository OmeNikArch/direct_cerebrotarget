// Копирует статический лендинг ../site в public/ и подставляет адрес приёма заявок
// в data-endpoint обеих форм. Исходники фронта не меняются.
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const siteDir = path.resolve(root, '..', 'site')
const publicDir = path.join(root, 'public')
const endpoint = process.env.LEAD_ENDPOINT || '/api/leads/submit'

if (!existsSync(path.join(siteDir, 'index.html'))) {
  console.error(`sync-site: не найден ${siteDir}/index.html`)
  process.exit(1)
}

rmSync(publicDir, { recursive: true, force: true })
cpSync(siteDir, publicDir, {
  recursive: true,
  filter: (src) => !/\.test\.mjs$/.test(src),
})

const indexPath = path.join(publicDir, 'index.html')
const html = readFileSync(indexPath, 'utf8')
const forms = ['quiz-lead-form', 'lead-form']
let out = html
for (const id of forms) {
  const re = new RegExp(`(id="${id}"[^>]*?data-endpoint=")[^"]*(")`)
  if (!re.test(out)) {
    console.error(`sync-site: у формы #${id} не найден data-endpoint — проверьте site/index.html`)
    process.exit(1)
  }
  out = out.replace(re, `$1${endpoint}$2`)
}
writeFileSync(indexPath, out)
console.log(`sync-site: лендинг скопирован в public/, data-endpoint → ${endpoint}`)
