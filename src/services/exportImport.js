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

function tagToRow(t) {
  return { id: t.id, name: t.name, createdAt: t.createdAt, updatedAt: t.updatedAt }
}

function rowToTag(r) {
  return { id: r.id, name: r.name, createdAt: r.createdAt, updatedAt: r.updatedAt }
}

function debtToRow(d) {
  return {
    id: d.id,
    creditor: d.creditor,
    amount: d.amount, // satang
    dueDate: d.dueDate,
    isPaid: d.isPaid ? 1 : 0,
    note: d.note || '',
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }
}

function rowToDebt(r) {
  return {
    id: r.id,
    creditor: r.creditor,
    amount: Number(r.amount) || 0,
    dueDate: r.dueDate,
    isPaid: String(r.isPaid) === '1' || r.isPaid === true,
    note: r.note || '',
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

function portfolioToRow(p) {
  return {
    id: p.id,
    name: p.name,
    type: p.type || 'stock',
    note: p.note || '',
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }
}

function rowToPortfolio(r) {
  return {
    id: r.id,
    name: r.name,
    type: r.type || 'stock',
    note: r.note || '',
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

function holdingToRow(h) {
  return {
    id: h.id,
    portfolioId: h.portfolioId,
    symbol: h.symbol,
    shares: h.shares,
    avgCost: h.avgCost, // cents
    currency: h.currency,
    lastPrice: h.lastPrice ?? '',
    lastChangeCents: h.lastChangeCents ?? '',
    lastChangePct: h.lastChangePct ?? '',
    lastPriceAt: h.lastPriceAt ?? '',
    createdAt: h.createdAt,
    updatedAt: h.updatedAt,
  }
}

function goalToRow(g) {
  return {
    id: g.id,
    name: g.name,
    targetAmount: g.targetAmount,
    currentAmount: g.currentAmount,
    deadline: g.deadline ?? '',
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
  }
}

function rowToGoal(r) {
  return {
    id: r.id,
    name: r.name,
    targetAmount: Number(r.targetAmount) || 0,
    currentAmount: Number(r.currentAmount) || 0,
    deadline: r.deadline || null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

function rowToHolding(r) {
  return {
    id: r.id,
    portfolioId: r.portfolioId,
    symbol: r.symbol,
    shares: Number(r.shares) || 0,
    avgCost: Number(r.avgCost) || 0,
    currency: r.currency || 'THB',
    lastPrice: r.lastPrice === '' || r.lastPrice == null ? null : Number(r.lastPrice),
    lastChangeCents: r.lastChangeCents === '' || r.lastChangeCents == null ? null : Number(r.lastChangeCents),
    lastChangePct: r.lastChangePct === '' || r.lastChangePct == null ? null : Number(r.lastChangePct),
    lastPriceAt: r.lastPriceAt || null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

// --- export -----------------------------------------------------------------

export function exportExcel({
  transactions,
  categories,
  tags = [],
  debts = [],
  portfolios = [],
  holdings = [],
  savingsGoals = [],
}) {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(transactions.map(txToRow)), 'Transactions')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(categories.map(catToRow)), 'Categories')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tags.map(tagToRow)), 'Tags')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(debts.map(debtToRow)), 'Debts')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(portfolios.map(portfolioToRow)), 'Portfolios')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(holdings.map(holdingToRow)), 'Holdings')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(savingsGoals.map(goalToRow)), 'SavingsGoals')
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
        const tagRows = wb.Sheets['Tags']
          ? XLSX.utils.sheet_to_json(wb.Sheets['Tags'])
          : []
        const debtRows = wb.Sheets['Debts']
          ? XLSX.utils.sheet_to_json(wb.Sheets['Debts'])
          : []
        const pfRows = wb.Sheets['Portfolios']
          ? XLSX.utils.sheet_to_json(wb.Sheets['Portfolios'])
          : []
        const hRows = wb.Sheets['Holdings']
          ? XLSX.utils.sheet_to_json(wb.Sheets['Holdings'])
          : []
        const goalRows = wb.Sheets['SavingsGoals']
          ? XLSX.utils.sheet_to_json(wb.Sheets['SavingsGoals'])
          : []
        resolve({
          transactions: txRows.map(rowToTx),
          categories: catRows.map(rowToCat),
          tags: tagRows.map(rowToTag),
          debts: debtRows.map(rowToDebt),
          portfolios: pfRows.map(rowToPortfolio),
          holdings: hRows.map(rowToHolding),
          savingsGoals: goalRows.map(rowToGoal),
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
          resolve({
            transactions: res.data.map(rowToTx),
            categories: null,
            tags: null,
            debts: null,
            portfolios: null,
            holdings: null,
            savingsGoals: null,
          })
        } catch (err) {
          reject(err)
        }
      },
      error: reject,
    })
  })
}
