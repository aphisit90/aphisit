-- ============================================================================
-- โครงการพัฒนาระบบสารสนเทศยืม-คืนอุปกรณ์ทางการแพทย์และกายอุปกรณ์
-- สำหรับโรงพยาบาลส่งเสริมสุขภาพตำบล (รพ.สต.)
-- 
-- 1. DDL: DATA DEFINITION LANGUAGE
-- สร้าง Database, Tables, Indexes และ Constraints
-- ============================================================================

-- สร้างฐานข้อมูลและกำหนด Character Set รองรับภาษาไทยและ Emoji
CREATE DATABASE IF NOT EXISTS hospital_equipment_db 
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE hospital_equipment_db;

-- ลบตารางเดิมถ้ามีอยู่แล้ว (เรียงตามลำดับ Foreign Key Dependency)
DROP TABLE IF EXISTS borrow_records;
DROP TABLE IF EXISTS equipment;
DROP TABLE IF EXISTS users;

-- 1.1 ตารางผู้ใช้งาน (users)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    line_user_id VARCHAR(100) UNIQUE NOT NULL COMMENT 'LINE User ID จาก LINE LIFF',
    national_id VARCHAR(13) UNIQUE NULL COMMENT 'เลขบัตรประชาชน 13 หลัก',
    full_name VARCHAR(100) NOT NULL COMMENT 'ชื่อ-นามสกุล',
    phone_number VARCHAR(15) NOT NULL COMMENT 'เบอร์โทรศัพท์ติดต่อ',
    address TEXT NULL COMMENT 'ที่อยู่ปัจจุบันของผู้ป่วย/ผู้ยืม',
    role ENUM('patient', 'staff', 'admin') NOT NULL DEFAULT 'patient' COMMENT 'สิทธิ์ผู้ใช้งาน',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_line_user_id (line_user_id),
    INDEX idx_national_id (national_id)
) ENGINE=InnoDB COMMENT='ตารางเก็บข้อมูลผู้ใช้งานและเจ้าหน้าที่';

-- 1.2 ตารางอุปกรณ์ทางการแพทย์ (equipment)
CREATE TABLE equipment (
    equipment_id INT AUTO_INCREMENT PRIMARY KEY,
    asset_code VARCHAR(50) UNIQUE NOT NULL COMMENT 'รหัสครุภัณฑ์ / QR Code ID',
    equipment_name VARCHAR(100) NOT NULL COMMENT 'ชื่ออุปกรณ์ทางการแพทย์',
    category VARCHAR(50) NOT NULL COMMENT 'ประเภทอุปกรณ์ เช่น รถเข็น, เตียงผู้ป่วย',
    image_url VARCHAR(255) NULL COMMENT 'ลิงก์รูปภาพอุปกรณ์',
    status ENUM('available', 'borrowed', 'maintenance', 'disposed') NOT NULL DEFAULT 'available' COMMENT 'สถานะอุปกรณ์',
    condition_detail TEXT NULL COMMENT 'รายละเอียดสภาพอุปกรณ์',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_asset_code (asset_code),
    INDEX idx_status (status)
) ENGINE=InnoDB COMMENT='ตารางเก็บข้อมูลอุปกรณ์ทางการแพทย์';

-- 1.3 ตารางประวัติการยืม-คืน (borrow_records)
CREATE TABLE borrow_records (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT 'ผู้ยืม (FK -> users.user_id)',
    equipment_id INT NOT NULL COMMENT 'อุปกรณ์ที่ยืม (FK -> equipment.equipment_id)',
    borrow_date DATE NOT NULL COMMENT 'วันที่เริ่มยืม/รับของ',
    due_date DATE NOT NULL COMMENT 'วันที่กำหนดส่งคืน',
    return_date DATE NULL COMMENT 'วันที่ส่งคืนจริง (NULL หมายถึงยังไม่คืน)',
    status ENUM('pending', 'approved', 'borrowed', 'returned', 'rejected', 'overdue') NOT NULL DEFAULT 'pending' COMMENT 'สถานะคำขอยืม-คืน',
    approved_by INT NULL COMMENT 'เจ้าหน้าที่ผู้อนุมัติ (FK -> users.user_id)',
    remarks TEXT NULL COMMENT 'หมายเหตุ/เหตุผลการยืมหรือปฏิเสธ',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_borrow_status (status),
    INDEX idx_due_date (due_date)
) ENGINE=InnoDB COMMENT='ตารางประวัติและการทำรายการยืม-คืน';

-- ============================================================================
-- 2. DCL: DATA CONTROL LANGUAGE
-- การจัดการสิทธิ์และผู้ดูแลระบบฐานข้อมูล
-- ============================================================================

-- สร้าง User สำหรับ Backend App (Node.js/Python/PHP)
CREATE USER IF NOT EXISTS 'app_user'@'localhost' IDENTIFIED BY 'SecurePass1234!';
GRANT SELECT, INSERT, UPDATE, DELETE ON hospital_equipment_db.* TO 'app_user'@'localhost';

-- สร้าง User สำหรับ Read-Only (เจ้าหน้าที่ทำรายงาน/Dashboard)
CREATE USER IF NOT EXISTS 'report_user'@'localhost' IDENTIFIED BY 'ReportOnlyPass5678!';
GRANT SELECT ON hospital_equipment_db.* TO 'report_user'@'localhost';

FLUSH PRIVILEGES;

-- ============================================================================
-- 3. DML: DATA MANIPULATION LANGUAGE & MOCKUP DATA
-- ข้อมูลจำลองสำหรับทดสอบระบบ
-- ============================================================================

-- 3.1 Mockup Data: ผู้ใช้งาน (users)
INSERT INTO users (line_user_id, national_id, full_name, phone_number, address, role) VALUES
-- เจ้าหน้าที่ รพ.สต.
('U1001_LINE_ADMIN_STAFF', '1100100123456', 'นายอภิสิทธิ์ ใจแก้ว', '0812345678', 'รพ.สต. บ้านดอน ตำบลในเมือง', 'admin'),
('U1002_LINE_NURSE_STAFF', '1100200234567', 'นางสาวสมศรี มีสุข', '0898765432', 'รพ.สต. บ้านดอน ตำบลในเมือง', 'staff'),
-- ประชาชน / ผู้ยืม
('U2001_LINE_USER_PATIENT1', '3500100888999', 'นายสมชาย ใจดี', '0861112223', '12/1 หมู่ 3 ต.ในเมือง อ.เมือง', 'patient'),
('U2002_LINE_USER_PATIENT2', '3500200777888', 'นางมาลี รักสงบ', '0873334445', '45/2 หมู่ 5 ต.ในเมือง อ.เมือง', 'patient'),
('U2003_LINE_USER_PATIENT3', '3500300666777', 'นายบุญมี มีบุญ', '0885556667', '89 หมู่ 1 ต.ในเมือง อ.เมือง', 'patient');

-- 3.2 Mockup Data: อุปกรณ์ทางการแพทย์ (equipment)
INSERT INTO equipment (asset_code, equipment_name, category, image_url, status, condition_detail) VALUES
('EQ-WC-001', 'รถเข็นผู้ป่วย พับได้ (Wheelchair)', 'รถเข็น', 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=60', 'borrowed', 'สภาพดี ล้อยางใหม่ มีเข็มขัดนิรภัย'),
('EQ-WC-002', 'รถเข็นผู้ป่วย พับได้ (Wheelchair)', 'รถเข็น', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=60', 'available', 'เบาะมีรอยเล็กน้อย ใช้งานได้ปกติ โครงสร้างแข็งแรง'),
('EQ-O2-001', 'เครื่องผลิตออกซิเจน 5 ลิตร', 'เครื่องมือแพทย์', 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop&q=60', 'borrowed', 'ผ่านการฆ่าเชื้อและเช็คกรองแล้ว พร้อมสาย Cannula'),
('EQ-O2-002', 'เครื่องผลิตออกซิเจน 10 ลิตร', 'เครื่องมือแพทย์', 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=500&auto=format&fit=crop&q=60', 'maintenance', 'ส่งศูนย์ซ่อมบำรุงเปลี่ยนไส้กรองและปั๊มลม'),
('EQ-BD-001', 'เตียงผู้ป่วย 3 ไกร์ มือหมุน', 'เตียงและฟูก', 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&auto=format&fit=crop&q=60', 'available', 'พร้อมฟูกยางพารา ราวกั้นอลูมิเนียม เสาน้ำเกลือ'),
('EQ-ST-001', 'ไม้เท้า 4 ขา ปรับระดับได้', 'กายอุปกรณ์', 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=60', 'available', 'จุกยางรองขาใหม่ ปรับระดับความสูงได้ 10 ระดับ');

-- 3.3 Mockup Data: ประวัติการยืม-คืน (borrow_records)
INSERT INTO borrow_records (user_id, equipment_id, borrow_date, due_date, return_date, status, approved_by, remarks) VALUES
-- รายการที่ 1: คืนสำเร็จแล้ว
(3, 6, '2026-08-01', '2026-08-15', '2026-08-14', 'returned', 2, 'ผู้ป่วยอาการดีขึ้น ยืนเดินได้แล้ว ส่งคืนครบถ้วน'),
-- รายการที่ 2: อยู่ระหว่างยืมปกติ
(3, 1, '2026-08-20', '2026-09-20', NULL, 'borrowed', 1, 'ขอยืมใช้สำหรับการเดินทางไปพบแพทย์ที่ รพ.ใหญ่'),
-- รายการที่ 3: ยืมเกินกำหนด (Overdue)
(4, 3, '2026-07-01', '2026-08-01', NULL, 'overdue', 2, 'ติดตามผ่าน LINE Notification แล้ว อยู่ระหว่างติดต่อญาติ'),
-- รายการที่ 4: รอการอนุมัติ (Pending)
(5, 5, '2026-09-02', '2026-10-02', NULL, 'pending', NULL, 'ยื่นเรื่องผ่าน LINE LIFF แนบใบรับรองแพทย์เรียบร้อย');
