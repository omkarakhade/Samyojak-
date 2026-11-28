// Builds a WhatsApp "click to chat" link with a ready message. Nothing is sent automatically:
// the owner's own WhatsApp opens with the text filled in, and they press send.

export const SAMYOJAK_LINK = 'https://www.samyojak-erp.com/?utm_source=invoice&utm_medium=whatsapp'

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

/** Link for an invoice record with the whole invoice written out, or '' when there is no phone number. */
export function invoiceWhatsapp(data: Record<string, any>, defaultCode = '91'): string {
  const phone = field(data, /phone|mobile|whats/i)
  if (!phone) return ''
  const status = field(data, /status/i)
  const paid = /^paid$/i.test(status)
  const name = field(data, /client.?name|^client$|customer|^name$/i)
  const number = field(data, /invoice.?(no|number|#)|^number$/i)
  const items = field(data, /^line.?items$/i)
  const amount = field(data, /^amount$/i)
  const taxRate = field(data, /^tax.?rate$/i)
  const taxAmt = field(data, /^tax.?amount$/i)
  const total = field(data, /^total$/i) || (amount && !taxAmt ? amount : '')
  const due = field(data, /due/i)
  const lines: string[] = ['Hi' + (name ? ' ' + name : '') + ',']
  lines.push(paid ? 'Thank you, we have received your payment.' : 'Here is your invoice.')
  lines.push('')
  lines.push('Invoice' + (number ? ' ' + number : ''))
  if (items) lines.push('Items: ' + items)
  if (amount && taxAmt) lines.push('Amount: ' + amount)
  if (taxAmt) lines.push((taxRate ? 'Tax (' + taxRate + ')' : 'Tax') + ': ' + taxAmt)
  if (total) lines.push('Total: ' + total)
  if (!paid && due) lines.push('Due date: ' + due)
  lines.push('Status: ' + (paid ? 'Paid' : 'Unpaid'))
  if (!paid) {
    lines.push('')
    lines.push('Please let me know once it is paid. Thank you.')
  }
  // Every invoice an owner sends tells their customer where it came from.
  lines.push('')
  lines.push('Made with Samyojak, the ERP that adjusts to you: ' + SAMYOJAK_LINK)
  return whatsappLink(phone, lines.join('\n'), defaultCode)
}
