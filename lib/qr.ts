// QR code encoder (byte mode, error correction level M, versions 1-10).
// Written for Samyojak so product labels need no extra app or library.
// Holds up to 213 bytes of text, enough for a product name, SKU and price.

// [ecCodewordsPerBlock, blocksInGroup1, dataCodewordsInGroup1Block, blocksInGroup2, dataCodewordsInGroup2Block]
const BLOCKS_M: number[][] = [
  [10, 1, 16, 0, 0],
  [16, 1, 28, 0, 0],
  [26, 1, 44, 0, 0],
  [18, 2, 32, 0, 0],
  [24, 2, 43, 0, 0],
  [16, 4, 27, 0, 0],
  [18, 4, 31, 0, 0],
  [22, 2, 38, 2, 39],
  [22, 3, 36, 2, 37],
  [26, 4, 43, 1, 44],
]

const ALIGN: number[][] = [
  [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50],
]

export const QR_MAX_BYTES = 213

// ---- Reed-Solomon over GF(256) ----
const EXP: number[] = []
const LOG: number[] = []
;(function initField() {
  let x = 1
  for (let i = 0; i < 255; i++) {
    EXP[i] = x
    LOG[x] = i
    x <<= 1
    if (x & 256) x ^= 0x11d
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]
})()

function gfMul(a: number, b: number): number {
  return a && b ? EXP[LOG[a] + LOG[b]] : 0
}

function generator(degree: number): number[] {
  let g = [1]
  for (let i = 0; i < degree; i++) {
    const next: number[] = []
    for (let j = 0; j <= g.length; j++) next.push(0)
    for (let j = 0; j < g.length; j++) {
      next[j] ^= g[j]
      next[j + 1] ^= gfMul(g[j], EXP[i])
    }
    g = next
  }
  return g
}

function remainder(data: number[], degree: number): number[] {
  const gen = generator(degree)
  const res: number[] = []
  for (let i = 0; i < degree; i++) res.push(0)
  for (let k = 0; k < data.length; k++) {
    const factor = data[k] ^ (res.shift() as number)
    res.push(0)
    for (let i = 0; i < degree; i++) res[i] ^= gfMul(gen[i + 1], factor)
  }
  return res
}

function toBytes(text: string): number[] {
  const bin = unescape(encodeURIComponent(text))
  const out: number[] = []
  for (let i = 0; i < bin.length; i++) out.push(bin.charCodeAt(i))
  return out
}

function dataCapacity(version: number): number {
  const b = BLOCKS_M[version - 1]
  return b[1] * b[2] + b[3] * b[4]
}

function buildCodewords(bytes: number[], version: number): number[] {
  const capacity = dataCapacity(version) * 8
  const bits: number[] = []
  const push = (value: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((value >>> i) & 1)
  }
  push(4, 4)
  push(bytes.length, version >= 10 ? 16 : 8)
  for (let i = 0; i < bytes.length; i++) push(bytes[i], 8)
  for (let i = 0; i < 4 && bits.length < capacity; i++) bits.push(0)
  while (bits.length % 8 !== 0) bits.push(0)
  const data: number[] = []
  for (let i = 0; i < bits.length; i += 8) {
    let v = 0
    for (let j = 0; j < 8; j++) v = (v << 1) | bits[i + j]
    data.push(v)
  }
  for (let pad = 0xec; data.length < dataCapacity(version); pad ^= 0xec ^ 0x11) data.push(pad)

  const b = BLOCKS_M[version - 1]
  const ecLen = b[0]
  const blocks: number[][] = []
  let pos = 0
  for (let i = 0; i < b[1]; i++) { blocks.push(data.slice(pos, pos + b[2])); pos += b[2] }
  for (let i = 0; i < b[3]; i++) { blocks.push(data.slice(pos, pos + b[4])); pos += b[4] }
  const ecs = blocks.map(blk => remainder(blk, ecLen))

  const out: number[] = []
  let longest = 0
  blocks.forEach(blk => { if (blk.length > longest) longest = blk.length })
  for (let i = 0; i < longest; i++) blocks.forEach(blk => { if (i < blk.length) out.push(blk[i]) })
  for (let i = 0; i < ecLen; i++) ecs.forEach(e => out.push(e[i]))
  return out
}

// ---- Matrix ----
function getBit(x: number, i: number): boolean {
  return ((x >>> i) & 1) !== 0
}

function maskFn(mask: number, x: number, y: number): boolean {
  switch (mask) {
    case 0: return (x + y) % 2 === 0
    case 1: return y % 2 === 0
    case 2: return x % 3 === 0
    case 3: return (x + y) % 3 === 0
    case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0
    case 5: return ((x * y) % 2) + ((x * y) % 3) === 0
    case 6: return ((((x * y) % 2) + ((x * y) % 3)) % 2) === 0
    default: return ((((x + y) % 2) + ((x * y) % 3)) % 2) === 0
  }
}

function penalty(m: boolean[][], size: number): number {
  let score = 0
  // rule 1: runs of 5 or more in a row or column
  for (let pass = 0; pass < 2; pass++) {
    for (let a = 0; a < size; a++) {
      let run = 1
      for (let b = 1; b < size; b++) {
        const cur = pass === 0 ? m[a][b] : m[b][a]
        const prev = pass === 0 ? m[a][b - 1] : m[b - 1][a]
        if (cur === prev) {
          run++
          if (run === 5) score += 3
          else if (run > 5) score += 1
        } else run = 1
      }
    }
  }
  // rule 2: 2x2 blocks
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const c = m[y][x]
      if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) score += 3
    }
  }
  // rule 3: finder-like patterns
  const pat1 = [true, false, true, true, true, false, true, false, false, false, false]
  const pat2 = [false, false, false, false, true, false, true, true, true, false, true]
  for (let pass = 0; pass < 2; pass++) {
    for (let a = 0; a < size; a++) {
      for (let b = 0; b + 11 <= size; b++) {
        let m1 = true
        let m2 = true
        for (let k = 0; k < 11; k++) {
          const v = pass === 0 ? m[a][b + k] : m[b + k][a]
          if (v !== pat1[k]) m1 = false
          if (v !== pat2[k]) m2 = false
        }
        if (m1) score += 40
        if (m2) score += 40
      }
    }
  }
  // rule 4: dark/light balance
  let dark = 0
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (m[y][x]) dark++
  const percent = (dark * 100) / (size * size)
  score += Math.floor(Math.abs(percent - 50) / 5) * 10
  return score
}

export function qrMatrix(text: string): boolean[][] {
  const bytes = toBytes(text)
  let version = 0
  for (let v = 1; v <= 10; v++) {
    const lenBits = v >= 10 ? 16 : 8
    if (4 + lenBits + bytes.length * 8 <= dataCapacity(v) * 8) { version = v; break }
  }
  if (!version) throw new Error('Text is too long for a QR code')

  const size = 17 + version * 4
  const modules: boolean[][] = []
  const fn: boolean[][] = []
  for (let y = 0; y < size; y++) {
    modules.push([]); fn.push([])
    for (let x = 0; x < size; x++) { modules[y].push(false); fn[y].push(false) }
  }
  const setFn = (x: number, y: number, dark: boolean) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return
    modules[y][x] = dark
    fn[y][x] = true
  }

  // timing
  for (let i = 0; i < size; i++) { setFn(6, i, i % 2 === 0); setFn(i, 6, i % 2 === 0) }
  // finders with separators
  const finder = (cx: number, cy: number) => {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const d = Math.max(Math.abs(dx), Math.abs(dy))
        setFn(cx + dx, cy + dy, d !== 2 && d !== 4)
      }
    }
  }
  finder(3, 3); finder(size - 4, 3); finder(3, size - 4)
  // alignment
  const pos = ALIGN[version - 1]
  for (let i = 0; i < pos.length; i++) {
    for (let j = 0; j < pos.length; j++) {
      const last = pos.length - 1
      if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) continue
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) setFn(pos[i] + dx, pos[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1)
      }
    }
  }
  // reserve format area
  const drawFormat = (mask: number) => {
    const data = mask // level M = 00
    let rem = data
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537)
    const bits = ((data << 10) | rem) ^ 0x5412
    for (let i = 0; i <= 5; i++) setFn(8, i, getBit(bits, i))
    setFn(8, 7, getBit(bits, 6))
    setFn(8, 8, getBit(bits, 7))
    setFn(7, 8, getBit(bits, 8))
    for (let i = 9; i < 15; i++) setFn(14 - i, 8, getBit(bits, i))
    for (let i = 0; i < 8; i++) setFn(size - 1 - i, 8, getBit(bits, i))
    for (let i = 8; i < 15; i++) setFn(8, size - 15 + i, getBit(bits, i))
    setFn(8, size - 8, true)
  }
  drawFormat(0)
  // version info
  if (version >= 7) {
    let rem = version
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25)
    const bits = (version << 12) | rem
    for (let i = 0; i < 18; i++) {
      const bit = getBit(bits, i)
      const a = size - 11 + (i % 3)
      const b = Math.floor(i / 3)
      setFn(a, b, bit)
      setFn(b, a, bit)
    }
  }

  // data
  const codewords = buildCodewords(bytes, version)
  let bitIndex = 0
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j
        const upward = ((right + 1) & 2) === 0
        const y = upward ? size - 1 - vert : vert
        if (!fn[y][x] && bitIndex < codewords.length * 8) {
          modules[y][x] = getBit(codewords[bitIndex >>> 3], 7 - (bitIndex & 7))
          bitIndex++
        }
      }
    }
  }

  const applyMask = (mask: number) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (!fn[y][x] && maskFn(mask, x, y)) modules[y][x] = !modules[y][x]
      }
    }
  }
  let best = 0
  let bestScore = Infinity
  for (let mask = 0; mask < 8; mask++) {
    applyMask(mask)
    drawFormat(mask)
    const s = penalty(modules, size)
    if (s < bestScore) { bestScore = s; best = mask }
    applyMask(mask)
  }
  applyMask(best)
  drawFormat(best)
  return modules
}

// Returns an SVG string (black on white, with the 4-module quiet zone scanners need).
export function qrSvg(text: string, pixels?: number): string {
  const m = qrMatrix(text)
  const n = m.length
  const total = n + 8
  let path = ''
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) if (m[y][x]) path += 'M' + (x + 4) + ' ' + (y + 4) + 'h1v1h-1z'
  }
  const dim = pixels ? ' width="' + pixels + '" height="' + pixels + '"' : ''
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + total + ' ' + total + '"' + dim +
    ' shape-rendering="crispEdges"><rect width="' + total + '" height="' + total + '" fill="#fff"/><path d="' + path + '" fill="#000"/></svg>'
}

// What a product label encodes: readable on any phone scanner without Samyojak.
export function productQrText(name: string, sku: string, price: string): string {
  let text = name.trim()
  if (sku) text += ' | SKU ' + sku
  if (price) text += ' | ' + price
  while (toBytes(text).length > QR_MAX_BYTES) text = text.slice(0, text.length - 1)
  return text
}
