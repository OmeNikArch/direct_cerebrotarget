// Готовит лендинг ../site для бэкенда, не меняя исходники фронта:
//  - ассеты → public/ (отдаются как есть);
//  - index.html, script.js, quiz.mjs → site-template/ (сервер собирает их с данными админки);
//  - в data-endpoint обеих форм подставляется адрес приёма заявок.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const siteDir = path.resolve(root, '..', 'site')
const publicDir = path.join(root, 'public')
const templateDir = path.join(root, 'site-template')
const endpoint = process.env.LEAD_ENDPOINT || '/api/leads/submit'
const TEMPLATES = ['index.html', 'script.js', 'quiz.mjs']

if (!existsSync(path.join(siteDir, 'index.html'))) {
  console.error(`sync-site: не найден ${siteDir}/index.html`)
  process.exit(1)
}

rmSync(publicDir, { recursive: true, force: true })
rmSync(templateDir, { recursive: true, force: true })
cpSync(siteDir, publicDir, {
  recursive: true,
  filter: (src) => !/\.test\.mjs$/.test(src) && !TEMPLATES.includes(path.relative(siteDir, src)),
})
mkdirSync(templateDir, { recursive: true })
for (const f of TEMPLATES) cpSync(path.join(siteDir, f), path.join(templateDir, f))

const indexPath = path.join(templateDir, 'index.html')
let html = readFileSync(indexPath, 'utf8')
for (const id of ['quiz-lead-form', 'lead-form']) {
  const re = new RegExp(`(id="${id}"[^>]*?data-endpoint=")[^"]*(")`)
  if (!re.test(html)) {
    console.error(`sync-site: у формы #${id} не найден data-endpoint — проверьте site/index.html`)
    process.exit(1)
  }
  html = html.replace(re, `$1${endpoint}$2`)
}
writeFileSync(indexPath, html)
console.log(`sync-site: ассеты → public/, шаблоны → site-template/, data-endpoint → ${endpoint}`)
