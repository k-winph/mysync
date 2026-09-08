// Backup / restore. Data stays on-device; the only way in/out is these files.
// Amounts are kept as integer satang in exports so imports round-trip exactly.
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

// --- helpers ----------------------------------------------------------------

function download(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function stamp() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`
}

// Flatten a transaction for a spreadsheet row (arrays -> joined strings).
function txToRow(t) {
  return {
    id: t.id,
    type: t.type,
    amount: t.amount, // satang (integer)
    categoryId: t.categoryId,
    tags: (t.tags || []).join('|'),
    note: t.note || '',
    date: t.date,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }
}

function rowToTx(r) {
  return {
    id: r.id,
    type: r.type,
    amount: Number(r.amount) || 0,
    categoryId: r.categoryId,
    tags: r.tags ? String(r.tags).split('|').filter(Boolean) : [],
    note: r.note || '',
    date: r.date,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

function catToRow(c) {
  return {
    id: c.id,
    name: c.name,
    type: c.type,
    icon: c.icon,
    color: c.color,
    isDefault: c.isDefault ? 1 : 0,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }
}

function rowToCat(r) {
  return {
    id: r.id,
    name: r.name,
    type: r.type,
    icon: r.icon,
    color: r.color,
    isDefault: String(r.isDefault) === '1' || r.isDefault === true,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

// --- export -----------------------------------------------------------------

export function exportExcel({ transactions, categories }) {
  const wb = XLSX.utils.book_new()
  const txSheet = XLSX.utils.json_to_sheet(transactions.map(txToRow))
  const catSheet = XLSX.utils.json_to_sheet(categories.map(catToRow))
  XLSX.utils.book_append_sheet(wb, txSheet, 'Transactions')
  XLSX.utils.book_append_sheet(wb, catSheet, 'Categories')
  XLSX.writeFile(wb, `mysync-backup-${stamp()}.xlsx`)
}

export function exportCSV({ transactions }) {
  const csv = Papa.unparse(transactions.map(txToRow))
  download(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `mysync-transactions-${stamp()}.csv`)
}

// --- import -----------------------------------------------------------------

// Returns a promise resolving to { transactions, categories }.
// CSV imports only bring transactions (categories stay as-is).
export function importFile(file) {
  const name = file.name.toLowerCase()
  if (name.endsWith('.csv')) return importCSV(file)
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) return importExcel(file)
  return Promise.reject(new Error('Unsupported file type'))
}

function importExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' })
        const txRows = wb.Sheets['Transactions']
          ? XLSX.utils.sheet_to_json(wb.Sheets['Transactions'])
          : []
        const catRows = wb.Sheets['Categories']
          ? XLSX.utils.sheet_to_json(wb.Sheets['Categories'])
          : []
        resolve({
          transactions: txRows.map(rowToTx),
          categories: catRows.map(rowToCat),
        })
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

function importCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        try {
          resolve({ transactions: res.data.map(rowToTx), categories: null })
        } catch (err) {
          reject(err)
        }
      },
      error: reject,
    })
  })
}
