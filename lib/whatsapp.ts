// Builds a WhatsApp "click to chat" link with a ready message. Nothing is sent automatically:
// the owner's own WhatsApp opens with the text filled in, and they press send.

/** Digits only, with a country code. A bare 10-digit number gets defaultCode (India: 91). Returns '' if unusable. */
export function whatsappNumber(raw: unknown, defaultCode = '91'): string {
  let d = String(raw ?? '').replace(/[^0-9]/g, '')
  if (d.startsWith('00')) d = d.slice(2)
  if (d.length === 11 && d.startsWith('0') && defaultCode) d = d.slice(1)
  if (d.length === 10 && defaultCode) d = defaultCode + d
  return d.length >= 8 && d.length <= 15 ? d : ''
}

export function whatsappLink(phone: unknown, message: string, defaultCode = '91'): string {
  const n = whatsappNumber(phone, defaultCode)
  if (!n) return ''
  return 'https://wa.me/' + n + '?text=' + encodeURIComponent(message)
}

function field(d: Record<string, any>, pattern: RegExp): string {
  const k = Object.keys(d || {}).find(key => pattern.test(key) && d[key] !== '' && d[key] != null)
  return k ? String(d[k]).trim() : ''
}

/** Link for an invoice record, or '' when there is no phone number or the invoice is already paid. */
export function invoiceWhatsapp(data: Record<string, any>, defaultCode = '91'): string {
  const phone = field(data, /phone|mobile|whats/i)
  if (!phone) return ''
  const status = field(data, /status/i)
  if (/^paid$/i.test(status)) return ''
  const name = field(data, /client.?name|^client$|customer|^name$/i)
  const number = field(data, /invoice.?(no|number|#)|^number$/i)
  const amount = field(data, /^amount|^total|balance/i)
  const due = field(data, /due/i)
  const parts = ['Hi' + (name ? ' ' + name : '') + ',']
  parts.push('this is a reminder for ' + (number ? 'invoice ' + number : 'your invoice') + (amount ? ' of ' + amount : '') + (due ? ', due on ' + due : '') + '.')
  parts.push('Please let me know once it is paid. Thank you.')
  return whatsappLink(phone, parts.join(' '), defaultCode)
}
