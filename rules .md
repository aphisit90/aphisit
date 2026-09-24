# กฎและมาตรฐานการพัฒนาระบบ (Development Rules & Coding Standards)
## โครงการพัฒนาระบบสารสนเทศยืม-คืนอุปกรณ์ทางการแพทย์และกายอุปกรณ์ สำหรับโรงพยาบาลส่งเสริมสุขภาพตำบล (รพ.สต.)

---

### 1. กฎการออกแบบและสถาปัตยกรรมระบบ (System Architecture & Security Rules)
1. **การยืนยันตัวตน (Authentication):**
   * ประชาชนต้องผ่านการยืนยันตัวตนด้วย LINE LIFF SDK โดยใช้ `line_user_id` เป็น Identifier หลัก
   * ห้ามส่ง Passwords หรือข้อมูลความลับผ่าน Plain Text
2. **การควบคุมสิทธิ์ (Role-Based Access Control - RBAC):**
   * จำกัดสิทธิ์ตาม ENUM (`patient`, `staff`, `admin`) อย่างเคร่งครัด
   * API Endpoints สำหรับการอนุมัติ แก้ไขสต็อก หรือจัดการระบบ ต้องมีการตรวจสอบ Token และ Role ของเจ้าหน้าที่ (`staff` / `admin`) ก่อนทำรายการทุกครั้ง
3. **การคุ้มครองข้อมูลส่วนบุคคล (PDPA Compliance):**
   * ข้อมูลเลขบัตรประชาชน (`national_id`) และข้อมูลติดต่อ ต้องได้รับการปกป้องตามมาตรฐาน
   * ห้ามแสดงผลเลขบัตรประชาชนเต็มรูปแบบในหน้าจอสาธารณะ (ให้แสดงในรูปแบบ Masking เช่น `3-5001-XXXXX-XX-X`)

---

### 2. มาตรฐานการจัดการฐานข้อมูล MySQL (Database Rules)
1. **Naming Conventions:**
   * ชื่อตารางใช้ภาษาอังกฤษ ตัวพิมพ์เล็กทั้งหมด และเป็นพหูพจน์หรือคำนามผสม เช่น `users`, `equipment`, `borrow_records`
   * ชื่อคอลัมน์ใช้แบบ Snake Case เช่น `user_id`, `line_user_id`, `borrow_date`
2. **Character Set & Collation:**
   * ต้องกำหนดฐานข้อมูล ตาราง และ คอลัมน์ข้อความให้เป็น `utf8mb4` และ `utf8mb4_unicode_ci` เพื่อรองรับภาษาไทยและ Emoji จาก LINE
3. **Data Integrity & Constraints:**
   * คอลัมน์ที่เป็นการเชื่อมโยง Foreign Key ต้องระบุ Constraints ให้ชัดเจน (`ON DELETE CASCADE` หรือ `ON DELETE SET NULL` ตามความเหมาะสม)
   * ต้องมีการสร้าง `INDEX` ในคอลัมน์ที่มีการค้นหาบ่อย เช่น `line_user_id`, `national_id`, `asset_code`, `status`
4. **Data Manipulation (DCL & DML):**
   * ห้ามใช้ Account `root` ในการเชื่อมต่อจาก Backend Application
   * แอปพลิเคชันหลักให้ใช้ `app_user` ส่วนระบบรายงาน/Dashboard ให้ใช้ `report_user` (Read-Only)

---

### 3. มาตรฐานการพัฒนา LINE OA / LIFF & Chatbot
1. **LINE LIFF:**
   * หน้า UI ต้องออกแบบให้รองรับ Responsive Design (Mobile-First) เนื่องจากเปิดใช้งานบนสมาร์ทโฟนเป็นหลัก
   * ต้องจัดการ State กรณีผู้ใช้ยกเลิกสิทธิ์การเข้าถึงโปรไฟล์ หรือเปิดใช้งานนอกแอป LINE
2. **LINE Messaging API (Push Messages & Notifications):**
   * การส่ง Push Message แจ้งเตือน (เช่น เตือนล่วงหน้า 3 วัน หรือ Overdue) ต้องทำผ่าน Scheduled Task / Cron Job ในช่วงเวลาที่เหมาะสม (8:00 น. - 17:00 น.)
   * ห้ามส่ง Push Message ถี่เกินจำเป็นเพื่อป้องกันผู้ใช้บล็อก LINE Official Account

---

### 4. มาตรฐานการเขียนโค้ดและ Git Workflow (Coding & Version Control Standards)
1. **Git Commit Structure:**
   * ใช้ Conventional Commits เช่น:
     * `feat: add equipment scanning via QR Code`
     * `fix: correct overdue date calculation logic`
     * `docs: update API documentation`
2. **Environment Variables:**
   * ห้าม Hardcode Sensitive Data เช่น Database Credentials, LINE Channel Secret, LINE Access Token ลงใน Source Code
   * ให้จัดเก็บไว้ในไฟล์ `.env` และเพิ่ม `.env` ลงใน `.gitignore` เสมอ
3. **Error Handling & Logging:**
   * ทุก API ต้องมี `try-catch` บล็อก และคืนค่า HTTP Status Code ที่เหมาะสม (เช่น 200, 400, 401, 403, 500) พร้อม JSON Response รูปแบบเดียวกัน
   * บันทึก Error Log สำหรับปัญหาในระบบ Backend เพื่อให้ง่ายต่อการ Debug หน้างาน
