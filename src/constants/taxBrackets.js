// Thai personal income tax — progressive brackets (values in BAHT, not satang).
// The tax calculator works in whole baht since these are large, un-stored,
// user-entered figures.
//
// IMPORTANT: verify these rates/allowances against the Revenue Department each
// year — they can change. (Ref: CLAUDE.md section 7.)
//
// Each bracket taxes the portion of taxable income from the previous limit up
// to `limit` at `rate`. The last bracket uses Infinity.
export const TAX_BRACKETS = [
  { limit: 150000, rate: 0 },
  { limit: 300000, rate: 0.05 },
  { limit: 500000, rate: 0.1 },
  { limit: 750000, rate: 0.15 },
  { limit: 1000000, rate: 0.2 },
  { limit: 2000000, rate: 0.25 },
  { limit: 5000000, rate: 0.3 },
  { limit: Infinity, rate: 0.35 },
]

// Base deductions (baht).
export const PERSONAL_ALLOWANCE = 60000 // ค่าลดหย่อนส่วนตัว
export const EXPENSE_RATE = 0.5 // หักค่าใช้จ่าย 50%
export const EXPENSE_CAP = 100000 // แต่ไม่เกิน 100,000
