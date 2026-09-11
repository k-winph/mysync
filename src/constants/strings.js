// Centralized UI strings in English + Thai. `strings.x` reads the active
// language live (see the Proxy at the bottom); <App> sets it from
// settings.language. getStrings(lang) returns a specific tree for effects.

const en = {
  appName: 'MySync',

  nav: { dashboard: 'Dashboard', transactions: 'Records', debt: 'Debt', tax: 'Tax', settings: 'Settings' },

  common: {
    add: 'Add', edit: 'Edit', delete: 'Delete', save: 'Save', cancel: 'Cancel',
    confirm: 'Confirm', close: 'Close', optional: 'optional', all: 'All', none: 'None', today: 'Today',
  },

  balance: {
    title: 'Income vs Expense', income: 'Income', expense: 'Expense', net: 'Net',
    totalIncome: 'Total income', totalExpense: 'Total expense',
    noData: 'No transactions in this year.', tapMonthHint: 'Tap a month to see its transactions',
  },

  dashboard: {
    title: 'This Month', income: 'Income', expense: 'Expense', balance: 'Balance',
    recent: 'Recent transactions', empty: 'No transactions yet. Tap + to add your first one.',
    topCategories: 'Top spending', spendingByCategory: 'Spending by category',
    quickAdd: 'Quick add', trackStocks: 'Track your stocks →',
    vsLastMonth: 'vs last month', noChange: 'no change', noExpenseData: 'No spending this month yet.',
  },

  tx: {
    income: 'Income', expense: 'Expense', amount: 'Amount', category: 'Category',
    tags: 'Tags', tagsHint: 'Comma separated, e.g. trip, work', newTag: 'New tag',
    noTagsHint: 'No tags yet. Tap Add to create one.', note: 'Note', date: 'Date',
    addTitle: 'Add transaction', editTitle: 'Edit transaction', deleteConfirm: 'Delete this transaction?',
    empty: 'No transactions.', pickCategory: 'Select a category', noResults: 'No transactions match your filters.',
  },

  filter: {
    search: 'Search', searchHint: 'Search note, tag or category', type: 'Type', allTypes: 'All',
    category: 'Category', allCategories: 'All categories', from: 'From', to: 'To',
    clear: 'Clear filters', filters: 'Filters', tagSummary: 'Totals by tag',
    resultCount: (n) => `${n} result${n === 1 ? '' : 's'}`,
  },

  tag: {
    title: 'Totals by tag', empty: 'No tags used yet. Add tags to transactions to see totals here.',
    spent: 'Spent', received: 'Received', count: (n) => `${n} item${n === 1 ? '' : 's'}`,
  },

  tagManage: {
    title: 'Manage tags', name: 'New tag name', empty: 'No tags yet. Create one below.',
    deleteConfirm: 'Delete this tag? Existing transactions keep the tag on their record.',
  },

  category: {
    manage: 'Manage categories', name: 'Category name', type: 'Type', both: 'Both',
    addTitle: 'Add category',
    deleteConfirm: 'Delete this category? Transactions using it will keep their record but show as uncategorized.',
    defaultBadge: 'default',
  },

  debt: {
    title: 'Debts', totalOutstanding: 'Total outstanding', dueSoon: 'Due soon', upcoming: 'Upcoming debts',
    paid: 'Paid', unpaid: 'Unpaid', markPaid: 'Mark as paid', markUnpaid: 'Mark as unpaid',
    addTitle: 'Add debt', editTitle: 'Edit debt', creditor: 'Creditor', creditorHint: 'e.g. KTC card, car loan',
    amount: 'Amount', dueDate: 'Due date', note: 'Note', empty: 'No debts. Tap + to add one.',
    deleteConfirm: 'Delete this debt?', overdue: 'Overdue',
    dueInDays: (n) => (n === 0 ? 'Due today' : `Due in ${n} day${n === 1 ? '' : 's'}`),
    allPaid: 'All debts paid. Nice!', showPaid: 'Show paid',
    repeat: 'Repeat', category: 'Category', tags: 'Tags',
    recur: { none: 'One-time', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' },
    subsTitle: 'Subscriptions', subsTotal: 'Subscriptions total',
    subsEmpty: 'No subscriptions yet. Tap + to add one.',
    subsCount: (n) => `${n} subscription${n === 1 ? '' : 's'}`,
    nextDue: 'Next due', payPeriod: 'Pay this period', payConfirm: 'Log this payment as an expense?',
    sortLabel: 'Sort', sortExpensive: 'Most expensive', sortCheap: 'Cheapest',
    sortDueSoon: 'Due soonest', sortDueLate: 'Due latest',
  },

  tax: {
    title: 'Tax Calculator', subtitle: 'Thai personal income tax (progressive)',
    annualIncome: 'Annual income', perYear: 'year', infoAria: 'How tax is calculated',
    extraDeductions: 'Extra deductions', extraHint: 'Insurance, RMF/SSF, donations, etc.',
    calculate: 'Calculate', result: 'Estimated tax', effectiveRate: 'Effective rate',
    afterTax: 'Income after tax', breakdownTitle: 'Deductions', personal: 'Personal allowance',
    expense: 'Expense deduction (50%, max 100k)', extra: 'Extra deductions',
    totalDeductions: 'Total deductions', taxableIncome: 'Taxable income', bracketsTitle: 'Tax by bracket',
    band: 'Band', rate: 'Rate', taxedAmount: 'Taxable', taxAmount: 'Tax',
    noTax: 'No tax due — taxable income is within the exempt band.',
    disclaimer: 'Estimate only. Rates and allowances change yearly — verify with the Revenue Department. Not tax advice.',
  },

  taxInfo: {
    title: 'Thai income tax (overview)',
    formulaTitle: 'How it works',
    formula: "Thailand taxes progressively on 'net income', not your whole income.",
    formulaLine: 'Net income = annual income − expenses − deductions',
    bracketsTitle: 'Progressive rates (each band taxed on its portion)',
    thresholdTitle: 'When do you start paying?',
    threshold:
      'With basic deductions (50% expenses up to 100,000 + personal 60,000), income up to ~25,800 THB/month (~310,000/yr) usually owes no tax. More deductions raise that. But if annual income exceeds 120,000 you must still file, even if tax is zero.',
    deductionsTitle: 'Common deductions',
    deductions:
      'Besides the 60,000 personal allowance: spouse without income 60,000, child 30,000 each, parents 30,000 each, social security (~9,000 max), life/health insurance, SSF/RMF/Thai ESG funds, home loan interest, donations, etc.',
    otherIncomeTitle: 'Income beyond salary',
    otherIncome:
      'A bonus counts as salary (same 50%/100k cap). Rent/freelance/business/professional income use different expense rules — this calculator is built for salary + bonus, so other income types are rough estimates.',
    usageTitle: 'Using this page',
    usage:
      'Annual income: your whole-year income (incl. bonus). Extra deductions: the sum of your other deductions besides personal + expenses (auto-applied), e.g. social security + insurance + SSF.',
    disclaimer:
      'General information, not tax advice. Rates and allowances change yearly — always verify with the Revenue Department (rd.go.th) before filing.',
  },

  stock: {
    title: 'Investments', totalValue: 'Total value', today: 'Today', allGainLoss: 'Total gain/loss',
    addPortfolio: 'Add portfolio', editPortfolio: 'Edit portfolio', portfolioName: 'Portfolio name',
    portfolioNameHint: 'e.g. Long-term', note: 'Note',
    emptyPortfolios: 'No portfolios yet. Create one to start tracking your stocks.',
    deletePortfolioConfirm: 'Delete this portfolio and all of its holdings?',
    positions: (n) => `${n} position${n === 1 ? '' : 's'}`,
    holdings: 'Holdings', addHolding: 'Add holding', editHolding: 'Edit holding', symbol: 'Symbol',
    symbolHint: 'e.g. AAPL, or PTT.BK for Thai', shares: 'Shares', avgCost: 'Avg cost / share',
    currency: 'Currency', deleteHoldingConfirm: 'Delete this holding?', emptyHoldings: 'No holdings yet. Tap + to add one.',
    refresh: 'Refresh', refreshing: 'Refreshing…', price: 'Price', value: 'Value', cost: 'Cost',
    updated: 'Updated', notFetched: 'Price not fetched yet',
    noKey: 'Add your stock API key in Settings to fetch live prices.',
    fetchError: 'Could not fetch some prices — check the symbol or your API key.',
    thaiHint: 'Thai (SET) symbols use a .BK suffix and may have limited free coverage.',
    sortLabel: 'Sort', sortDefault: 'Default',
    sortGainDesc: 'Gain: high → low', sortGainAsc: 'Gain: low → high',
    sortValueDesc: 'Value: high → low', sortValueAsc: 'Value: low → high',
    sortTodayDesc: "Today: high → low", sortTodayAsc: "Today: low → high",
    showKey: 'Show key', hideKey: 'Hide key',
  },

  savings: {
    title: 'Savings goals',
    trackSavings: 'Set a savings goal →',
    addGoal: 'Add goal',
    editGoal: 'Edit goal',
    name: 'Goal name',
    nameHint: 'e.g. Emergency fund',
    target: 'Target amount',
    current: 'Saved so far',
    deadline: 'Target date',
    empty: 'No goals yet. Tap + to set one.',
    deleteConfirm: 'Delete this goal?',
    addFunds: 'Add money',
    addFundsTitle: 'Add to savings',
    toGo: 'to go',
    reached: 'Goal reached! 🎉',
    saved: 'Saved',
    totalSaved: 'Total saved',
    daysLeft: (n) => (n < 0 ? 'Past target date' : n === 0 ? 'Due today' : `${n} days left`),
  },

  settings: {
    title: 'Settings', appearance: 'Appearance', darkMode: 'Dark mode', hideBalances: 'Hide balances',
    language: 'Language', currency: 'Primary currency',
    currencyNote: 'Changing currency only changes the symbol/format — it does not convert existing amounts.',
    data: 'Data', exportExcel: 'Export to Excel', exportCsv: 'Export to CSV', importFile: 'Import from file',
    importHint: 'Import a previously exported .xlsx or .csv backup.', importDone: 'Import complete.',
    importError: 'Could not read that file. Make sure it is a MySync export.',
    lastBackup: 'Last backup', never: 'never', about: 'About',
    aboutText: 'MySync keeps all your data on this device only. Back up regularly via export.',
    stocks: 'Stocks', stockApiKey: 'Stock API key',
    stockApiKeyHint: 'Prices use your own free API key, stored on this device only. Get a free key, then paste it here.',
    getFreeKey: 'Get a free key', provider: 'Provider', saved: 'Saved',
    security: 'Security & alerts', appLock: 'App lock (PIN)', biometric: 'Unlock with biometrics',
    biometricHint: 'Use your fingerprint or Face to unlock (falls back to PIN).',
    biometricUnavailable: 'Biometrics are not available on this device/browser.',
    biometricFailed: 'Could not set up biometrics. Try again.',
    debtReminders: 'Debt due reminders',
    debtRemindersHint: 'Get a notification when a debt is overdue or due soon — checked when you open the app.',
    notifBlocked: 'Notifications are blocked in your browser settings.',
  },

  lock: {
    setTitle: 'Set a PIN', enterNew: 'Enter a 6-digit PIN', confirmNew: 'Re-enter your PIN',
    mismatch: 'PINs do not match. Try again.', unlockTitle: 'Enter PIN', wrong: 'Wrong PIN. Try again.',
    disableTitle: 'Enter PIN to turn off lock', lockedNote: 'MySync is locked', useBiometric: 'Use biometrics',
  },

  reminder: {
    backupTitle: 'Time to back up',
    backupBody: "It's been a while since your last backup. Export your data to keep it safe.",
    backupAction: 'Back up now',
  },

  notify: {
    debtTitle: 'Debt reminder',
    debtOne: (creditor) => `${creditor} is due soon`,
    debtMany: (n) => `${n} debts are due soon or overdue`,
  },
}

const th = {
  appName: 'MySync',

  nav: { dashboard: 'หน้าหลัก', transactions: 'รายการ', debt: 'หนี้สิน', tax: 'ภาษี', settings: 'ตั้งค่า' },

  common: {
    add: 'เพิ่ม', edit: 'แก้ไข', delete: 'ลบ', save: 'บันทึก', cancel: 'ยกเลิก',
    confirm: 'ยืนยัน', close: 'ปิด', optional: 'ไม่บังคับ', all: 'ทั้งหมด', none: 'ไม่มี', today: 'วันนี้',
  },

  balance: {
    title: 'รายรับ vs รายจ่าย', income: 'รายรับ', expense: 'รายจ่าย', net: 'คงเหลือ',
    totalIncome: 'รายรับรวม', totalExpense: 'รายจ่ายรวม',
    noData: 'ไม่มีรายการในปีนี้', tapMonthHint: 'แตะที่เดือนเพื่อดูรายการ',
  },

  dashboard: {
    title: 'เดือนนี้', income: 'รายรับ', expense: 'รายจ่าย', balance: 'คงเหลือ',
    recent: 'รายการล่าสุด', empty: 'ยังไม่มีรายการ แตะ + เพื่อเพิ่มรายการแรก',
    topCategories: 'หมวดที่ใช้จ่ายมาก', spendingByCategory: 'รายจ่ายตามหมวด',
    quickAdd: 'เพิ่มด่วน', trackStocks: 'ติดตามหุ้นของคุณ →',
    vsLastMonth: 'เทียบเดือนก่อน', noChange: 'ไม่เปลี่ยนแปลง', noExpenseData: 'เดือนนี้ยังไม่มีรายจ่าย',
  },

  tx: {
    income: 'รายรับ', expense: 'รายจ่าย', amount: 'จำนวนเงิน', category: 'หมวดหมู่',
    tags: 'แท็ก', tagsHint: 'คั่นด้วยจุลภาค เช่น ทริป, งาน', newTag: 'แท็กใหม่',
    noTagsHint: 'ยังไม่มีแท็ก แตะเพิ่มเพื่อสร้าง', note: 'โน้ต', date: 'วันที่',
    addTitle: 'เพิ่มรายการ', editTitle: 'แก้ไขรายการ', deleteConfirm: 'ลบรายการนี้?',
    empty: 'ไม่มีรายการ', pickCategory: 'เลือกหมวดหมู่', noResults: 'ไม่มีรายการตรงกับตัวกรอง',
  },

  filter: {
    search: 'ค้นหา', searchHint: 'ค้นหาโน้ต แท็ก หรือหมวด', type: 'ประเภท', allTypes: 'ทั้งหมด',
    category: 'หมวดหมู่', allCategories: 'ทุกหมวด', from: 'จาก', to: 'ถึง',
    clear: 'ล้างตัวกรอง', filters: 'ตัวกรอง', tagSummary: 'สรุปตามแท็ก',
    resultCount: (n) => `${n} รายการ`,
  },

  tag: {
    title: 'สรุปตามแท็ก', empty: 'ยังไม่มีแท็กที่ใช้ เพิ่มแท็กในรายการเพื่อดูสรุปที่นี่',
    spent: 'จ่าย', received: 'รับ', count: (n) => `${n} รายการ`,
  },

  tagManage: {
    title: 'จัดการแท็ก', name: 'ชื่อแท็กใหม่', empty: 'ยังไม่มีแท็ก สร้างด้านล่าง',
    deleteConfirm: 'ลบแท็กนี้? รายการเดิมยังเก็บแท็กไว้ในบันทึก',
  },

  category: {
    manage: 'จัดการหมวดหมู่', name: 'ชื่อหมวด', type: 'ประเภท', both: 'ทั้งคู่',
    addTitle: 'เพิ่มหมวด',
    deleteConfirm: 'ลบหมวดนี้? รายการที่ใช้หมวดนี้จะยังอยู่แต่แสดงเป็นไม่มีหมวด',
    defaultBadge: 'เริ่มต้น',
  },

  debt: {
    title: 'หนี้สิน', totalOutstanding: 'ยอดหนี้คงค้าง', dueSoon: 'ใกล้ครบกำหนด', upcoming: 'หนี้ใกล้ครบกำหนด',
    paid: 'จ่ายแล้ว', unpaid: 'ยังไม่จ่าย', markPaid: 'ทำเครื่องหมายว่าจ่ายแล้ว', markUnpaid: 'ทำเครื่องหมายว่ายังไม่จ่าย',
    addTitle: 'เพิ่มหนี้', editTitle: 'แก้ไขหนี้', creditor: 'เจ้าหนี้', creditorHint: 'เช่น บัตร KTC, สินเชื่อรถ',
    amount: 'จำนวนเงิน', dueDate: 'วันครบกำหนด', note: 'โน้ต', empty: 'ไม่มีหนี้ แตะ + เพื่อเพิ่ม',
    deleteConfirm: 'ลบหนี้รายการนี้?', overdue: 'เกินกำหนด',
    dueInDays: (n) => (n === 0 ? 'ครบกำหนดวันนี้' : `อีก ${n} วัน`),
    allPaid: 'จ่ายครบทุกรายการแล้ว เยี่ยม!', showPaid: 'แสดงที่จ่ายแล้ว',
    repeat: 'ตั้งซ้ำ', category: 'หมวดหมู่', tags: 'แท็ก',
    recur: { none: 'ไม่ซ้ำ', weekly: 'ทุกสัปดาห์', monthly: 'ทุกเดือน', yearly: 'ทุกปี' },
    subsTitle: 'ค่าสมาชิก/บริการ', subsTotal: 'ยอดรวมค่าสมาชิก',
    subsEmpty: 'ยังไม่มีค่าสมาชิก แตะ + เพื่อเพิ่ม',
    subsCount: (n) => `${n} รายการ`,
    nextDue: 'ครบกำหนดถัดไป', payPeriod: 'จ่ายงวดนี้', payConfirm: 'บันทึกการจ่ายนี้เป็นรายจ่าย?',
    sortLabel: 'เรียง', sortExpensive: 'แพงสุด', sortCheap: 'ถูกสุด',
    sortDueSoon: 'ใกล้กำหนดสุด', sortDueLate: 'ไกลกำหนดสุด',
  },

  tax: {
    title: 'คำนวณภาษี', subtitle: 'ภาษีเงินได้บุคคลธรรมดา (ขั้นบันได)',
    annualIncome: 'รายได้ทั้งปี', perYear: 'ปี', infoAria: 'วิธีคิดภาษี',
    extraDeductions: 'ค่าลดหย่อนเพิ่มเติม', extraHint: 'ประกัน, RMF/SSF, เงินบริจาค ฯลฯ',
    calculate: 'คำนวณ', result: 'ภาษีโดยประมาณ', effectiveRate: 'อัตราภาษีที่จ่ายจริง',
    afterTax: 'รายได้หลังหักภาษี', breakdownTitle: 'ค่าลดหย่อน', personal: 'ลดหย่อนส่วนตัว',
    expense: 'หักค่าใช้จ่าย (50% สูงสุด 100k)', extra: 'ค่าลดหย่อนเพิ่มเติม',
    totalDeductions: 'ลดหย่อนรวม', taxableIncome: 'เงินได้สุทธิ', bracketsTitle: 'ภาษีรายขั้น',
    band: 'ช่วง', rate: 'อัตรา', taxedAmount: 'เงินได้', taxAmount: 'ภาษี',
    noTax: 'ไม่มีภาษี — เงินได้สุทธิอยู่ในช่วงยกเว้น',
    disclaimer: 'เป็นค่าประเมินเท่านั้น อัตรา/ค่าลดหย่อนเปลี่ยนได้ทุกปี — ตรวจกับกรมสรรพากร ไม่ใช่คำแนะนำทางภาษี',
  },

  taxInfo: {
    title: 'ภาษีเงินได้บุคคลธรรมดา (คร่าวๆ)',
    formulaTitle: 'คิดยังไง',
    formula: 'ไทยเก็บภาษีแบบขั้นบันได จาก "เงินได้สุทธิ" ไม่ใช่รายได้ทั้งก้อน',
    formulaLine: 'เงินได้สุทธิ = รายได้ทั้งปี − ค่าใช้จ่าย − ค่าลดหย่อน',
    bracketsTitle: 'อัตราขั้นบันได (คิดเฉพาะส่วนที่อยู่ในแต่ละช่วง)',
    thresholdTitle: 'รายได้เท่าไหร่เริ่มเสียภาษี',
    threshold:
      'ด้วยลดหย่อนพื้นฐาน (ค่าใช้จ่าย 50% สูงสุด 100,000 + ส่วนตัว 60,000) รายได้ประมาณ ≤ 25,800 บาท/เดือน (~310,000/ปี) มักไม่ต้องเสียภาษี ยิ่งมีลดหย่อนเพิ่มเพดานยิ่งสูงขึ้น แต่ถ้าเงินได้ทั้งปีเกิน 120,000 ยังต้อง "ยื่นแบบ" แม้ภาษีเป็นศูนย์',
    deductionsTitle: 'ค่าลดหย่อนที่เจอบ่อย',
    deductions:
      'นอกจากส่วนตัว 60,000: คู่สมรสไม่มีรายได้ 60,000, บุตร 30,000/คน, พ่อแม่ 30,000/คน, ประกันสังคม (สูงสุด ~9,000), ประกันชีวิต/สุขภาพ, กองทุน SSF/RMF/Thai ESG, ดอกเบี้ยบ้าน, เงินบริจาค ฯลฯ',
    otherIncomeTitle: 'รายได้อื่นนอกจากเงินเดือน',
    otherIncome:
      'โบนัสนับรวมเป็นเงินเดือน (หัก 50% เพดาน 100,000 เหมือนกัน) ส่วนค่าเช่า/ฟรีแลนซ์/ค้าขาย/วิชาชีพอิสระ หักค่าใช้จ่ายคนละเรต — เครื่องคิดเลขนี้ออกแบบสำหรับเงินเดือน+โบนัส ถ้ามีรายได้ประเภทอื่นตัวเลขจะเป็นค่าประเมินคร่าวๆ',
    usageTitle: 'วิธีใช้หน้านี้',
    usage:
      'ช่อง Annual income ใส่รายได้ทั้งปี (รวมโบนัส) | ช่อง Extra deductions ใส่ผลรวมลดหย่อนอื่นๆ ยกเว้นส่วนตัวกับค่าใช้จ่าย (แอพหักให้อัตโนมัติ) เช่น ประกันสังคม+ประกัน+SSF',
    disclaimer:
      'ข้อมูลนี้เป็นความรู้ทั่วไป ไม่ใช่คำแนะนำทางภาษี อัตรา/ค่าลดหย่อนเปลี่ยนได้ทุกปี ตรวจกับกรมสรรพากร (rd.go.th) ก่อนยื่นจริงเสมอ',
  },

  stock: {
    title: 'การลงทุน', totalValue: 'มูลค่ารวม', today: 'วันนี้', allGainLoss: 'กำไร/ขาดทุนรวม',
    addPortfolio: 'เพิ่มพอร์ต', editPortfolio: 'แก้ไขพอร์ต', portfolioName: 'ชื่อพอร์ต',
    portfolioNameHint: 'เช่น ระยะยาว', note: 'โน้ต',
    emptyPortfolios: 'ยังไม่มีพอร์ต สร้างพอร์ตเพื่อเริ่มติดตามหุ้น',
    deletePortfolioConfirm: 'ลบพอร์ตนี้และหุ้นทั้งหมดในพอร์ต?',
    positions: (n) => `${n} รายการ`,
    holdings: 'หุ้นในพอร์ต', addHolding: 'เพิ่มหุ้น', editHolding: 'แก้ไขหุ้น', symbol: 'สัญลักษณ์',
    symbolHint: 'เช่น AAPL หรือ PTT.BK สำหรับหุ้นไทย', shares: 'จำนวนหุ้น', avgCost: 'ต้นทุนเฉลี่ย/หุ้น',
    currency: 'สกุลเงิน', deleteHoldingConfirm: 'ลบหุ้นตัวนี้?', emptyHoldings: 'ยังไม่มีหุ้น แตะ + เพื่อเพิ่ม',
    refresh: 'รีเฟรช', refreshing: 'กำลังรีเฟรช…', price: 'ราคา', value: 'มูลค่า', cost: 'ต้นทุน',
    updated: 'อัปเดต', notFetched: 'ยังไม่ได้ดึงราคา',
    noKey: 'ใส่ API key หุ้นในตั้งค่าเพื่อดึงราคาล่าสุด',
    fetchError: 'ดึงราคาบางตัวไม่ได้ — ตรวจสัญลักษณ์หรือ API key',
    thaiHint: 'หุ้นไทย (SET) ใช้ .BK ต่อท้าย แผนฟรีอาจไม่ครบ',
    sortLabel: 'เรียง', sortDefault: 'ค่าเริ่มต้น',
    sortGainDesc: 'กำไร: มาก → น้อย', sortGainAsc: 'กำไร: น้อย → มาก',
    sortValueDesc: 'มูลค่า: มาก → น้อย', sortValueAsc: 'มูลค่า: น้อย → มาก',
    sortTodayDesc: 'วันนี้: มาก → น้อย', sortTodayAsc: 'วันนี้: น้อย → มาก',
    showKey: 'แสดงคีย์', hideKey: 'ซ่อนคีย์',
  },

  savings: {
    title: 'เป้าหมายการออม',
    trackSavings: 'ตั้งเป้าหมายการออม →',
    addGoal: 'เพิ่มเป้าหมาย',
    editGoal: 'แก้ไขเป้าหมาย',
    name: 'ชื่อเป้าหมาย',
    nameHint: 'เช่น เงินสำรองฉุกเฉิน',
    target: 'ยอดเป้าหมาย',
    current: 'ออมแล้ว',
    deadline: 'วันที่ตั้งเป้า',
    empty: 'ยังไม่มีเป้าหมาย แตะ + เพื่อตั้ง',
    deleteConfirm: 'ลบเป้าหมายนี้?',
    addFunds: 'เพิ่มเงิน',
    addFundsTitle: 'เพิ่มเงินออม',
    toGo: 'ที่เหลือ',
    reached: 'ถึงเป้าแล้ว! 🎉',
    saved: 'ออมแล้ว',
    totalSaved: 'ออมรวมทั้งหมด',
    daysLeft: (n) => (n < 0 ? 'เลยกำหนดแล้ว' : n === 0 ? 'ครบกำหนดวันนี้' : `เหลืออีก ${n} วัน`),
  },

  settings: {
    title: 'ตั้งค่า', appearance: 'การแสดงผล', darkMode: 'โหมดมืด', hideBalances: 'ซ่อนยอดเงิน',
    language: 'ภาษา', currency: 'สกุลเงินหลัก',
    currencyNote: 'เปลี่ยนสกุลเงินจะเปลี่ยนแค่สัญลักษณ์/รูปแบบ ไม่แปลงตัวเลขข้อมูลเดิม',
    data: 'ข้อมูล', exportExcel: 'ส่งออกเป็น Excel', exportCsv: 'ส่งออกเป็น CSV', importFile: 'นำเข้าจากไฟล์',
    importHint: 'นำเข้าไฟล์สำรอง .xlsx หรือ .csv ที่เคยส่งออก', importDone: 'นำเข้าเสร็จแล้ว',
    importError: 'อ่านไฟล์ไม่ได้ ตรวจว่าเป็นไฟล์ส่งออกจาก MySync',
    lastBackup: 'สำรองล่าสุด', never: 'ยังไม่เคย', about: 'เกี่ยวกับ',
    aboutText: 'MySync เก็บข้อมูลทั้งหมดไว้ในเครื่องนี้เท่านั้น สำรองข้อมูลสม่ำเสมอด้วยการส่งออก',
    stocks: 'หุ้น', stockApiKey: 'API key หุ้น',
    stockApiKeyHint: 'ราคาหุ้นใช้ API key ฟรีของคุณเอง เก็บในเครื่องนี้เท่านั้น ขอ key ฟรีแล้ววางที่นี่',
    getFreeKey: 'ขอ key ฟรี', provider: 'ผู้ให้บริการ', saved: 'บันทึกแล้ว',
    security: 'ความปลอดภัย & แจ้งเตือน', appLock: 'ล็อกแอพ (PIN)', biometric: 'ปลดล็อกด้วยไบโอเมตริก',
    biometricHint: 'ใช้ลายนิ้วมือหรือใบหน้าปลดล็อก (ใช้ PIN สำรองได้)',
    biometricUnavailable: 'อุปกรณ์/เบราว์เซอร์นี้ไม่รองรับไบโอเมตริก',
    biometricFailed: 'ตั้งค่าไบโอเมตริกไม่สำเร็จ ลองใหม่',
    debtReminders: 'แจ้งเตือนหนี้ใกล้ครบ',
    debtRemindersHint: 'แจ้งเตือนเมื่อหนี้เกินกำหนดหรือใกล้ครบ — เช็กตอนเปิดแอพ',
    notifBlocked: 'การแจ้งเตือนถูกปิดในตั้งค่าเบราว์เซอร์',
  },

  lock: {
    setTitle: 'ตั้ง PIN', enterNew: 'ตั้ง PIN 6 หลัก', confirmNew: 'ใส่ PIN อีกครั้ง',
    mismatch: 'PIN ไม่ตรงกัน ลองใหม่', unlockTitle: 'ใส่ PIN', wrong: 'PIN ไม่ถูกต้อง ลองใหม่',
    disableTitle: 'ใส่ PIN เพื่อปิดล็อก', lockedNote: 'MySync ถูกล็อก', useBiometric: 'ใช้ไบโอเมตริก',
  },

  reminder: {
    backupTitle: 'ถึงเวลาสำรองข้อมูล',
    backupBody: 'ไม่ได้สำรองข้อมูลมานานแล้ว ส่งออกข้อมูลเพื่อความปลอดภัย',
    backupAction: 'สำรองเลย',
  },

  notify: {
    debtTitle: 'เตือนหนี้',
    debtOne: (creditor) => `${creditor} ใกล้ครบกำหนด`,
    debtMany: (n) => `มีหนี้ ${n} รายการใกล้ครบ/เกินกำหนด`,
  },
}

const dict = { en, th }

// Active language, updated by <App> from settings.language before children render.
let _lang = 'en'

/** Set the active language (called by App on every render). */
export function setLang(lang) {
  if (dict[lang]) _lang = lang
}

/** Get a specific language's tree (falls back to English). */
export function getStrings(lang) {
  return dict[lang] || dict.en
}

// `strings.x` reads the CURRENT language live. Access it inside render (or an
// effect/handler) so it reflects the active language — not at module top-level.
export const strings = new Proxy(
  {},
  {
    get(_t, key) {
      return (dict[_lang] || dict.en)[key]
    },
  }
)
