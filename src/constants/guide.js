// User-guide content for every feature, in English + Thai.
// GUIDE_META fixes the order + icon (language-agnostic); GUIDE holds the text
// keyed by the same id per language. The Guide page pairs them up.
import {
  LayoutDashboard, Wallet, TrendingUp, Tags, Tag, Landmark, PiggyBank,
  LineChart, Calculator, Users, Bell, Settings as SettingsIcon, Database,
} from 'lucide-react'

export const GUIDE_META = [
  { id: 'dashboard', icon: LayoutDashboard },
  { id: 'records', icon: Wallet },
  { id: 'balance', icon: TrendingUp },
  { id: 'categories', icon: Tags },
  { id: 'tags', icon: Tag },
  { id: 'debt', icon: Landmark },
  { id: 'savings', icon: PiggyBank },
  { id: 'stocks', icon: LineChart },
  { id: 'tax', icon: Calculator },
  { id: 'split', icon: Users },
  { id: 'notifications', icon: Bell },
  { id: 'settings', icon: SettingsIcon },
  { id: 'backup', icon: Database },
]

const th = {
  dashboard: {
    title: 'หน้าหลัก (Dashboard)',
    whatFor: 'ดูภาพรวมการเงินของเดือนนี้ในที่เดียว',
    location: 'แท็บ "หน้าหลัก" ด้านล่างซ้ายสุด (เปิดแอปมาก็เจอเลย)',
    steps: [
      'การ์ด Balance บนสุด = ยอดคงเหลือเดือนนี้ (รายรับ − รายจ่าย) พร้อมยอดรับและจ่ายแยกด้านล่าง แตะเข้าไปดูรายปีได้',
      'การ์ด Investments = มูลค่าพอร์ตหุ้นรวม (ถ้ามี) แตะเข้าไปหน้าหุ้น',
      'การ์ด Savings goals = ความคืบหน้าการออม แตะเข้าไปหน้าเป้าหมาย',
      'กราฟวงกลม "รายจ่ายตามหมวด" = สัดส่วนการใช้เงินเดือนนี้',
      '"รายการล่าสุด" = 10 รายการใหม่สุด แตะเพื่อแก้ไข',
      'ปุ่ม + ลอยมุมขวาล่าง = เพิ่มรายการเร็ว',
      'ไอคอนดวงตามุมขวาบน = ซ่อน/แสดงยอดเงินทั้งแอป · ไอคอนกระดิ่ง = การแจ้งเตือน',
      'ลิงก์ "หารบิลกับเพื่อน" ล่างสุด = เครื่องมือหารค่าใช้จ่าย',
    ],
    notes: ['ตัวเลขทั้งหมดคิดเฉพาะเดือนปัจจุบัน'],
  },
  records: {
    title: 'บันทึกรายรับ-รายจ่าย (Records)',
    whatFor: 'บันทึกเงินเข้า-ออกทุกครั้ง เป็นหัวใจหลักของแอป ยอดอื่นๆ คำนวณจากตรงนี้',
    location: 'แท็บ "รายการ" ด้านล่าง หรือปุ่ม + ลอยที่หน้าหลัก',
    steps: [
      'กดปุ่ม + เพื่อเพิ่มรายการ',
      'เลือกว่าเป็น "รายจ่าย" หรือ "รายรับ"',
      'ใส่จำนวนเงิน (ระบบจะใส่ , คั่นหลักพันให้อัตโนมัติ)',
      'เลือกหมวดหมู่ (เช่น อาหาร, เดินทาง)',
      'เลือกวันที่ · ใส่แท็กและโน้ตเพิ่มได้ (ไม่บังคับ)',
      'กด "บันทึก"',
      'แก้ไข/ลบ: แตะที่รายการนั้นเพื่อเปิดขึ้นมาแก้',
      'ค้นหา/กรอง: ใช้ช่องค้นหาด้านบน หรือปุ่มกรอง (ตามประเภท/หมวด/ช่วงวันที่)',
    ],
    notes: ['รายการเรียงจากใหม่สุดไปเก่าสุดเสมอ'],
  },
  balance: {
    title: 'สรุปรายรับ-จ่ายรายปี (Balance)',
    whatFor: 'ดูรายรับ รายจ่าย และคงเหลือของแต่ละเดือนตลอดทั้งปี',
    location: 'แตะการ์ด Balance ที่หน้าหลัก',
    steps: [
      'ดูกราฟ/ตัวเลขรายรับ-รายจ่ายของแต่ละเดือน',
      'แตะที่เดือนใดเดือนหนึ่งเพื่อดูรายการทั้งหมดของเดือนนั้น',
    ],
  },
  categories: {
    title: 'หมวดหมู่ (Categories)',
    whatFor: 'จัดกลุ่มรายรับ-รายจ่ายเป็นหมวดๆ เพื่อให้ดูกราฟและสรุปได้',
    location: 'หน้า "รายการ" แตะไอคอนปรับแต่ง (เลื่อนแถบ) มุมขวาบน หรือ Settings > จัดการหมวดหมู่',
    steps: [
      'แอปมีหมวดเริ่มต้นให้อยู่แล้ว (อาหาร, เดินทาง, เงินเดือน ฯลฯ)',
      'เพิ่มหมวดใหม่: ตั้งชื่อ เลือกไอคอน เลือกสี และเลือกว่าใช้กับรายจ่าย/รายรับ/ทั้งคู่',
      'แก้ไขหรือลบหมวดที่สร้างเองได้',
    ],
  },
  tags: {
    title: 'แท็ก (Tags)',
    whatFor: 'ติดป้ายรายการเพื่อจัดกลุ่มข้ามหมวด เช่น "ทริปเชียงใหม่" แล้วดูสรุปยอดตามป้ายได้',
    location: 'ติดแท็กตอนสร้างรายการ · ดูสรุปที่หน้า "รายการ" แตะไอคอนแท็กมุมขวาบน',
    steps: [
      'ตอนเพิ่ม/แก้รายการ แตะเลือกแท็กที่มี หรือกด + เพื่อสร้างแท็กใหม่',
      'เปิดหน้าสรุปแท็กเพื่อดูว่าแต่ละแท็กใช้เงินรวมไปเท่าไหร่',
    ],
  },
  debt: {
    title: 'หนี้สิน (Debt)',
    whatFor: 'ติดตามหนี้และรายจ่ายที่ต้องจ่าย แบ่งเป็น 3 แบบให้ตรงกับความเป็นจริง',
    location: 'แท็บ "หนี้สิน" ด้านล่าง',
    steps: [
      'หนี้มี 3 แบบ — เลือกตอนสร้าง: (1) ก้อนเดียว = จ่ายครั้งเดียวจบ เช่น ยืมเพื่อน (2) รายจ่ายประจำ = ค่าเช่า/ค่าไฟ/Netflix จ่ายเรื่อยๆ ไม่มีวันจบ (3) หนี้ผ่อน = ผ่อนรถ/บ้าน มีจำนวนงวดและวันจบ',
      'เพิ่มหนี้ก้อนเดียว: กดปุ่ม + มุมขวาล่าง',
      'เพิ่มรายจ่ายประจำ/หนี้ผ่อน: แตะการ์ด "รายจ่ายประจำ" หรือ "หนี้ผ่อน" แล้วกด + ข้างใน',
      'ในฟอร์มใส่: ยอดเงิน, ความถี่ (สำหรับ 2 แบบหลัง), จำนวนงวด+จ่ายไปแล้วกี่งวด (หนี้ผ่อน), หมวดหมู่ และแท็ก',
      'กดจ่าย: หนี้ก้อนเดียวติ๊กวงกลมซ้ายมือ · รายจ่ายประจำ/หนี้ผ่อนกดปุ่ม "จ่ายงวดนี้" — ทุกครั้งที่จ่าย ระบบจะสร้าง "รายจ่าย" ให้อัตโนมัติ โดยใช้ยอด/หมวด/แท็กจากหนี้',
      'การ์ด Total outstanding = ยอดหนี้จริงที่ค้าง (ก้อนเดียว + ยอดคงเหลือหนี้ผ่อน) พร้อมบรรทัด "จ่ายครั้งถัดไป" ที่ใกล้สุด',
      'เรียงหนี้ก้อนเดียวได้: ใกล้กำหนด/ไกลกำหนด/แพงสุด/ถูกสุด',
    ],
    example: `ผ่อนรถ ฿8,000/เดือน ทั้งหมด 48 งวด จ่ายไปแล้ว 12 งวด
→ ระบบโชว์ ผ่อนไป 12/48 (25%) และยอดคงเหลือ ฿288,000
กดจ่ายงวดนี้ 1 ครั้ง → กลายเป็น 13/48, คงเหลือ ฿280,000 และมีรายจ่าย ฿8,000 เข้า Records`,
    notes: [
      'กดจ่ายหนี้ก้อนเดียวผิด กดที่วงกลมซ้ำเพื่อยกเลิก — ระบบจะลบรายจ่ายที่สร้างไปด้วย',
      'หนี้ผ่อนพอครบทุกงวดจะย้ายไปกลุ่ม "ผ่อนครบแล้ว" อัตโนมัติ',
      'รายจ่ายประจำไม่นับเป็นยอดหนี้ค้าง (เพราะไม่มีต้นค้าง)',
    ],
  },
  savings: {
    title: 'เป้าหมายการออม (Savings goals)',
    whatFor: 'ตั้งเป้าเก็บเงินและติดตามความคืบหน้าไปทีละนิด',
    location: 'การ์ด "Savings goals" ที่หน้าหลัก',
    steps: [
      'กดปุ่ม + เพื่อตั้งเป้าใหม่: ใส่ชื่อเป้า, ยอดเป้าหมาย, ยอดที่ออมแล้ว และวันที่ตั้งเป้า (ไม่บังคับ)',
      'กดปุ่ม "เพิ่มเงิน" ที่การ์ดเป้าเมื่อออมเงินเพิ่ม',
      'ดูแถบความคืบหน้าและจำนวนวันที่เหลือ',
      'แตะการ์ดเป้าเพื่อแก้ไขหรือลบ',
    ],
  },
  stocks: {
    title: 'พอร์ตหุ้น (Investments)',
    whatFor: 'ติดตามหุ้นที่ถือ มูลค่า และกำไร/ขาดทุน โดยดึงราคาจริงมาให้',
    location: 'การ์ด "Investments" ที่หน้าหลัก',
    steps: [
      'ก่อนอื่นใส่ API key ฟรีที่ Settings > Stock API key เพื่อให้ดึงราคาได้ (มีลิงก์ขอ key ให้)',
      'สร้างพอร์ต (เช่น พอร์ตระยะยาว)',
      'เพิ่มหุ้นในพอร์ต: ใส่สัญลักษณ์ (เช่น AAPL), จำนวนหุ้น, สกุลเงิน และต้นทุนเฉลี่ยต่อหุ้น',
      'กดปุ่มรีเฟรชเพื่อดึงราคาล่าสุด',
      'เรียงหุ้นในพอร์ตได้: กำไร/มูลค่า/กำไรวันนี้ มาก↔น้อย',
    ],
    notes: [
      'ราคาต่อหุ้นแสดงเป็นสกุลเดิม (เช่น USD) แต่มูลค่ารวมแปลงเป็นบาทให้ (โชว์ทั้งบาทและสกุลเดิม)',
      'กำไร/ขาดทุนแสดงเป็นบาทและเปอร์เซ็นต์',
      'หุ้นไทยใช้ .BK ต่อท้าย เช่น PTT.BK (แผนฟรีอาจไม่ครบทุกตัว)',
    ],
  },
  tax: {
    title: 'คำนวณภาษี (Tax)',
    whatFor: 'ประมาณภาษีเงินได้บุคคลธรรมดาแบบขั้นบันไดของไทย',
    location: 'แท็บ "ภาษี" ด้านล่าง',
    steps: [
      'ใส่รายได้ทั้งปี',
      'ใส่ค่าลดหย่อนเพิ่มเติม (ประกัน, กองทุน, บริจาค ฯลฯ)',
      'กด "คำนวณ" เพื่อดูภาษีโดยประมาณ, อัตราที่แท้จริง และรายละเอียดแต่ละขั้น',
      'แตะไอคอน i เพื่ออ่านคำอธิบายวิธีคิดภาษีคร่าวๆ',
    ],
    notes: ['เป็นตัวเลขประมาณการเท่านั้น อัตรา/ค่าลดหย่อนเปลี่ยนได้ทุกปี ควรตรวจกับกรมสรรพากรอีกที'],
  },
  split: {
    title: 'หารค่าใช้จ่าย (หารบิลกับเพื่อน)',
    whatFor: 'ช่วยหารเงินเวลาไปกินข้าว/ปาร์ตี้กับเพื่อนหลายคน แต่ละคนกินไม่เหมือนกัน',
    location: 'หน้าหลัก เลื่อนลงล่างสุด แตะลิงก์ "หารบิลกับเพื่อน →"',
    steps: [
      'เพิ่มคนที่หาร: พิมพ์ชื่อในช่องแล้วกด "เพิ่มชื่อ" (หรือ Enter) เพิ่มได้หลายคน กดกากบาทข้างชื่อเพื่อลบ',
      'เพิ่มรายการ: กด "เพิ่มรายการ" ใส่ชื่อ (ไม่บังคับ) และราคา',
      'ติ๊กว่าใครหารรายการนั้น: ใต้แต่ละรายการมีปุ่มชื่อทุกคน (ติ๊กครบไว้ก่อน) แตะเลือก/ยกเลิกให้เหลือเฉพาะคนที่กินจริง',
      'ดูผล: ด้านล่างโชว์ยอดรวมทั้งบิลและยอดที่แต่ละคนต้องจ่าย',
      'กด "ล้างทั้งหมด" มุมขวาบนเพื่อเริ่มใหม่',
    ],
    example: `ไปกิน 3 คน (เอ, บี, ซี)
หมูกระทะ ฿900 กินทั้ง 3 คน = คนละ ฿300
เบียร์ ฿400 เอกับบีกินแค่ 2 คน = คนละ ฿200
สรุป: เอ ฿500 · บี ฿500 · ซี ฿300 · รวม ฿1,300`,
    notes: [
      'ถ้ามีรายการที่ยังไม่ติ๊กใครเลย ระบบจะเตือน (ยอดนั้นยังไม่ถูกหาร)',
      'เป็นเครื่องคิดเลขใช้แล้วทิ้ง ปิดหน้าแล้วข้อมูลหาย และไม่ถูกบันทึกเป็นรายรับ-รายจ่าย',
    ],
  },
  notifications: {
    title: 'การแจ้งเตือน (กระดิ่ง)',
    whatFor: 'รวมสิ่งที่ต้องสนใจไว้ที่เดียว จะได้ไม่พลาดกำหนดจ่าย',
    location: 'ไอคอนกระดิ่งมุมขวาบน ที่หน้าหลักและหน้าหนี้สิน',
    steps: [
      'ตัวเลขสีแดงบนกระดิ่ง = จำนวนเรื่องที่ต้องสนใจ',
      'แตะกระดิ่งเพื่อเปิดรายการ: หนี้/งวดที่ใกล้ครบกำหนด (ภายใน 14 วัน) หรือเกินกำหนด ทั้ง 3 ประเภท และการเตือนสำรองข้อมูล',
      'แตะแต่ละแถวเพื่อกระโดดไปหน้าที่เกี่ยวข้อง',
    ],
    notes: ['รายการเกินกำหนดจะขึ้นสีแดง'],
  },
  settings: {
    title: 'ตั้งค่า & ความปลอดภัย (Settings)',
    whatFor: 'ปรับแต่งแอปและตั้งค่าความปลอดภัย',
    location: 'แท็บ "ตั้งค่า" ด้านล่างขวาสุด',
    steps: [
      'โหมดมืด: สลับธีมสว่าง/มืด',
      'ซ่อนยอดเงิน: ปิดบังตัวเลขเงินทั้งแอป',
      'ภาษา: สลับไทย/อังกฤษ',
      'สกุลเงินหลัก: เปลี่ยนสัญลักษณ์เงินที่แสดง',
      'ล็อกด้วย PIN: ตั้งรหัส 6 หลักล็อกแอป · เปิดปลดล็อกด้วยลายนิ้วมือ/ใบหน้าได้ (ถ้าเครื่องรองรับ)',
      'เตือนหนี้: เปิดแจ้งเตือนเมื่อมีหนี้ใกล้/เกินกำหนด',
      'Stock API key: ใส่คีย์เพื่อดึงราคาหุ้น (มีปุ่มตาซ่อน/แสดงคีย์)',
    ],
    notes: ['PIN เป็นการล็อกกันคนแอบดูเท่านั้น ไม่ใช่การเข้ารหัสข้อมูล'],
  },
  backup: {
    title: 'สำรอง & นำเข้าข้อมูล (Backup)',
    whatFor: 'สำรองข้อมูลไว้กันหาย หรือย้ายไปเครื่องอื่น',
    location: 'Settings > หมวด Data',
    steps: [
      'Export to Excel: ได้ไฟล์ครบทุกอย่าง (รายการ, หมวด, แท็ก, หนี้, หุ้น, เป้าออม) — แนะนำใช้อันนี้',
      'Export to CSV: ได้เฉพาะรายการรับ-จ่าย',
      'Import from file: เลือกไฟล์ที่เคย export ไว้เพื่อกู้ข้อมูลกลับ',
    ],
    notes: [
      'ข้อมูลทั้งหมดเก็บในเครื่องของคุณเท่านั้น (ไม่มีเซิร์ฟเวอร์) — ควร backup เป็นประจำ',
      'แอปจะเตือนให้ backup อัตโนมัติถ้าไม่ได้สำรองเกิน 14 วัน',
    ],
  },
}

const en = {
  dashboard: {
    title: 'Home (Dashboard)',
    whatFor: "See this month's finances at a glance.",
    location: 'The "Dashboard" tab at the bottom (the first screen on open).',
    steps: [
      'Balance card (top) = this month’s balance (income − expense), with income and expense below. Tap it for the yearly view.',
      'Investments card = total portfolio value (if any). Tap to open the stocks page.',
      'Savings goals card = your saving progress. Tap to open goals.',
      'Spending donut = where this month’s money went, by category.',
      'Recent transactions = the 10 newest; tap one to edit.',
      'The floating + button = quick add a transaction.',
      'Eye icon (top right) = hide/show all money · Bell icon = notifications.',
      'The "Split a bill with friends" link at the bottom = the bill splitter.',
    ],
    notes: ['All figures cover the current month only.'],
  },
  records: {
    title: 'Records (income & expenses)',
    whatFor: 'Log every bit of money in and out. This is the core — other totals are built from it.',
    location: 'The "Records" tab, or the floating + on the Dashboard.',
    steps: [
      'Tap + to add an entry.',
      'Choose "Expense" or "Income".',
      'Enter the amount (thousands separators are added automatically).',
      'Pick a category (e.g. Food, Transport).',
      'Pick a date · add tags and a note if you like (optional).',
      'Tap "Save".',
      'Edit/delete: tap an entry to open and change it.',
      'Search/filter: use the search box up top, or the filter button (by type / category / date range).',
    ],
    notes: ['Entries are always sorted newest first.'],
  },
  balance: {
    title: 'Yearly income vs expense (Balance)',
    whatFor: 'See income, expense and balance for every month across the year.',
    location: 'Tap the Balance card on the Dashboard.',
    steps: [
      'View each month’s income/expense figures.',
      'Tap a month to see all of that month’s transactions.',
    ],
  },
  categories: {
    title: 'Categories',
    whatFor: 'Group income & expenses into categories so charts and summaries work.',
    location: 'Records page → sliders icon (top right), or Settings > Manage categories.',
    steps: [
      'The app ships with default categories (Food, Transport, Salary, etc.).',
      'Add one: set a name, icon, color, and whether it’s for expense/income/both.',
      'Edit or delete the ones you created.',
    ],
  },
  tags: {
    title: 'Tags',
    whatFor: 'Label entries to group across categories (e.g. "Chiang Mai trip") and see totals per tag.',
    location: 'Add tags while creating an entry · see the summary via the tag icon on the Records page.',
    steps: [
      'When adding/editing an entry, tap existing tags or + to create a new one.',
      'Open the tag summary to see how much each tag adds up to.',
    ],
  },
  debt: {
    title: 'Debts',
    whatFor: 'Track debts and dues, split into 3 kinds that match real life.',
    location: 'The "Debt" tab at the bottom.',
    steps: [
      'Three kinds — pick when adding: (1) One-time = pay once, e.g. money borrowed. (2) Recurring = rent / utilities / Netflix, paid forever. (3) Installment = a loan you pay off (car/house) with a set number of installments and an end.',
      'Add a one-time debt: the floating + button.',
      'Add recurring / installment: tap the "Recurring" or "Installments" card, then + inside.',
      'In the form set: amount, frequency (for the latter two), number of installments + how many already paid (installment), category and tags.',
      'Pay: one-time = tick the left circle · recurring/installment = the "Pay" button — every payment auto-creates an expense using the debt’s amount/category/tags.',
      'Total outstanding card = real remaining debt (one-time + installment balance), plus a "Next payment" line for the soonest due.',
      'Sort one-time debts: due soonest/latest, most/least expensive.',
    ],
    example: `Car loan ฿8,000/month, 48 installments, 12 already paid
→ shows 12/48 (25%) and a remaining balance of ฿288,000
Pay one installment → becomes 13/48, ฿280,000 left, and a ฿8,000 expense lands in Records`,
    notes: [
      'Paid a one-time debt by mistake? Tap the circle again to undo — the created expense is removed too.',
      'An installment loan moves to "Paid off" automatically once every installment is paid.',
      'Recurring bills don’t count as outstanding debt (no principal owed).',
    ],
  },
  savings: {
    title: 'Savings goals',
    whatFor: 'Set savings targets and track progress bit by bit.',
    location: 'The "Savings goals" card on the Dashboard.',
    steps: [
      'Tap + to set a goal: name, target amount, amount saved so far, and a target date (optional).',
      'Tap "Add money" on a goal card whenever you save more.',
      'Watch the progress bar and days left.',
      'Tap a goal card to edit or delete it.',
    ],
  },
  stocks: {
    title: 'Investments (stocks)',
    whatFor: 'Track the stocks you hold, their value and gain/loss, using real prices.',
    location: 'The "Investments" card on the Dashboard.',
    steps: [
      'First add a free API key in Settings > Stock API key so prices can be fetched (a link to get one is provided).',
      'Create a portfolio (e.g. Long-term).',
      'Add a holding: symbol (e.g. AAPL), shares, currency, and average cost per share.',
      'Tap refresh to pull the latest prices.',
      'Sort holdings: by gain / value / today’s change, high↔low.',
    ],
    notes: [
      'Per-share price stays in its own currency (e.g. USD), but total value is converted to THB (shows both).',
      'Gain/loss is shown in THB and percent.',
      'Thai stocks use a .BK suffix, e.g. PTT.BK (free plans may not cover every symbol).',
    ],
  },
  tax: {
    title: 'Tax calculator',
    whatFor: 'Estimate Thai personal income tax (progressive brackets).',
    location: 'The "Tax" tab at the bottom.',
    steps: [
      'Enter your annual income.',
      'Enter extra deductions (insurance, funds, donations, etc.).',
      'Tap "Calculate" to see estimated tax, effective rate, and a per-bracket breakdown.',
      'Tap the i icon for a short explanation of how tax is worked out.',
    ],
    notes: ['Estimate only — rates and allowances change yearly; verify with the Revenue Department.'],
  },
  split: {
    title: 'Split the bill',
    whatFor: 'Split a bill among several friends when everyone ordered different things.',
    location: 'Dashboard, scroll to the bottom, tap "Split a bill with friends →".',
    steps: [
      'Add people: type a name and tap "Add name" (or Enter). Add several; tap the × by a name to remove.',
      'Add items: tap "Add item", enter a name (optional) and a price.',
      'Tick who shared each item: every name shows under the item (all ticked by default) — toggle to leave only who actually shared it.',
      'See the result: the total bill and what each person owes appear below.',
      'Tap "Clear all" (top right) to start over.',
    ],
    example: `3 people (A, B, C)
Hot pot ฿900 shared by all 3 = ฿300 each
Beer ฿400 shared by A and B only = ฿200 each
Result: A ฿500 · B ฿500 · C ฿300 · total ฿1,300`,
    notes: [
      'If an item has nobody ticked, you’ll get a warning (that amount isn’t split yet).',
      'It’s a throwaway calculator — data is lost when you leave, and nothing is saved as income/expense.',
    ],
  },
  notifications: {
    title: 'Notifications (bell)',
    whatFor: 'Everything that needs attention in one place, so you never miss a due date.',
    location: 'The bell icon (top right) on the Dashboard and the Debt page.',
    steps: [
      'The red number on the bell = how many things need attention.',
      'Tap the bell to open the list: debts/installments due within 14 days or overdue (all 3 kinds), plus a backup reminder.',
      'Tap a row to jump to the relevant page.',
    ],
    notes: ['Overdue items are shown in red.'],
  },
  settings: {
    title: 'Settings & security',
    whatFor: 'Customize the app and set up security.',
    location: 'The "Settings" tab (bottom right).',
    steps: [
      'Dark mode: switch between light/dark theme.',
      'Hide balances: mask all money figures across the app.',
      'Language: switch Thai/English.',
      'Primary currency: change the money symbol shown.',
      'App lock (PIN): set a 6-digit lock · optionally unlock with fingerprint/face (if supported).',
      'Debt reminders: get notified about upcoming/overdue debts.',
      'Stock API key: enter a key to fetch stock prices (with a show/hide eye button).',
    ],
    notes: ['The PIN is a casual lock to stop snooping — it does not encrypt your data.'],
  },
  backup: {
    title: 'Backup & import',
    whatFor: 'Back up your data or move it to another device.',
    location: 'Settings > Data section.',
    steps: [
      'Export to Excel: a full file (transactions, categories, tags, debts, stocks, goals) — recommended.',
      'Export to CSV: transactions only.',
      'Import from file: pick a file you exported before to restore.',
    ],
    notes: [
      'All data lives only on your device (no server) — back up regularly.',
      'The app reminds you to back up if it’s been over 14 days.',
    ],
  },
}

export const GUIDE = { en, th }
