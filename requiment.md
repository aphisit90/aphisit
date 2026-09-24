# ข้อกำหนดความต้องการระบบ (Software Requirements Specification - SRS)

## โครงการพัฒนาระบบสารสนเทศยืม-คืนอุปกรณ์ทางการแพทย์และกายอุปกรณ์ สำหรับโรงพยาบาลส่งเสริมสุขภาพตำบล (รพ.สต.)

\---

### ข้อมูลทั่วไปของโครงการ (Project Overview)

* **ชื่อโครงการ:** โครงการพัฒนาระบบสารสนเทศยืม-คืนอุปกรณ์ทางการแพทย์และกายอุปกรณ์ สำหรับโรงพยาบาลส่งเสริมสุขภาพตำบล (รพ.สต.)
* **ผู้รับผิดชอบโครงการ:** นาย อภิสิทธิ์ ใจแก้ว ร่วมกับ คณะทำงานพัฒนาระบบบริการ โรงพยาบาลส่งเสริมสุขภาพตำบล

\---

### 1\. หลักการและเหตุผล (Background \& Rationale)

โรงพยาบาลส่งเสริมสุขภาพตำบล (รพ.สต.) มีภารกิจสำคัญในการดูแลสุขภาพประชาชนในระดับปฐมภูมิ รวมถึงการสนับสนุนอุปกรณ์ทางการแพทย์และกายอุปกรณ์ เช่น รถเข็น (Wheelchair), ไม้เท้า, เตียงผู้ป่วย, เครื่องผลิตออกซิเจน ให้ผู้ป่วยนำไปใช้ดูแลรักษาต่อที่บ้าน

ในปัจจุบัน การดำเนินงานยืม-คืนอุปกรณ์ส่วนใหญ่ยังใช้ระบบจดบันทึกด้วยเอกสารกระดาษ หรือลงข้อมูลในตารางคำนวณแบบแยกส่วน ทำให้เกิดปัญหาสำคัญ ได้แก่:

1. **การติดตามอุปกรณ์ล่าช้า:** ไม่ทราบสถานะที่แน่นอนว่าอุปกรณ์อยู่ที่ใด หรือเกินกำหนดวันส่งคืนหรือไม่
2. **การจัดการสต็อกคลาดเคลื่อน:** ไม่เห็นภาพรวมอุปกรณ์ที่พร้อมใช้งาน ชำรุด หรืออยู่ระหว่างส่งซ่อม
3. **ความไม่สะดวกของประชาชน:** ประชาชนต้องเดินทางมาติดต่อสอบถามสถานะอุปกรณ์ด้วยตนเอง และใช้เวลาบันทึกข้อมูลนาน
4. **ภาระงานของเจ้าหน้าที่:** เจ้าหน้าที่ต้องใช้เวลามากในการค้นหาประวัติและจัดทำรายงานสรุปประจำเดือน

ในฐานะนักพัฒนาโปรแกรมที่มีประสบการณ์ 5 ปี จึงได้ออกแบบและนำเสนอการพัฒนาระบบสารสนเทศยืม-คืนอุปกรณ์ทางการแพทย์ดิจิทัล เพื่อเปลี่ยนผ่านกระบวนการทำงานสู่รูปแบบอิเล็กทรอนิกส์ (Digital Transformation) เพิ่มความแม่นยำ ลดภาระงานเจ้าหน้าที่ และอำนวยความสะดวกให้แก่ประชาชนในชุมชน

\---

### 2\. วัตถุประสงค์ (Objectives)

1. เพื่อพัฒนาระบบสารสนเทศในการบริหารจัดการการยืม-คืน และติดตามสถานะอุปกรณ์ทางการแพทย์ของ รพ.สต.
2. เพื่ออำนวยความสะดวกแก่ประชาชนในการตรวจสอบรายการอุปกรณ์ที่ว่าง จองยืม และติดตามวันกำหนดส่งคืน
3. เพื่อลดระยะเวลาและภาระงานซ้ำซ้อนของเจ้าหน้าที่ในการบันทึกข้อมูลและการทำรายงาน
4. เพื่อเพิ่มประสิทธิภาพในการบริหารจัดการคลังอุปกรณ์ทางการแพทย์ให้มีข้อมูลที่เป็นปัจจุบัน (Real-time) และยั่งยืน

\---

### 3\. กลุ่มเป้าหมายและผู้ใช้งานระบบ (Target Users)

* **กลุ่มที่ 1: ประชาชนผู้รับบริการ (General Public / Patients / Caregivers)**

  * ตรวจสอบรายการอุปกรณ์ทางการแพทย์ที่ว่างพร้อมยืมผ่านระบบออนไลน์
  * ยื่นคำร้องขอยืมอุปกรณ์ และนัดหมายวันรับอุปกรณ์
  * ตรวจสอบประวัติการยืม-คืน และรับการแจ้งเตือนวันครบกำหนดส่งคืน
* **กลุ่มที่ 2: เจ้าหน้าที่ รพ.สต. (Staff / Medical Personnel)**

  * **เจ้าหน้าที่ให้บริการ (Front-line Staff):** อนุมัติคำขอยืม, บันทึกการรับ-คืนอุปกรณ์, พิมพ์ใบรับ/ใบส่งคืน
  * **ผู้ดูแลคลังอุปกรณ์ (Inventory Manager):** จัดการข้อมูลอุปกรณ์ (เพิ่ม/ลด/แก้ไข), บันทึกสถานะชำรุด/ส่งซ่อม
  * **ผู้บริหาร/นักวิชาการ:** ดูรายงานสรุปสถิติการใช้งาน และวิเคราะห์ความต้องการอุปกรณ์ในพื้นที่

\---

### 4\. สถาปัตยกรรมระบบและเทคโนโลยี (System Architecture \& Technology Stack)

การเลือกใช้ **LINE Official Account (LINE OA) ร่วมกับ LINE LIFF (LINE Front-end Framework) และ MySQL** เป็น Architecture ที่เหมาะสมและคุ้มค่าที่สุดสำหรับการพัฒนาระบบยืม-คืนอุปกรณ์ทางการแพทย์ของ รพ.สต. เนื่องจากประชาชนส่วนใหญ่คุ้นเคยกับการใช้ LINE อยู่แล้ว โดยไม่ต้องติดตั้งแอปพลิเคชันเพิ่มเติม

#### 4.1 ภาพรวมสถาปัตยกรรมระบบ (System Architecture Diagram)

```
\[ ประชาชน / เจ้าหน้าที่ ]
        │
        ▼
   \[ LINE OA ]  ──── ( Rich Menu / Text Input )
        │
        ├─► \[ Chatbot (Webhook Process) ] ──► ดำเนินการตอบคำถามอัตโนมัติ / แจ้งเตือนส่งคืน
        │
        └─► \[ LINE LIFF Web App ] ──────────► หน้าจอลงทะเบียน / ค้นหาอุปกรณ์ / ยื่นคำขอยืม
                  │
                  ▼
         \[ Backend API Server ] ─────────────► (Node.js / Python / PHP)
                  │
                  ▼
            \[ MySQL DB ] ───────────────────► จัดเก็บข้อมูลหลักทั้งหมด
```

#### 4.2 บทบาทและหน้าที่ของเทคโนโลยีแต่ละส่วน

* **LINE Official Account (LINE OA):** เป็นช่องทางหลักในการสื่อสาร ให้บริการผ่าน Rich Menu, ข้อความโต้ตอบอัตโนมัติ และระบบแจ้งเตือน (Push Notifications)
* **LINE LIFF (LINE Front-end Framework):** เป็นเว็บแอปพลิเคชันที่เปิดขึ้นมาซ้อนอยู่ภายในแอป LINE ช่วยให้ผู้ใช้สามารถทำรายการที่ซับซ้อนได้ง่ายขึ้น เช่น เลือกอุปกรณ์จากรายการ, แนบไฟล์เอกสาร, ดูปฏิทินวันยืม-คืน โดย LIFF สามารถดึงข้อมูลโปรไฟล์ผู้ใช้ LINE (`userId`, `displayName`) มายืนยันตัวตนได้ทันทีโดยไม่ต้องกรอกรหัสผ่าน
* **MySQL Database:** ฐานข้อมูลเชิงสัมพันธ์ (Relational Database) สำหรับจัดเก็บข้อมูลโครงสร้าง เช่น รายชื่อผู้ป่วย, สต็อกอุปกรณ์, ประวัติการยืม-คืน และสิทธิ์การใช้งาน

\---

### 5\. ขอบเขตการทำงานของระบบ (System Scope \& Functional Requirements)

#### 5.1 การแบ่งหน้าที่การทำงานระหว่าง Chatbot และ LIFF

* **ส่วนที่ใช้ LINE LIFF (เหมาะกับ Form \& Graphic UX):**

  * **การลงทะเบียนผู้ใช้งาน:** ผูก `line\_user\_id` เข้ากับเลขบัตรประชาชน และข้อมูลติดต่อของผู้ป่วย/ผู้ดูแล
  * **การค้นหาและเลือกรายการอุปกรณ์:** แสดงผลแบบการ์ดรายการ (Card Layout) พร้อมรูปถ่าย สเปกอุปกรณ์ และจำนวนคงเหลือ
  * **การยื่นคำขอยืมอุปกรณ์:** หน้าฟอร์มระบุวันยืม วันคาดว่าจะคืน และอัปโหลดเอกสารประกอบ (เช่น บัตรประชาชน หรือใบรับรองแพทย์)
  * **หน้า Dashboard สำหรับเจ้าหน้าที่:** สแกน QR Code ที่ติดบนตัวอุปกรณ์เพื่อทำรายการ รับ-ส่งคืน หรืออนุมัติคำขอได้จากหน้างาน
* **ส่วนที่ใช้ Chatbot (เหมาะกับ Quick Status \& Notifications):**

  * **การสอบถามข้อมูลด่วน:** เช่น พิมพ์ว่า "ติดต่อเจ้าหน้าที่", "เวลาทำการ" หรือ "วิธียืมอุปกรณ์"
  * **การส่งข้อความแจ้งเตือนอัตโนมัติ (Push Message):**

    * แจ้งเตือนเมื่อคำขอยืมได้รับการอนุมัติ
    * แจ้งเตือนล่วงหน้า 3 วันก่อนครบกำหนดส่งคืน
    * แจ้งเตือนเมื่อเกินกำหนดส่งคืน (Overdue)

#### 5.2 ระบบสำหรับประชาชน (Public Portal)

1. **ค้นหาและตรวจสอบ:** ค้นหาอุปกรณ์ตามประเภท ตรวจสอบจำนวนคงเหลือ
2. **ยื่นคำขอยืม:** ลงทะเบียนข้อมูลเบื้องต้น ยื่นเอกสารประกอบ (เช่น สำเนาบัตรประชาชน/ใบรับรองแพทย์)
3. **ระบบแจ้งเตือน:** แจ้งเตือนวันกำหนดส่งคืนผ่าน SMS หรือ Line Official Account

#### 5.3 ระบบสำหรับเจ้าหน้าที่ (Back-office System)

1. **การจัดการสิทธิ์:** แบ่งระดับการเข้าถึงข้อมูลตามบทบาท (Role-based Access Control)
2. **การอนุมัติและทำรายการ:** ตรวจสอบเอกสาร อนุมัติยืม บันทึกการส่งมอบ และรับคืนอุปกรณ์
3. **ระบบบาร์โค้ด / QR Code:** ติด QR Code ที่ตัวอุปกรณ์เพื่อสแกนยืม-คืนได้รวดเร็ว
4. **การจัดการคลัง:** ตรวจสอบประวัติการบำรุงรักษา และประวัติผู้ใช้งานย้อนหลัง

#### 5.4 ระบบรายงานและประมวลผล (Dashboard \& Analytics)

1. แดชบอร์ดสรุปภาพรวมอุปกรณ์ (กำลังถูกยืม, พร้อมใช้งาน, ชำรุด, เกินกำหนดคืน)
2. สรุปสถิติอุปกรณ์ยอดนิยมและระยะเวลาการยืมเฉลี่ย เพื่อวางแผนงบประมาณจัดซื้อในอนาคต

\---

### 6\. การออกแบบโครงสร้างฐานข้อมูล MySQL (Database Schema)

\-- ============================================================================

\-- 1. DDL: DATA DEFINITION LANGUAGE

\-- สร้าง Database, Tables, Indexes และ Constraints

\-- ============================================================================



\-- สร้างฐานข้อมูลและกำหนด Character Set รองรับภาษาไทย

CREATE DATABASE IF NOT EXISTS hospital\_equipment\_db

&#x20; DEFAULT CHARACTER SET utf8mb4 

&#x20; DEFAULT COLLATE utf8mb4\_unicode\_ci;



USE hospital\_equipment\_db;



\-- ลบตารางเดิมถ้ามีอยู่แล้ว (เรียงตามลำดับ FK Constraint)

DROP TABLE IF EXISTS borrow\_records;

DROP TABLE IF EXISTS equipment;

DROP TABLE IF EXISTS users;



\-- 1.1 ตารางผู้ใช้งาน (users)

CREATE TABLE users (

&#x20;   user\_id INT AUTO\_INCREMENT PRIMARY KEY,

&#x20;   line\_user\_id VARCHAR(100) UNIQUE NOT NULL COMMENT 'LINE User ID จาก LINE LIFF',

&#x20;   national\_id VARCHAR(13) UNIQUE NULL COMMENT 'เลขบัตรประชาชน 13 หลัก',

&#x20;   full\_name VARCHAR(100) NOT NULL COMMENT 'ชื่อ-นามสกุล',

&#x20;   phone\_number VARCHAR(15) NOT NULL COMMENT 'เบอร์โทรศัพท์ติดต่อ',

&#x20;   address TEXT NULL COMMENT 'ที่อยู่ปัจจุบันของผู้ป่วย/ผู้ยืม',

&#x20;   role ENUM('patient', 'staff', 'admin') NOT NULL DEFAULT 'patient' COMMENT 'สิทธิ์ผู้ใช้งาน',

&#x20;   created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,

&#x20;   updated\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,

&#x20;   INDEX idx\_line\_user\_id (line\_user\_id),

&#x20;   INDEX idx\_national\_id (national\_id)

) ENGINE=InnoDB COMMENT='ตารางเก็บข้อมูลผู้ใช้งานและเจ้าหน้าที่';



\-- 1.2 ตารางอุปกรณ์ทางการแพทย์ (equipment)

CREATE TABLE equipment (

&#x20;   equipment\_id INT AUTO\_INCREMENT PRIMARY KEY,

&#x20;   asset\_code VARCHAR(50) UNIQUE NOT NULL COMMENT 'รหัสครุภัณฑ์ / QR Code ID',

&#x20;   equipment\_name VARCHAR(100) NOT NULL COMMENT 'ชื่ออุปกรณ์ทางการแพทย์',

&#x20;   category VARCHAR(50) NOT NULL COMMENT 'ประเภทอุปกรณ์ เช่น รถเข็น, เตียงผู้ป่วย',

&#x20;   image\_url VARCHAR(255) NULL COMMENT 'ลิงก์รูปภาพอุปกรณ์',

&#x20;   status ENUM('available', 'borrowed', 'maintenance', 'disposed') NOT NULL DEFAULT 'available' COMMENT 'สถานะอุปกรณ์',

&#x20;   condition\_detail TEXT NULL COMMENT 'รายละเอียดสภาพอุปกรณ์',

&#x20;   created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,

&#x20;   updated\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,

&#x20;   INDEX idx\_asset\_code (asset\_code),

&#x20;   INDEX idx\_status (status)

) ENGINE=InnoDB COMMENT='ตารางเก็บข้อมูลอุปกรณ์ทางการแพทย์';



\-- 1.3 ตารางประวัติการยืม-คืน (borrow\_records)

CREATE TABLE borrow\_records (

&#x20;   record\_id INT AUTO\_INCREMENT PRIMARY KEY,

&#x20;   user\_id INT NOT NULL COMMENT 'ผู้ยืม (FK -> users.user\_id)',

&#x20;   equipment\_id INT NOT NULL COMMENT 'อุปกรณ์ที่ยืม (FK -> equipment.equipment\_id)',

&#x20;   borrow\_date DATE NOT NULL COMMENT 'วันที่เริ่มยืม/รับของ',

&#x20;   due\_date DATE NOT NULL COMMENT 'วันที่กำหนดส่งคืน',

&#x20;   return\_date DATE NULL COMMENT 'วันที่ส่งคืนจริง (NULL หมายถึงยังไม่คืน)',

&#x20;   status ENUM('pending', 'approved', 'borrowed', 'returned', 'rejected', 'overdue') NOT NULL DEFAULT 'pending' COMMENT 'สถานะคำขอยืม-คืน',

&#x20;   approved\_by INT NULL COMMENT 'เจ้าหน้าที่ผู้อนุมัติ (FK -> users.user\_id)',

&#x20;   remarks TEXT NULL COMMENT 'หมายเหตุ/เหตุผลการยืมหรือปฏิเสธ',

&#x20;   created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,

&#x20;   updated\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,

&#x20;   FOREIGN KEY (user\_id) REFERENCES users(user\_id) ON DELETE CASCADE,

&#x20;   FOREIGN KEY (equipment\_id) REFERENCES equipment(equipment\_id) ON DELETE CASCADE,

&#x20;   FOREIGN KEY (approved\_by) REFERENCES users(user\_id) ON DELETE SET NULL,

&#x20;   INDEX idx\_borrow\_status (status),

&#x20;   INDEX idx\_due\_date (due\_date)

) ENGINE=InnoDB COMMENT='ตารางประวัติและการทำรายการยืม-คืน';





\-- ============================================================================

\-- 2. DCL: DATA CONTROL LANGUAGE

\-- การจัดการสิทธิ์และผู้ดูแลระบบฐานข้อมูล

\-- ============================================================================



\-- สร้าง User สำหรับ Backend App (Node.js/Python/PHP)

CREATE USER IF NOT EXISTS 'app\_user'@'localhost' IDENTIFIED BY 'SecurePass1234!';



\-- ให้สิทธิ์อ่าน/เขียน/แก้ไขข้อมูล สำหรับแอปพลิเคชัน

GRANT SELECT, INSERT, UPDATE, DELETE ON hospital\_equipment\_db.\* TO 'app\_user'@'localhost';



\-- สร้าง User สำหรับ Read-Only (เจ้าหน้าที่ทำรายงาน/Dashboard)

CREATE USER IF NOT EXISTS 'report\_user'@'localhost' IDENTIFIED BY 'ReportOnlyPass5678!';

GRANT SELECT ON hospital\_equipment\_db.\* TO 'report\_user'@'localhost';



\-- อัปเดตสิทธิ์ระบบ

FLUSH PRIVILEGES;





\-- ============================================================================

\-- 3. DML: DATA MANIPULATION LANGUAGE \& MOCKUP DATA

\-- ข้อมูลจำลองสำหรับทดสอบระบบ (Users, Equipment, Borrow Records)

\-- ============================================================================



\-- 3.1 Mockup Data: ผู้ใช้งาน (`users`)

INSERT INTO users (line\_user\_id, national\_id, full\_name, phone\_number, address, role) VALUES

\-- เจ้าหน้าที่ รพ.สต.

('U1001\_LINE\_ADMIN\_STAFF', '1100100123456', 'นายอภิสิทธิ์ ใจแก้ว', '0812345678', 'รพ.สต. บ้านดอน ตำบลในเมือง', 'admin'),

('U1002\_LINE\_NURSE\_STAFF', '1100200234567', 'นางสาวสมศรี มีสุข', '0898765432', 'รพ.สต. บ้านดอน ตำบลในเมือง', 'staff'),

\-- ประชาชน / ผู้ยืม

('U2001\_LINE\_USER\_PATIENT1', '3500100888999', 'นายสมชาย ใจดี', '0861112223', '12/1 หมู่ 3 ต.ในเมือง อ.เมือง', 'patient'),

('U2002\_LINE\_USER\_PATIENT2', '3500200777888', 'นางมาลี รักสงบ', '0873334445', '45/2 หมู่ 5 ต.ในเมือง อ.เมือง', 'patient'),

('U2003\_LINE\_USER\_PATIENT3', '3500300666777', 'นายบุญมี มีบุญ', '0885556667', '89 หมู่ 1 ต.ในเมือง อ.เมือง', 'patient');



\-- 3.2 Mockup Data: อุปกรณ์ทางการแพทย์ (`equipment`)

INSERT INTO equipment (asset\_code, equipment\_name, category, image\_url, status, condition\_detail) VALUES

('EQ-WC-001', 'รถเข็นผู้ป่วย พับได้ (Wheelchair)', 'รถเข็น', 'https://example.com/img/wc001.jpg', 'borrowed', 'สภาพดี ล้อยางใหม่'),

('EQ-WC-002', 'รถเข็นผู้ป่วย พับได้ (Wheelchair)', 'รถเข็น', 'https://example.com/img/wc002.jpg', 'available', 'เบาะมีรอยเล็กน้อย ใช้งานได้ปกติ'),

('EQ-O2-001', 'เครื่องผลิตออกซิเจน 5 ลิตร', 'เครื่องมือแพทย์', 'https://example.com/img/o2\_001.jpg', 'borrowed', 'ผ่านการฆ่าเชื้อและเช็คกรองแล้ว'),

('EQ-O2-002', 'เครื่องผลิตออกซิเจน 10 ลิตร', 'เครื่องมือแพทย์', 'https://example.com/img/o2\_002.jpg', 'maintenance', 'ส่งศูนย์ซ่อมบำรุงปั๊มลม'),

('EQ-BD-001', 'เตียงผู้ป่วย 3 ไกร์ มือหมุน', 'เตียงและฟูก', 'https://example.com/img/bd001.jpg', 'available', 'พร้อมฟูกยางพาราและราวกั้น'),

('EQ-ST-001', 'ไม้เท้า 4 ขา ปรับระดับได้', 'กายอุปกรณ์', 'https://example.com/img/st001.jpg', 'available', 'จุกยางรองขาใหม่');



\-- 3.3 Mockup Data: ประวัติการยืม-คืน (`borrow\_records`)

INSERT INTO borrow\_records (user\_id, equipment\_id, borrow\_date, due\_date, return\_date, status, approved\_by, remarks) VALUES

\-- รายการที่ 1: คืนสำเร็จแล้ว

(3, 6, '2026-08-01', '2026-08-15', '2026-08-14', 'returned', 2, 'ผู้ป่วยอาการดีขึ้น ยืนเดินได้แล้ว'),



\-- รายการที่ 2: อยู่ระหว่างยืมปกติ

(3, 1, '2026-08-20', '2026-09-20', NULL, 'borrowed', 1, 'ขอยืมใช้สำหรับการเดินทางไปพบแพทย์ที่ รพ.ใหญ่'),



\-- รายการที่ 3: ยืมเกินกำหนด (Overdue)

(4, 3, '2026-07-01', '2026-08-01', NULL, 'overdue', 2, 'ติดตามผ่าน LINE Notification แล้ว อยู่ระหว่างติดต่อญาติ'),



\-- รายการที่ 4: รอการอนุมัติ (Pending)

(5, 5, '2026-09-02', '2026-10-02', NULL, 'pending', NULL, 'ยื่นเรื่องผ่าน LINE LIFF แนบใบรับรองแพทย์เรียบร้อย');





\-- ============================================================================

\-- 4. DML: EXAMPLE USEFUL QUERIES (ตัวอย่าง คำสั่ง Query สำหรับใช้งานในแอป)

\-- ============================================================================



\-- Query 1: ค้นหาอุปกรณ์ที่ว่างพร้อมยืม (สำหรับแสดงใน LINE LIFF)

\-- SELECT asset\_code, equipment\_name, category, condition\_detail 

\-- FROM equipment 

\-- WHERE status = 'available';



\-- Query 2: ตรวจสอบรายการยืมเกินกำหนด (Overdue) เพื่อส่ง LINE Push Message แจ้งเตือน

\-- SELECT r.record\_id, u.line\_user\_id, u.full\_name, e.equipment\_name, r.due\_date

\-- FROM borrow\_records r

\-- JOIN users u ON r.user\_id = u.user\_id

\-- JOIN equipment e ON r.equipment\_id = e.equipment\_id

\-- WHERE r.status IN ('borrowed', 'overdue') AND r.due\_date < CURDATE();```

\---

### 7\. แผนการดำเนินงาน (Timeline)

|ระยะเวลา|กิจกรรม|
|-|-|
|**เดือนที่ 1**|รวบรวมความต้องการ (Requirement Gathering) ออกแบบ UX/UI และ Database Architecture|
|**เดือนที่ 2 - 3**|พัฒนาระบบ (System Development) และเชื่อมต่อ API / ระบบแจ้งเตือน|
|**เดือนที่ 4**|ทดสอบระบบ (System \& User Acceptance Testing: UAT) และปรับปรุงตาม Feedback|
|**เดือนที่ 5**|อบรมการใช้งานเจ้าหน้าที่ (User Training) และนำระบบขึ้นใช้งานจริง (Deployment)|
|**เดือนที่ 6**|ติดตามผลการใช้งาน ดูแลรักษา และประเมินความพึงพอใจ|

\---

### 8\. ผลประโยชน์ที่คาดว่าจะได้รับ (Expected Benefits)

1. **User Experience (UX) ที่สะดวก:** ประชาชนเข้าถึงบริการยืมอุปกรณ์ทางการแพทย์ได้สะดวกรวดเร็ว ผ่าน Rich Menu ใน LINE ได้ทันที ไม่ต้องจำ Username/Password เพราะใช้ `line\_user\_id` ในการยืนยันตัวตน ลดเวลาการเดินทางมาติดต่อโดยไม่จำเป็น
2. **ลดการสูญหายและคืนล่าช้า:** อัตราการสูญหายหรือการคืนอุปกรณ์เกินกำหนดลดลง จากระบบแจ้งเตือน (Push Message) และการติดตามที่มีประสิทธิภาพ
3. **เพิ่มประสิทธิภาพของเจ้าหน้าที่:** เจ้าหน้าที่ รพ.สต. มีระบบช่วยลดภาระงานเอกสาร สามารถใช้ LINE LIFF เปิดกล้องสแกน QR Code บนตัวอุปกรณ์เพื่อเปลี่ยนสถานะเป็น "คืนแล้ว" ได้ทันที และสามารถนำเวลาไปดูแลผู้ป่วยได้อย่างเต็มที่
4. **ต้นทุนต่ำและได้ข้อมูลที่แม่นยำ (Cost-effective \& Analytics):** LINE OA มีข้อความฟรีในแต่ละเดือนเพียงพอสำหรับการทำระบบแจ้งเตือน รพ.สต. และ รพ.สต. มีข้อมูลเชิงสถิติที่แม่นยำ นำไปใช้ในการขอสนับสนุนงบประมาณจัดซื้ออุปกรณ์ได้ตรงกับความต้องการจริงของชุมชน

