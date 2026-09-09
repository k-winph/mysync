# Personal Finance Manager (PWA) — Project Instructions

> เอกสารนี้คือ "สมองกลาง" ของโปรเจกต์ ใช้เป็น context/instructions ให้ AI assistant
> (เช่นใน Cowork) เข้าใจว่าเรากำลังสร้างอะไร ด้วยอะไร และตามลำดับไหน
> อ่านทั้งฉบับก่อนเริ่มลงมือทุกครั้ง

---

## 0. บทบาทของผู้ช่วย (Your Role)

You are an **expert Frontend Developer** acting as the technical partner for this
project. Your responsibilities:

- **เขียนโค้ดคุณภาพสูง** ด้วย React + Vite + Tailwind — สะอาด อ่านง่าย คอมเมนต์
  ตรงจุดที่ซับซ้อน ไม่ over-engineer
- **ทำทีละส่วนตามเฟส** อย่ากระโดดไปทำฟีเจอร์เฟสหลังก่อนเฟส 1 เสร็จ เว้นแต่เจ้าของ
  โปรเจกต์สั่ง
- **อธิบายก่อนลงมือ** เมื่อจะตัดสินใจเชิงสถาปัตยกรรม อธิบายเหตุผลสั้นๆ ก่อน แล้ว
  ค่อยเขียนโค้ด
- **ถามเมื่อไม่ชัด** ถ้า requirement กำกวม ถามก่อน อย่าเดาแล้วทำยาว
- **รักษาความเรียบง่าย** โปรเจกต์นี้เป็นแอพส่วนตัว ใช้คนเดียว — เลือกทางที่เริ่มได้เร็ว
  และพังยากเสมอ เมื่อมีทางเลือกระหว่าง "เท่แต่ซับซ้อน" กับ "เรียบง่ายแต่ได้ผล" ให้เลือก
  อย่างหลัง
- **สื่อสารเป็นภาษาไทย** กับเจ้าของโปรเจกต์ แต่โค้ด/ตัวแปร/คอมเมนต์ในโค้ดเป็น
  ภาษาอังกฤษ
- **เตือนเรื่องขอบเขต** ถ้าเจ้าของโปรเจกต์เริ่มอยากเพิ่มฟีเจอร์เกินเฟสที่ทำอยู่ ให้เตือน
  อย่างสุภาพว่ามันจะทำให้แอพไม่เสร็จ และเสนอให้จดไว้ทำทีหลัง

---

## 1. ภาพรวมโปรเจกต์ (What We're Building)

**ชื่อชั่วคราว:** Personal Finance Manager
**ประเภท:** Progressive Web App (PWA) — ติดตั้งลงหน้าจอมือถือได้เหมือนแอพเนทีฟ
**ผู้ใช้:** เจ้าของคนเดียว (personal use) ใช้บนมือถือเป็นหลัก
**แนวคิด:** แดชบอร์ดการเงินส่วนตัวที่รวมเครื่องมือจัดการเงินไว้ในที่เดียว ตอบคำถาม
2 ข้อหลัก — "เดือนนี้เงินไปไหนหมด?" และ "การลงทุน/หนี้สินของฉันเป็นยังไง?"

**หลักการสำคัญ:**
- ข้อมูลทั้งหมดเก็บในเครื่องผู้ใช้ (privacy-first, offline-first)
- ไม่มีระบบหลังบ้าน ไม่มีบัญชีผู้ใช้ ไม่มี login (ยกเว้น PIN ล็อกแอพในเครื่อง)
- Backup/ย้ายเครื่องผ่านการ Export/Import ไฟล์
- Deploy ฟรีบน GitHub Pages

---

## 2. Tech Stack (ล็อกแล้ว)

### แกนหลัก
| ส่วน | เทคโนโลยี | เหตุผล |
|---|---|---|
| Framework | **React + Vite** | build เร็ว ตั้งค่าน้อย เหมาะกับ PWA |
| Styling | **Tailwind CSS** | เขียน UI เร็ว mobile-first |
| Routing | **React Router** | สลับหน้าในแอพ |

### จัดการข้อมูล
| ส่วน | เทคโนโลยี | เหตุผล |
|---|---|---|
| State management | **Zustand** (+ `persist` middleware) | เบา เขียนง่าย เซฟลง localStorage อัตโนมัติ |
| ที่เก็บถาวร | **localStorage** (ผ่าน persist ของ Zustand) | ไม่เก็บรูป → localStorage เพียงพอ ไม่ต้องใช้ IndexedDB |

### PWA
| ส่วน | เทคโนโลยี |
|---|---|
| PWA setup | **vite-plugin-pwa** (manifest + service worker + notification) |

### Library เสริม (ทยอยติดตั้งตามเฟสที่ใช้จริง)
| ใช้ทำอะไร | Library |
|---|---|
| กราฟ (รายจ่าย/เปรียบเทียบเดือน) | **Recharts** |
| Export/Import Excel | **SheetJS (xlsx)** |
| Export/Import CSV | **PapaParse** |
| ไอคอน | **lucide-react** |
| จัดการวันที่ | **day.js** |
| ระบบ 2 ภาษา (เฟส 3) | **i18next / react-i18next** |

### Deploy
**GitHub Pages** + **gh-pages** package

### ข้อควรระวังด้านเทคนิค
- `base` ใน `vite.config.js` ต้องตั้งเป็นชื่อ repo (เช่น `/finance-app/`) ไม่งั้น
   path จะพังบน GitHub Pages
- `basename` ใน React Router ต้องตรงกับ `base` ข้างบน
- Service Worker ทำงานเฉพาะบน HTTPS (GitHub Pages เป็น HTTPS อยู่แล้ว) และ
  ทดสอบ install จริงต้องรัน `npm run build && npm run preview` ไม่ใช่ dev mode
- **ภาษา:** เริ่มด้วยภาษาอังกฤษก่อน แต่แยกข้อความ UI ออกมาเป็นที่เดียว (เช่นไฟล์
  `constants/strings.js`) เพื่อให้เติมภาษาไทยทีหลังได้ง่าย ไม่ต้องรื้อ

---

## 3. Data Schema (โครงสร้างข้อมูล)

### กติกากลางที่ใช้กับทุกตาราง
- ทุก record มี `id` (string, สร้างอัตโนมัติ เช่น `crypto.randomUUID()`),
  `createdAt`, `updatedAt` (ISO string) — ไม่เขียนซ้ำในแต่ละตารางด้านล่าง แต่มีติดทุกอัน
- **เงินเก็บเป็นจำนวนเต็มหน่วยสตางค์** (เช่น 100.50 บาท → เก็บเป็น `10050`)
  เพื่อเลี่ยงปัญหาทศนิยมเพี้ยน หารด้วย 100 ตอนแสดงผลเท่านั้น
- วันที่เก็บเป็น ISO string (เช่น `"2026-09-09"`)

### 3.1 Transaction (รายรับ-รายจ่าย) — หัวใจของแอพ
| Field | Type | คำอธิบาย |
|---|---|---|
| `id` | string | รหัสอัตโนมัติ |
| `type` | `"income"` \| `"expense"` | รับ หรือ จ่าย |
| `amount` | number | จำนวนเงิน (สตางค์) |
| `categoryId` | string | อ้างอิง Category |
| `tags` | string[] | แท็ก เช่น `["ทริปเชียงใหม่"]` |
| `note` | string | โน้ตเพิ่มเติม (ไม่บังคับ) |
| `date` | string | วันที่เกิดรายการ (ISO) |
| `currency` | string | สกุลเงิน เช่น `"THB"` — เฟส 3 |
| `recurringId` | string \| null | ถ้ามาจากรายการซ้ำ อ้างอิงกลับ — เฟส 2 |

*เฟส 1 ใช้จริง: type, amount, categoryId, tags, note, date*

### 3.2 Category (หมวดหมู่) — เพิ่มเองได้
| Field | Type | คำอธิบาย |
|---|---|---|
| `id` | string | รหัสอัตโนมัติ |
| `name` | string | ชื่อหมวด เช่น `"Food"` |
| `type` | `"income"` \| `"expense"` \| `"both"` | ใช้กับรายรับ/จ่าย/ทั้งคู่ |
| `icon` | string | ชื่อไอคอน lucide เช่น `"utensils"` |
| `color` | string | สีประจำหมวด เช่น `"#f97316"` (ใช้ในกราฟ) |
| `isDefault` | boolean | หมวดแถมมา หรือผู้ใช้สร้างเอง |

*ตอนเปิดแอพครั้งแรก seed หมวด default ชุดหนึ่ง (Food, Transport, Shopping,
Salary ฯลฯ) แล้วผู้ใช้เพิ่มเองได้*

### 3.3 Debt (หนี้สิน)
| Field | Type | คำอธิบาย |
|---|---|---|
| `id` | string | รหัสอัตโนมัติ |
| `creditor` | string | เจ้าหนี้/ที่ไหน เช่น `"บัตร KTC"` |
| `amount` | number | ยอดหนี้ (สตางค์) |
| `dueDate` | string | วันครบกำหนด (ISO) |
| `isPaid` | boolean | จ่ายแล้วหรือยัง |
| `note` | string | โน้ต (ไม่บังคับ) |

### 3.4 Portfolio (พอร์ตหุ้น) — แรงบันดาลใจจากหน้า "สินทรัพย์" ของแอพ Dime
| Field | Type | คำอธิบาย |
|---|---|---|
| `id` | string | รหัสอัตโนมัติ |
| `name` | string | ชื่อพอร์ต เช่น `"พอร์ตระยะยาว"` |
| `type` | string | default `"stock"` (เผื่ออนาคต เช่น ทอง/คริปโต) |
| `note` | string | คำอธิบาย (ไม่บังคับ) |

### 3.5 Holding (หุ้นในพอร์ต)
| Field | Type | คำอธิบาย |
|---|---|---|
| `id` | string | รหัสอัตโนมัติ |
| `portfolioId` | string | อยู่พอร์ตไหน (อ้างอิง Portfolio) |
| `symbol` | string | เช่น `"AAPL"`, `"PTT"` |
| `shares` | number | จำนวนที่ถือ |
| `avgCost` | number | ต้นทุนเฉลี่ยต่อหน่วย (สตางค์) |
| `currency` | string | `"USD"` / `"THB"` |
| `lastPrice` | number \| null | ราคาล่าสุดที่ดึงได้ (cache ไว้แสดงทันที) |
| `lastPriceAt` | string \| null | ดึงราคาล่าสุดเมื่อไหร่ |

### 3.6 Recurring (รายการซ้ำประจำ) — เฟส 2
| Field | Type | คำอธิบาย |
|---|---|---|
| `id` | string | รหัสอัตโนมัติ |
| `type` | `"income"` \| `"expense"` | รับ/จ่าย |
| `amount` | number | จำนวนเงิน (สตางค์) |
| `categoryId` | string | หมวดหมู่ |
| `note` | string | โน้ต |
| `frequency` | `"monthly"` \| `"weekly"` | ความถี่ |
| `dayOfMonth` | number | เกิดวันที่เท่าไหร่ของเดือน |
| `isActive` | boolean | เปิด/ปิดการทำงาน |

*พอถึงวัน แอพสร้าง Transaction ใหม่จากแม่แบบนี้ แล้วผูก `recurringId` กลับมา*

### 3.7 SavingsGoal (เป้าหมายการออม) — เฟส 3
| Field | Type | คำอธิบาย |
|---|---|---|
| `id` | string | รหัสอัตโนมัติ |
| `name` | string | ชื่อเป้า เช่น `"ดาวน์รถ"` |
| `targetAmount` | number | เป้าหมาย (สตางค์) |
| `currentAmount` | number | ตอนนี้เก็บได้เท่าไหร่ |
| `deadline` | string \| null | วันที่ตั้งใจให้ถึงเป้า (ไม่บังคับ) |

### 3.8 Settings (ตั้งค่าแอพ — มี record เดียว)
| Field | Type | คำอธิบาย |
|---|---|---|
| `theme` | `"light"` \| `"dark"` | ธีม |
| `language` | `"en"` \| `"th"` | ภาษา (เริ่ม `"en"`) |
| `primaryCurrency` | string | สกุลเงินหลัก เช่น `"THB"` |
| `hideBalances` | boolean | ซ่อนยอดเงินด้วยรูปตา 👁 |
| `pinEnabled` | boolean | เปิดล็อก PIN มั้ย |
| `pinHash` | string \| null | PIN แบบเข้ารหัส (ไม่เก็บตรงๆ) |
| `lastBackupAt` | string \| null | backup ครั้งล่าสุด (ไว้เตือน) |

### ความสัมพันธ์
```
Category ──< Transaction >── Recurring
                  │
              (tags: string[])

Portfolio ──< Holding
Debt          (อิสระ)
SavingsGoal   (อิสระ)
Settings      (record เดียว ครอบทั้งแอพ)
```

---

## 4. รายการฟีเจอร์ทั้งหมด (20 อย่าง)

### ฟีเจอร์หลัก 4 เสา
1. **Stock Portfolio** — แยกพอร์ตได้ ตั้งชื่อพอร์ต ดูราคาขึ้น/ลง กำไร/ขาดทุน
   (โครงแบบหน้า "สินทรัพย์" ของ Dime) เตรียมต่อ Stock API
2. **Tax Calculator** — คำนวณภาษีเงินได้บุคคลธรรมดาแบบขั้นบันได (ไทย)
3. **บันทึกรายรับ-รายจ่าย** — มีหมวดหมู่ + เพิ่มหมวดเองได้
4. **จัดการหนี้สิน** — เพิ่มทีละรายการ: เจ้าหนี้ / ยอด / วันครบกำหนด

### ระบบภาพรวม & การเงิน
5. **Dashboard** สรุปภาพรวม (รับ-จ่ายเดือนนี้, มูลค่าพอร์ต, หนี้ใกล้ครบกำหนด)
6. **กราฟรายจ่ายตามหมวดหมู่**
7. **สรุปยอดหนี้รวม**
8. **กำไร/ขาดทุนรวมทั้งพอร์ตหุ้น (%)**
9. **เป้าหมายการออม** (Savings Goal) พร้อม progress bar
10. **สรุปเปรียบเทียบเดือนต่อเดือน (%)**

### ระบบช่วยจัดการ
11. **ค้นหา + กรองรายการ** (ตามวันที่/หมวดหมู่)
12. **แท็ก (Tags)** — เช่น `#ทริปเชียงใหม่` ดูยอดรวมตามแท็ก
13. **รายการที่เกิดซ้ำประจำ** (Recurring)
14. **บันทึกโน้ตในแต่ละรายการ** (แนบรูปใบเสร็จ — **ตัดออกแล้ว**)
15. **Widget/ปุ่มลัดบันทึกเร็ว**

### แจ้งเตือน & ความปลอดภัย
16. **แจ้งเตือนหนี้ใกล้ครบกำหนด** (PWA notification)
17. **เตือน backup เป็นระยะ**
18. **ล็อกแอพด้วย PIN**

### ปรับแต่ง & อำนวยความสะดวก
19. **Dark/Light mode**
20. **หลายสกุลเงิน + เลือกภาษา ไทย/อังกฤษ**

### รายการรอ (ยังไม่เลือกทำ)
- คำนวณดอกเบี้ยหนี้

---

## 5. แผนการทำแบบแบ่งเฟส (Roadmap)

> **กฎเหล็ก:** ทำเฟส 1 ให้เสร็จและใช้งานได้จริงก่อน ค่อยขยับไปเฟส 2

### เฟส 1 — แกนหลักให้ใช้ได้จริง (MVP)
- ตั้งโปรเจกต์ (Vite + Tailwind + Zustand) + วางโครงโฟลเดอร์
- Zustand store + persist ลง localStorage
- **บันทึกรายรับ-รายจ่าย** (หมวดหมู่ + เพิ่มหมวดเอง + แท็ก + โน้ต)
- **Dashboard** สรุปเดือนนี้ (รับ/จ่าย/คงเหลือ)
- **Dark mode**
- **Export/Import** (Excel/CSV)
- PWA setup (ติดตั้งลงมือถือได้)

### เฟส 2 — เติมความสะดวก
- ค้นหา/กรองรายการ
- กราฟรายจ่ายตามหมวด
- Recurring
- แท็ก (ดูยอดรวมตามแท็ก)
- เปรียบเทียบเดือนต่อเดือน
- ปุ่มลัดบันทึกเร็ว
- Stock Portfolio (แยกพอร์ต + ดึงราคา)
- Tax Calculator
- จัดการหนี้ + สรุปหนี้รวม

### เฟส 3 — ลูกเล่น & ปรับแต่ง
- แจ้งเตือนหนี้ใกล้ครบกำหนด
- เตือน backup เป็นระยะ
- ล็อก PIN
- หลายสกุลเงิน
- เลือกภาษา ไทย/อังกฤษ (i18next)
- กำไร/ขาดทุนรวมพอร์ต
- เป้าหมายการออม
- สรุปสำหรับยื่นภาษี (ดึงรายได้ทั้งปี → Tax Calculator อัตโนมัติ)

---

## 6. หน้า "Stock Portfolio" — สเปกละเอียด (อ้างอิงแอพ Dime)

### หน้ารวมพอร์ต (Assets)
- ด้านบนสุด: **มูลค่าสินทรัพย์รวมทุกพอร์ต** + ปุ่ม 👁 ซ่อน/แสดงยอด
- แสดงการเปลี่ยนแปลงวันนี้: ▲ เขียว (กำไร) / ▼ แดง (ขาดทุน) เป็นจำนวนเงินและ %
- รายการพอร์ต แต่ละพอร์ตโชว์: ชื่อพอร์ต, มูลค่ารวมพอร์ต, %เปลี่ยนแปลงวันนี้ (เขียว/แดง)
- ปุ่ม "+ เพิ่มพอร์ต"

### หน้าในพอร์ต (กดเข้าไป)
- รายการหุ้นแต่ละตัว: symbol, จำนวน, ราคาปัจจุบัน, %วันนี้, มูลค่าปัจจุบัน,
  กำไร/ขาดทุน (เขียว/แดง), ต้นทุนเฉลี่ย
- ปุ่มเพิ่ม/แก้/ลบหุ้น
- ปุ่มรีเฟรชราคา (ดึงจาก API)

### เรื่องราคา (สำคัญ)
- **ไม่ต้องเรียลไทม์** — ดึงตอนเปิดหน้า + ปุ่มรีเฟรชเอง
- cache `lastPrice` / `lastPriceAt` ไว้ในเครื่อง แสดงทันทีตอนเปิด แล้วค่อยอัปเดตเบื้องหลัง
- ยิง API แบบประหยัด (กันเกินลิมิตแพลนฟรี)
- **ค่าคำนวณสด ไม่เก็บลงเครื่อง:** ราคาปัจจุบัน, %เปลี่ยนแปลงวันนี้, มูลค่าปัจจุบัน,
  กำไร/ขาดทุนรายตัว, มูลค่ารวมพอร์ต, มูลค่ารวมทุกพอร์ต
- **ข้อจำกัดที่รู้ล่วงหน้า:** ฟรี Stock API (Finnhub/Alpha Vantage) รองรับหุ้น US ดี
  แต่หุ้นไทยอาจไม่ครบ — ตอนถึงส่วน API ให้หา provider ที่รองรับหุ้นไทย และออกแบบ
  ชั้น service ให้สลับ provider ได้ง่าย

---

## 7. Tax Calculator — สเปก

- คำนวณภาษีเงินได้บุคคลธรรมดาของไทยแบบขั้นบันได
- อัตราขั้นบันได (ตรวจสอบกับกรมสรรพากรทุกปีเพราะเปลี่ยนได้):
  0–150,000 = ยกเว้น / 150,001–300,000 = 5% / 300,001–500,000 = 10% /
  500,001–750,000 = 15% / 750,001–1,000,000 = 20% / 1,000,001–2,000,000 = 25% /
  2,000,001–5,000,000 = 30% / 5,000,000+ = 35%
- ค่าลดหย่อนพื้นฐาน: ส่วนตัว 60,000 + หักค่าใช้จ่าย 50% (ไม่เกิน 100,000)
  + ช่องกรอกค่าลดหย่อนเพิ่มเติมเอง
- เฟส 3: ดึงรายได้ทั้งปีจาก Transaction มาป้อนอัตโนมัติ

---

## 8. โครงสร้างโฟลเดอร์ (แนะนำ)

```
finance-app/
├── public/
│   ├── icon-192.png
│   └── icon-512.png
├── src/
│   ├── components/          # UI ที่ใช้ซ้ำ (Button, Card, Modal, ...)
│   ├── pages/               # แต่ละหน้า (Dashboard, Transactions, Stock, Tax, Debt, Settings)
│   ├── store/               # Zustand stores
│   ├── services/            # เชื่อมภายนอก (stockApi, exportImport)
│   ├── constants/           # strings.js (เตรียม i18n), categories เริ่มต้น, tax brackets
│   ├── utils/               # ฟังก์ชันช่วย (money format, date, calc)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 9. Utility ที่ต้องมีตั้งแต่ต้น

- `formatMoney(satang, currency)` — แปลงสตางค์ (จำนวนเต็ม) → ข้อความเงินอ่านง่าย
- `parseMoney(text)` → จำนวนเต็มสตางค์ (ตอนรับ input จากผู้ใช้)
- `formatDate` / `getMonthRange` — จัดการวันที่/ช่วงเดือน (ใช้ day.js)
- `uuid()` — สร้าง id (`crypto.randomUUID()`)
- respect `hideBalances` — เมื่อเปิด ให้แสดงยอดเป็น `••••••` แทนตัวเลขทุกจุด

---

## 10. Checklist เริ่มงาน (เฟส 1)

1. [ ] `npm create vite` + ติดตั้ง Tailwind + Zustand + react-router-dom + day.js + lucide-react
2. [ ] ตั้ง `base` / `basename` ให้ตรงชื่อ repo
3. [ ] วางโครงโฟลเดอร์ตามข้อ 8
4. [ ] สร้าง Zustand store (transactions + categories + settings) พร้อม persist
5. [ ] seed หมวดหมู่ default
6. [ ] utility: formatMoney / uuid / date helpers
7. [ ] หน้าบันทึกรายรับ-รายจ่าย (เพิ่ม/แก้/ลบ + หมวด + แท็ก + โน้ต)
8. [ ] Dashboard สรุปเดือนนี้
9. [ ] Dark mode toggle (+ เก็บใน Settings)
10. [ ] Export/Import (Excel/CSV)
11. [ ] PWA setup (manifest + service worker) + ทดสอบ Add to Home Screen
12. [ ] Deploy ขึ้น GitHub Pages

---

## 11. สิ่งที่ตัดสินใจแล้ว (อย่าถามซ้ำ)

- ที่เก็บข้อมูล: **localStorage** ผ่าน Zustand persist (ไม่ใช้ IndexedDB เพราะไม่เก็บรูป)
- **ตัดฟีเจอร์แนบรูปใบเสร็จออกแล้ว** เหลือแค่โน้ต
- State: **Zustand** (ไม่ใช้ Context/Redux)
- ภาษา: เริ่ม **อังกฤษ** ก่อน ไทยไว้เฟส 3 (แต่แยก strings ออกมาตั้งแต่ต้น)
- สินทรัพย์: **เฉพาะหุ้น** (field `type` เผื่ออนาคตไว้แล้ว)
- ราคาหุ้น: **ไม่ต้องเรียลไทม์** cache ได้
- Backup: ผ่าน **Export/Import ไฟล์** (ไม่มี cloud sync ในตอนนี้)
- Deploy: **GitHub Pages**

---

*จบเอกสาร — อัปเดตเอกสารนี้ทุกครั้งที่มีการตัดสินใจเชิงโครงสร้างใหม่*

---

## 12. บันทึกการพัฒนา (Build Log)

### ชื่อแอพ: **MySync** (ล็อกแล้ว)

### การตัดสินใจเชิงโครงสร้างเพิ่มเติม (เฟส 1)
- **repo/base:** โปรเจกต์อยู่ใน `D:\7 MySync\mysync` โดยตรง → `base: '/mysync/'`
  ใน vite.config.js และ `basename="/mysync/"` ใน main.jsx (deploy ที่ `.../mysync/`)
- **React 18** (ไม่ใช่ 19) + **Vite 5** (ไม่ใช่ 8) — เลือกเวอร์ชันเสถียรที่ ecosystem
  รอบข้าง (recharts, vite-plugin-pwa) เทสต์ครบ พังยากกว่า
- **Tailwind v3** (config-based) ตามที่เจ้าของเลือก
- **โครงสร้าง store:** ใช้ Zustand store เดียว (`src/store/useStore.js`) รวม
  transactions + categories + settings — แอพเล็ก การอ่านข้าม slice ง่ายกว่า
- **SPA routing บน GitHub Pages:** ใช้เทคนิค 404.html redirect (public/404.html
  + snippet ใน index.html) เพื่อให้ deep link ไม่ 404
- **ข้อจำกัด environment:** `npm install` ต้องรันบน Windows โดยตรง (D:\ เป็น NTFS)
  ไม่รันผ่าน bridge เพราะเขียน node_modules ผ่าน mount ช้ามาก

### สถานะ Checklist เฟส 1
- [x] ตั้งโปรเจกต์ Vite + Tailwind + Zustand + router + dayjs + lucide
- [x] ตั้ง base/basename = /mysync/
- [x] วางโครงโฟลเดอร์ตามข้อ 8
- [x] Zustand store (transactions + categories + settings) + persist
- [x] seed หมวดหมู่ default (12 หมวด)
- [x] utility: formatMoney/parseMoney, uuid, date helpers (day.js)
- [x] หน้าบันทึกรายรับ-รายจ่าย (เพิ่ม/แก้/ลบ + หมวด + แท็ก + โน้ต)
- [x] Dashboard สรุปเดือนนี้ (รับ/จ่าย/คงเหลือ + top spending)
- [x] Dark mode toggle (เก็บใน Settings)
- [x] Export/Import (Excel via SheetJS + CSV via PapaParse)
- [x] PWA setup (manifest + service worker via vite-plugin-pwa + icons)
- [ ] Deploy ขึ้น GitHub Pages (รอทำ)
- [x] ทดสอบ build + runtime (headless) ผ่าน: คำนวณยอดถูก, dark mode ทำงาน, 0 error

*เฟส 1 พร้อมใช้งาน — รอ `npm install` บนเครื่อง + ทดสอบบนมือถือ + deploy*

---

## 14. เฟส 2 — กลุ่ม B (เสร็จแล้ว)

**จัดการหนี้สิน (หน้าใหม่ Debt + tab):**
- store: `debts[]` + addDebt/updateDebt/deleteDebt/toggleDebtPaid
- หน้า Debt: การ์ดสรุป "ยอดหนี้รวม" (unpaid), รายการเรียงตามวันครบกำหนด,
  toggle จ่ายแล้ว/ยัง, สถานะ Overdue (แดง)/Due in N days (เหลือง), แก้/ลบ, FAB เพิ่ม
- Dashboard: การ์ด "Upcoming debts" เตือนหนี้ overdue/ครบใน 14 วัน (กดไปหน้า Debt)

**Tax Calculator (หน้าใหม่ Tax + tab):**
- `constants/taxBrackets.js` (ขั้นบันได + ค่าลดหย่อน) + `utils/tax.js` (calcTax)
- คำนวณสด: กรอกรายได้ทั้งปี + ค่าลดหย่อนเพิ่ม → ภาษีประเมิน + effective rate +
  รายได้หลังหักภาษี + breakdown ค่าลดหย่อน + ตารางภาษีรายขั้น + disclaimer
- ค่าลดหย่อน: ส่วนตัว 60,000 + หักค่าใช้จ่าย 50% (สูงสุด 100,000) + ช่องกรอกเพิ่ม
- **หมายเหตุ:** ทำงานหน่วยบาท (ไม่ใช่สตางค์) เพราะเป็นค่าคำนวณ ไม่เก็บลง store
- auto-ดึงรายได้จาก transactions = เลื่อนไปเฟส 3 ตามแผน

**อื่นๆ:** BottomNav เป็น 5 แท็บ (Dashboard/Records/Debt/Tax/Settings) —
เปลี่ยน label "Transactions"→"Records" ให้พอดีจอ | export/import รวม Debts sheet แล้ว |
เพิ่ม date helper `daysUntil`

**ทดสอบ (headless):** build ผ่าน, ภาษี income 600k → 21,500 (taxable 440k) ถูกต้อง,
หนี้รวม/overdue/toggle จ่าย/การ์ด Dashboard ทำงาน, nav 5 แท็บ, 0 console error

### เหลือในเฟส 2 (กลุ่ม C)
- Stock Portfolio (แยกพอร์ต + ดึงราคาหุ้นจาก API)
