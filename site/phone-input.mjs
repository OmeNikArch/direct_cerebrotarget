const digitsOnly = (value) => String(value || '').replace(/\D/gu, '')

export const normalizeRussianPhone = (value) => {
  const digits = digitsOnly(value)
  if (!digits) return ''
  const withCountryCode = digits.startsWith('8')
    ? `7${digits.slice(1)}`
    : digits.startsWith('7') ? digits : `7${digits}`
  return `+${withCountryCode.slice(0, 11)}`
}

export const formatRussianPhone = (value) => {
  const normalized = normalizeRussianPhone(value)
  if (!normalized) return ''

  const subscriber = normalized.slice(2)
  if (!subscriber) return '+7'
  let formatted = `+7 (${subscriber.slice(0, 3)}`
  if (subscriber.length >= 4) formatted += `) ${subscriber.slice(3, 6)}`
  if (subscriber.length >= 7) formatted += `-${subscriber.slice(6, 8)}`
  if (subscriber.length >= 9) formatted += `-${subscriber.slice(8, 10)}`
  return formatted
}

export const isRussianPhoneComplete = (value) => normalizeRussianPhone(value).length === 12

const getCaretPosition = (value, digitCount) => {
  if (digitCount === 0) return 0
  let seenDigits = 0
  for (let index = 0; index < value.length; index += 1) {
    if (/\d/u.test(value[index])) seenDigits += 1
    if (seenDigits === digitCount) return index + 1
  }
  return value.length
}

export const attachRussianPhoneMask = (input) => {
  const formatInput = () => {
    const rawValue = input.value
    const cursor = input.selectionStart ?? rawValue.length
    const rawDigits = digitsOnly(rawValue)
    const digitsBeforeCursor = digitsOnly(rawValue.slice(0, cursor)).length
    const addsCountryCode = Boolean(rawDigits) && !rawDigits.startsWith('7') && !rawDigits.startsWith('8')
    const formatted = formatRussianPhone(rawValue)
    input.value = formatted
    const formattedDigits = digitsOnly(formatted).length
    const targetDigit = Math.min(digitsBeforeCursor + (addsCountryCode ? 1 : 0), formattedDigits)
    const caret = getCaretPosition(formatted, targetDigit)
    input.setSelectionRange(caret, caret)
    input.setCustomValidity('')
  }

  input.addEventListener('input', formatInput)
  return () => input.removeEventListener('input', formatInput)
}
