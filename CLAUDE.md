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
| `isPaid` | boolean | หนี้ก้อนเดียว: จ่ายแล้วยัง · หนี้ผ่อน: ผ่อนครบแล้วยัง |
| `kind` | `"once"`\|`"recurring"`\|`"installment"` | ก้อนเดียว / รายจ่ายประจำ / หนี้ผ่อน (ดูข้อ 20) |
| `frequency` | `"weekly"`\|`"monthly"`\|`"yearly"` | ความถี่ (สำหรับ recurring + installment) |
| `totalInstallments` | number | จำนวนงวดทั้งหมด (installment) |
| `paidInstallments` | number | จ่ายไปแล้วกี่งวด (installment) |
| `categoryId` | string | หมวดรายจ่าย (ใช้ตอนกดจ่าย→สร้าง expense) |
| `tags` | string[] | แท็ก (ติดไปกับ expense ตอนจ่าย) |
| `paidTxId` | string \| null | id ของ transaction ที่สร้างตอนจ่าย (once, ไว้ undo) |
| `note` | string | โน้ต (ไม่บังคับ) |

*`amount` = once: ยอดหนี้ทั้งก้อน · recurring: ยอดต่อรอบ · installment: ยอดต่องวด*

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

---

## 15. เฟส 2 — กลุ่ม C (เสร็จแล้ว) → ปิดเฟส 2

**Stock Portfolio** (เข้าจากการ์ด "Investments" บน Dashboard — คงเมนูล่าง 5 แท็บ):
- store: `portfolios[]` + `holdings[]` + actions (add/update/delete/cascade) +
  `cacheHoldingPrice` | settings: `stockProvider`, `stockApiKey`
- `services/stockApi.js`: service layer สลับ provider ได้ (เริ่มด้วย Finnhub) —
  getQuote/fetchQuotes คืนราคาเป็นหน่วย cents
- `utils/portfolio.js`: pure calc (holdingMetrics, totalsByCurrency, uniqueSymbols)
  — มูลค่า/กำไร/วันนี้ คำนวณสด ไม่เก็บ, cache แค่ lastPrice/lastPriceAt
- `hooks/useQuotes.js`: ดึง+cache ราคา (auto ตอนเปิด + ปุ่ม refresh) ใช้ร่วม 2 หน้า
- หน้า **Stocks** (ภาพรวม): มูลค่ารวมทุกพอร์ต (แยกตามสกุลเงิน ไม่ปลอม FX) +
  วันนี้ + กำไร/ขาดทุนรวม + ปุ่ม 👁 + รายการพอร์ต + refresh
- หน้า **PortfolioDetail**: รายหุ้น (symbol, จำนวน, ราคา, %วันนี้, มูลค่า,
  กำไร/ขาดทุน, ต้นทุนเฉลี่ย) + เพิ่ม/แก้/ลบ + refresh + แก้พอร์ต
- Dashboard: การ์ด Investments โชว์มูลค่า (ใช้ราคา cache ไม่ยิง API) แตะไปหน้า Stocks
- Settings: ส่วน Stocks ใส่ API key (เก็บในเครื่อง) + ลิงก์ขอ key ฟรี
- export/import: รวม Portfolios + Holdings sheets แล้ว

**เงินหน่วย cents:** avgCost/lastPrice เก็บเป็น cents ของสกุลเงินนั้นๆ (เช่น USD)
รองรับหุ้นไทย .BK (Finnhub ฟรีอาจไม่ครบ) — provider สลับได้ในอนาคต

**ข้อควรรู้:** privacy-first ไม่มีหลังบ้าน ผู้ใช้ใส่ API key ฟรีของตัวเอง |
เหตุ Zustand v5: selector ห้ามคืน array ใหม่ (เช่น .filter) ต้อง select ดิบ
แล้ว useMemo ไม่งั้น loop (React #185) — แก้ที่ PortfolioDetail แล้ว

**ทดสอบ:** unit test portfolio calc 14/14, functional (mock Finnhub) —
มูลค่า/กำไร/วันนี้/overview/dashboard cache ถูกต้อง, 0 console error

### สรุปเฟส 2: กลุ่ม A + B + C เสร็จครบแล้ว 🎉
เหลือเฟส 3 (แจ้งเตือน, PIN, หลายสกุลเงิน, i18n ไทย, เป้าหมายออม, auto-tax)

---

## 16. เฟส 3 — กลุ่มแจ้งเตือน & ความปลอดภัย (เสร็จแล้ว)

**เตือน backup:** banner เหลืองบน Dashboard เมื่อมีข้อมูล + ไม่ backup เกิน 14 วัน
(จาก `settings.lastBackupAt`) กดไป Settings / กากบาทปิด (session)

**ล็อกด้วย PIN (6 หลัก):**
- `utils/pin.js` (hashPin SHA-256, ไม่เก็บ PIN ตรงๆ), `PinPad` (6 หลัก auto-submit ไม่มีปุ่มยืนยัน),
  `LockScreen` (เต็มจอ ล็อกทุก reload ปลดล็อกแค่ session), `PinSetupModal` (ตั้ง 2 ครั้ง / ปิดต้องยืนยัน)
- Settings > Security & alerts > App lock
- **บั๊กที่แก้:** `unlocked` init = `!pinEnabled` — เปิด PIN กลาง session ไม่โดนล็อกเตะออกทันที
  (ล็อกรอบ reload ถัดไป)

**ปลดล็อกด้วย biometric (ลายนิ้วมือ/Face):**
- `utils/webauthn.js`: registerBiometric / verifyBiometric / biometricAvailable (WebAuthn platform
  authenticator, ไม่มีเซิร์ฟเวอร์ — ceremony ผ่าน = ปลดล็อก)
- Settings toggle "Unlock with biometrics" (โผล่เฉพาะเมื่อเปิด PIN + เครื่องรองรับ) —
  เปิด = ลงทะเบียน credential เก็บ id ใน localStorage
- LockScreen: auto-prompt biometric ตอนเปิด + ปุ่ม "Use biometrics" (fallback เป็น PIN เสมอ)
- ปิด PIN = เคลียร์ biometric ด้วย | **casual lock ไม่ใช่การเข้ารหัสข้อมูล**

**แจ้งเตือนหนี้:** `utils/notify.js` — App mount ถ้าเปิด `debtNotify`+granted → เตือนหนี้ due ≤3วัน/overdue
วันละครั้ง (`lastDebtNotifyAt`) | **ข้อจำกัด:** เตือนได้เฉพาะตอนเปิดแอพ (ไม่มี push server)

**ทดสอบ:** PIN ตั้ง/auto-submit/ล็อก-ปลดล็อก, biometric register+verify (virtual authenticator),
backup banner, 0 console error

### เหลือในเฟส 3
- ~~เป้าหมายการออม (Savings Goal)~~ ✅ เสร็จ (ดูข้อ 18)
- ~~หลายสกุลเงิน~~ ✅ เสร็จ (ดูข้อ 17)
- ~~ภาษาไทย/อังกฤษ~~ ✅ เสร็จ (ดูข้อ 17)
- สรุปยื่นภาษีอัตโนมัติ (ดึงรายได้ทั้งปี → Tax) — **ทดไว้ก่อน ยังไม่ทำ** (ผู้ใช้บอกยังไม่จำเป็น)

---

## 17. เฟส 3 — กลุ่มปรับแต่ง: หลายสกุลเงิน + i18n ไทย/อังกฤษ (เสร็จแล้ว)

**ระบบ 2 ภาษา (ทำเองแบบเบา ไม่ใช้ i18next):**
- `constants/strings.js` export `{ en, th }` + `strings` เป็น **Proxy** ที่อ่าน `_lang` ระดับโมดูล
- `setLang(lang)` เรียกใน `App` ตอน render (subscribe `settings.language`) → เปลี่ยนภาษาทั้งแอพทันที
- `getStrings(lang)` สำหรับโค้ดที่ไม่ใช่ component | component ใช้ `strings.x` ได้เลยไม่ต้องแก้
- Settings > Appearance > Language (segmented EN / ไทย)
- **เลือกทำเองแทน i18next** เพราะเบากว่า ไม่ต้อง provider/hook และ strings แยกไว้ตั้งแต่ต้นอยู่แล้ว

**หลายสกุลเงิน (FX):**
- `services/fx.js`: ลองหลาย provider ฟรีไม่ต้อง key ตามลำดับ (frankfurter.dev, frankfurter.app,
  open.er-api.com) — rate เป็น "ต่อ base" | `hooks/useFx.js` cache ใน store (`fx`), คืน `convert(minor, from)`
- `utils/portfolio.js`: `combineToPrimary(groups, field, convert, primary)` → {primaryMinor, natives, ok},
  `singleToPrimary`, `sumField`
- Settings > Appearance > Primary currency (THB/USD/EUR/GBP/JPY/SGD/AUD/CNY)
- **% คิดจากผลรวม native (currency-agnostic)** → ถูกต้องเสมอแม้ FX จะล้มเหลว (ไม่โชว์ +0.00% ผิดๆ)
- **บั๊กที่แก้:** frankfurter.app ล้มบางจังหวะ → multi-provider fallback + % จาก native sums

**Component แสดงเงิน 2 สกุล:**
- `DualMoney` — สกุลหลัก (ตัวใหญ่) + native (ตัวเล็ก) | props: combined, primary, className,
  nativeClassName, stacked, abs
- `FxChange` — ลูกศร + จำนวน + % (สี เขียว/แดง)

**สกุลเงินในหน้าหุ้น (ตามที่ผู้ใช้ขอ):**
- **มูลค่า/ยอดรวม** → โชว์ทั้ง THB (หลัก ตัวใหญ่) + USD (รอง ตัวเล็ก) ด้วย `DualMoney`
- **กำไร/ขาดทุน (การ์ดพอร์ต + หุ้นแต่ละตัว)** → โชว์ **แค่ THB + %** ไม่โชว์ USD (`FxChange` เขียนใหม่:
  ใช้ native เฉพาะตอน rate ยังไม่พร้อมเป็น fallback)
- **ราคาต่อหุ้น** → คง USD ตามเดิม

**ทดสอบ:** mock FX providers + Finnhub, ยืนยัน THB แปลงถูก, USD รองตัวเล็กเฉพาะที่ควรมี,
กำไร/ขาดทุนโชว์ THB+% ล้วน, สลับภาษาไทยติดทั้งแอพ, 0 console error

---

## 18. เฟส 3 — กลุ่มการเงินเพิ่มเติม: เป้าหมายการออม (เสร็จแล้ว)

> ทำเฉพาะ Savings Goal ตามที่ผู้ใช้สั่ง — auto-tax-summary ทดไว้ก่อน

**Store (`useStore.js`):** `savingsGoals: []` + actions `addGoal` / `updateGoal` / `deleteGoal` /
`addToGoal(id, deltaCents)` (clamp ≥ 0) | อยู่ใน `partialize` + `replaceData`
- schema: `{ id, name, targetAmount(satang), currentAmount(satang), deadline|null, ... }`

**หน้า/Component:**
- `pages/Savings.jsx` (route `/savings`) — header ปุ่มย้อนกลับ, การ์ดสรุป "Total saved" (gradient) +
  progress รวม, การ์ดเป้าหมายแต่ละอัน (progress bar, ยอดออม/เป้า, วันเหลือถ้ามี deadline, ปุ่ม Add money,
  แตะการ์ดเพื่อแก้ไข), FAB เพิ่มเป้าหมาย, empty state (ไอคอนกระปุก)
- `components/GoalModal.jsx` — สร้าง/แก้/ลบ (ชื่อ, ยอดเป้า, ออมแล้ว, วันที่ตั้งเป้า optional)
- `components/AddFundsModal.jsx` — เพิ่มเงินเข้าเป้า (โชว์ยอดที่เหลือ), แก้/ถอนผ่านหน้าแก้ไขเป้าหมาย
- **Dashboard:** การ์ด `SavingsCard` — ว่าง = CTA "Set a savings goal →", มีเป้า = ยอดออมรวม + progress %
  → แตะไป `/savings` (เข้าถึงจาก Dashboard เหมือนหน้าหุ้น ไม่อยู่ใน bottom nav)

**Backup:** `exportImport.js` เพิ่มชีต `SavingsGoals` (ตอนนี้ 7 ชีต) + goalToRow/rowToGoal,
import อ่านชีตนี้ | Settings export/import ผูก `savingsGoals` แล้ว

**i18n:** เพิ่ม block `savings` ครบทั้ง en + th

**ทดสอบ (mocked playwright):** สร้างเป้า → ยอด/เป้า/progress ถูก, Add money → progress ขยับ,
reload แล้ว persist, สลับไทยติด, เงินโชว์ THB (satang→บาท) ถูก, 0 console error

---

## 19. MoneyInput — ช่องกรอกเงินขึ้น comma อัตโนมัติ (เสร็จแล้ว)

- `components/ui/MoneyInput.jsx` + export `formatMoneyInput()` — `type="text"` ขึ้น , ระหว่างพิมพ์,
  ทศนิยม 2 ตำแหน่ง, รักษาตำแหน่ง cursor ไม่ให้เด้งตอนพิมพ์แทรกกลาง (นับ digit ซ้าย caret แล้ว map กลับ)
- **เหตุผล:** `<input type=number>` ใส่ comma ไม่ได้ (เบราว์เซอร์มองว่าไม่ใช่ตัวเลข) → ต้องเป็น text
- ใช้แทนช่อง number ใน: TransactionForm, DebtModal, GoalModal, AddFundsModal, HoldingModal (avgCost)
- **ไม่แตะ:** ช่อง shares (จำนวนหน่วย ไม่ใช่เงิน) และหน้า Tax (มี comma อยู่แล้วของเดิม)
- `parseMoney` ตัด comma ออกให้อยู่แล้ว → state เก็บสตริงมี comma ได้ ไม่ต้องแก้ตอน submit

---

## 20. เฟส 3 — กลุ่ม Debt: หนี้ 3 ประเภท + จ่าย→รายจ่าย + sorting (เสร็จแล้ว)

> **ปรับใหญ่จากดีไซน์เดิม** (เดิมมีแค่ ปกติ/subscription) เพราะ "ค่าผ่อนรถ" ไม่ใช่ subscription
> เส้นแบ่ง: *จ่ายครบแล้วได้เป็นเจ้าของ/มีจำนวนงวดแน่นอนมั้ย?* ใช่=หนี้ผ่อน, ไม่ใช่=รายจ่ายประจำ

**3 ประเภท (`kind`):**
- **once (หนี้ก้อนเดียว):** ยืมเงิน/ค่าหมอ/ยอดบัตรเดือนนี้ — จ่ายครั้งเดียวจบ
- **recurring (รายจ่ายประจำ):** ค่าเช่าบ้าน/คอนโด, ค่าไฟ, ค่าโทรศัพท์, Netflix, YT — ไม่มีต้นค้าง ไม่มีวันจบ
- **installment (หนี้ผ่อน):** ผ่อนรถ/บ้าน/มือถือ — มี `totalInstallments` + `paidInstallments`, มียอดคงเหลือที่ลดลง, มีวันจบ

**DebtModal:** เลือก kind (segmented 3 ปุ่ม + hint), amount label เปลี่ยนตาม kind (ยอดหนี้/ต่อรอบ/ต่องวด),
recurring+installment โชว์ความถี่, installment โชว์ จำนวนงวด + จ่ายไปแล้ว (onboard หนี้ที่ผ่อนไปแล้วได้),
+ หมวดหมู่ + แท็ก | prop `defaultKind` (แต่ละหน้าเปิด kind ของตัวเอง)

**กดจ่าย → สร้างรายจ่ายจริง (store, helper `expenseFromDebt`):**
- `payDebt(id)` — once: สร้าง expense (amount/category/tags/note), mark isPaid, เก็บ `paidTxId`
- `unpayDebt(id)` — ลบ transaction ที่ผูกไว้ + unmark
- `payRecurring(id)` — สร้าง expense + เลื่อน dueDate 1 รอบ (`addPeriod`) ไม่มีวันจบ
- `payInstallment(id)` — สร้าง expense + `paidInstallments++` + เลื่อน dueDate; ครบงวด → `isPaid=true` (จบเอง)
- fallback หมวด: ถ้าไม่มี categoryId → ใช้หมวดรายจ่ายตัวแรก
- **migration v1→v2:** debt เก่าที่มี `recurrence` → map เป็น kind (recurrence≠none → recurring, else once) + frequency

**หน้า Debt:**
- **Total outstanding = หนี้ก้อนเดียว(ยังไม่จ่าย) + ยอดคงเหลือหนี้ผ่อนทุกก้อน** (หนี้จริงที่มีต้นค้าง)
  รายจ่ายประจำ **ไม่นับ** (ไม่ใช่หนี้)
- ในการ์ด Total outstanding มีบรรทัด **"จ่ายครั้งถัดไป"** = อันที่ใกล้ครบกำหนดสุด**ข้ามทั้ง 3 ประเภท**
  (รวมรายจ่ายประจำด้วย แม้ตัวเลขยอดจะไม่นับก็ตาม — คนละมุม: ยอดหนี้ vs สิ่งที่ต้องจ่ายถัดไป)
- การ์ดสรุป "รายจ่ายประจำ" + "หนี้ผ่อน" **แสดงเสมอ** (ว่าง = ข้อความ "ยังไม่มี..." กดเข้าไปเพิ่มได้)
  — สำคัญ: เป็นทางเดียวที่จะเพิ่มหนี้ 2 ประเภทนี้ (ปุ่ม + มุมล่างเพิ่มได้แค่หนี้ก้อนเดียว)
- หนี้ก้อนเดียวอยู่ใต้หัวข้อ "One-time" (ว่าง = hint) | Sorting: ใกล้กำหนด/ไกลกำหนด/แพงสุด/ถูกสุด

**หน้า Recurring (`/debt/recurring`):** 1 การ์ด/รายการ (ชื่อ/ยอด/ความถี่/วันถัดไป) + ปุ่มจ่ายงวดนี้ + สรุปยอดรวม
**หน้า Installments (`/debt/installments`):** 1 การ์ด/ก้อน (ยอดต่องวด/ความถี่/progress งวด x/y + %/ยอดคงเหลือ/
วันถัดไป) + ปุ่มจ่ายงวดนี้ + สรุปยอดคงเหลือรวม + section "ผ่อนครบแล้ว" (พับเก็บประวัติ)
- ยอดคงเหลือ = ยอดต่องวด × งวดที่เหลือ (ตัวเลขประมาณ ไม่คิดดอกเบี้ยแบบธนาคาร)

**เตือนงวดใกล้ครบ:** Dashboard (การ์ดหนี้ใกล้ครบ) + notify ครอบคลุมทั้ง 3 ประเภท (filter `!isPaid && daysUntil≤n`
ใช้ได้กับทุก kind เพราะ recurring/installment ที่ยัง active มี isPaid=false)

**หมายเหตุ:** ไฟล์เก่า `pages/Subscriptions.jsx` ถูกแทนด้วย `Recurring.jsx` + `Installments.jsx` แล้ว
→ ควร `git rm src/pages/Subscriptions.jsx` (ลบไฟล์ที่ไม่ใช้แล้ว)

**ทดสอบ (mocked, 14 เคส):** once→outstanding, recurring แยกไม่นับ outstanding, installment 8,000×48 จ่ายแล้ว 12
→ คงเหลือ 288,000 + progress 12/48, outstanding = once+installment (293,000), จ่ายงวด→13/48 คงเหลือ 280,000
+ expense เข้า Records, migration recurrence→recurring, 0 console error

---

## 21. หุ้น sorting + ซ่อน API key + เรียงรายการใหม่→เก่า (เสร็จแล้ว)

**Sorting หุ้นในพอร์ต (PortfolioDetail):** dropdown เรียงหุ้นแต่ละตัวได้ — กำไร มาก↔น้อย,
มูลค่า มาก↔น้อย, กำไรวันนี้ มาก↔น้อย (6 แบบ + ค่าเริ่มต้น)
- แปลงเป็นสกุลหลัก (`convert`) ก่อนเทียบ เพื่อเทียบข้ามสกุลได้ถูก | หุ้นที่ยังไม่มีข้อมูล (ไม่มีราคา) → ดันไปท้าย
- โชว์เฉพาะเมื่อมีหุ้น > 1 ตัว

**ซ่อน Stock API key (Settings):** input เป็น `password` โดยดีฟอลต์ + ปุ่มไอคอนตา (Eye/EyeOff) สลับซ่อน/แสดง

**เรียงใหม่→เก่า + โชว์ 10:**
- Records (Transactions) และ Dashboard "Recent" เรียงตาม `date` ใหม่สุดก่อน แล้ว tiebreak ด้วย `createdAt`
  (วันเดียวกัน อันที่สร้างทีหลังขึ้นก่อน)
- Dashboard Recent โชว์สูงสุด **10 รายการ** (เดิม 5) | Records โชว์ครบทุกรายการ

**ทดสอบ (mocked):** สร้าง 12 รายการ → Records โชว์ครบ 12 + ใหม่สุดขึ้นก่อน, Dashboard โชว์ 10
(ซ่อน TX01/TX02), ซ่อน/แสดง API key สลับ type ถูก, เรียงหุ้น value/gain มาก→น้อย ลำดับถูก, 0 console error

---

## 22. หารบิลปาร์ตี้ (Split the bill, เสร็จแล้ว)

> เครื่องคิดเลขล้วนๆ — **ไม่เก็บข้อมูล ไม่สร้างรายรับรายจ่าย** (ตามที่ผู้ใช้สั่ง)

- `pages/SplitBill.jsx` (route `/split`) — state อยู่ใน component ล้วน ไม่แตะ store/localStorage
- **วิธีใช้:** เพิ่มชื่อคนที่หาร → เพิ่มรายการ (ชื่อ+ราคา ใช้ `MoneyInput`) → ติ๊กว่าใครหารรายการนั้นบ้าง
  (ดีฟอลต์ติ๊กครบทุกคน) → คำนวณให้แต่ละคนจ่ายเท่าไหร่ + ยอดรวมทั้งบิล
- **การคำนวณ:** แต่ละรายการ ราคา ÷ จำนวนคนที่ติ๊ก แล้วรวมต่อคน (รวมเป็น float ปัดเศษตอนแสดงต่อคน)
  | รายการที่ไม่มีใครติ๊ก → เตือน "บางรายการยังไม่ได้เลือกคน" (ไม่กระจายเข้าใคร)
- ลบคน → ถอดออกจากทุกรายการอัตโนมัติ | ปุ่ม "ล้างทั้งหมด" เริ่มใหม่
- **เข้าถึง:** ลิงก์เล็กๆ ไม่เด่นท้าย Dashboard ("หารบิลกับเพื่อน →") ไม่อยู่ใน bottom nav
- **i18n:** เพิ่ม block `split` ครบ en+th

**ทดสอบ (mocked):** 3 คน, รายการ 300 (หาร 3) + 100 (คนเดียว) → Alice 200 / Bob 100 / Cara 100,
รวม 400 | รายการไม่มีคน → เตือน + ไม่กระจาย | ลบคนแล้วหายจากผล, 0 console error

### สถานะรวม (คำขอชุดล่าสุด 8 ข้อ)
✅ ครบทั้ง 8: MoneyInput comma (19), กลุ่ม Debt+subscription (20), หุ้น sort + ซ่อน key +
เรียงใหม่→เก่า/โชว์ 10 (21), หารบิล (22) | ⏳ เหลือค้างไว้: auto-tax-summary (ผู้ใช้บอกยังไม่จำเป็น)

---

## 23. ปุ่มกระดิ่งแจ้งเตือน (Notification bell, เสร็จแล้ว)

- `components/NotificationBell.jsx` — ปุ่มกระดิ่ง + badge นับจำนวน + dropdown panel (สไตล์ Facebook)
  วางมุมขวาบนของ **Dashboard** (ซ้ายของกระดิ่งคือปุ่มดวงตา) และ **หน้า Debt**
- รวมการเตือนไว้ที่เดียว (คำนวณสดจากข้อมูล ไม่เก็บ read/unread): หนี้/งวดครบกำหนดภายใน 14 วันหรือเกินกำหนด
  (ทั้ง 3 ประเภท) + เตือน backup ค้าง | badge = จำนวน active | แต่ละแถวกดไปหน้าที่เกี่ยว | เกินกำหนด = สีแดง
- ลบ banner backup + การ์ดหนี้ใกล้ครบกลางหน้า Dashboard ออก มารวมในกระดิ่งแทน
- i18n: block `notifCenter` (en+th)

## 24. คู่มือการใช้งาน (User guide, เสร็จแล้ว)

- ปุ่ม "คู่มือการใช้งาน" ในหน้า Settings (หมวด Help) → route `/guide`
- `pages/Guide.jsx` — 2 มุมมองในหน้าเดียว (state `selected`): รายการฟังก์ชันทั้งหมด → แตะเข้าดูรายละเอียด
  (ปุ่มย้อนกลับกลับไปรายการ) แต่ละหัวข้อมี: ใช้ทำอะไร / อยู่ที่ไหน / วิธีใช้ (numbered) / ตัวอย่าง / ข้อควรรู้
- `constants/guide.js` — เนื้อหาแยก en+th: `GUIDE_META` (id+ไอคอน ตามลำดับ) + `GUIDE[lang][id]`
  ครอบคลุม 13 ฟังก์ชัน (dashboard, records, balance, categories, tags, debt, savings, stocks, tax,
  split, notifications, settings, backup) | อ่านภาษาจาก `settings.language`
- i18n label: block `guide` (whatFor/location/howTo/example/notes) ใน strings.js
- **เพิ่มฟังก์ชันใหม่ในอนาคต:** เพิ่ม entry ใน GUIDE_META + ข้อความใน GUIDE.en/GUIDE.th (คีย์เดียวกัน)

---

## หมายเหตุการซิงก์ CLAUDE.md
รอบก่อนๆ มีบางครั้งที่ CLAUDE.md ที่อัปเดตไม่ได้ถูก commit ขึ้น git (โดน revert กลับ)
→ เวลา push ให้ `git add -A` ทุกครั้ง เพื่อให้ CLAUDE.md ติดไปด้วย ไม่งั้น doc จะตกรุ่น
