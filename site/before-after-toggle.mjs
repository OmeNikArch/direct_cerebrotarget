export const createBeforeAfterToggle = ({ button, panel }) => {
  const setExpanded = (expanded) => {
    button.setAttribute('aria-expanded', String(expanded))
    button.textContent = expanded ? 'Скрыть пример' : 'Показать пример'
    panel.hidden = !expanded
  }

  setExpanded(false)
  button.addEventListener('click', () => setExpanded(panel.hidden))

  return { setExpanded }
}
