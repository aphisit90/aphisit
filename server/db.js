/**
 * Database Layer for CareBridge LIFF
 * Connects to MySQL (hospital_equipment_db) using mysql2/promise
 * with automatic fallback to memory store if MySQL is offline.
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

// In-Memory Fallback Data
const INITIAL_USERS = [
  { user_id: 1, line_user_id: 'U1001_LINE_ADMIN_STAFF', national_id: '1100100123456', full_name: 'นายอภิสิทธิ์ ใจแก้ว', phone_number: '0812345678', address: 'รพ.สต. บ้านดอน ตำบลในเมือง', role: 'admin', avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80', created_at: '2026-08-01 08:00:00', updated_at: '2026-08-01 08:00:00' },
  { user_id: 2, line_user_id: 'U1002_LINE_NURSE_STAFF', national_id: '1100200234567', full_name: 'นางสาวสมศรี มีสุข', phone_number: '0898765432', address: 'รพ.สต. บ้านดอน ตำบลในเมือง', role: 'staff', avatar: 'https://images.unsplash.com/photo-1594824813681-ef05a10959b8?w=150&auto=format&fit=crop&q=80', created_at: '2026-08-01 08:00:00', updated_at: '2026-08-01 08:00:00' },
  { user_id: 3, line_user_id: 'U2001_LINE_USER_PATIENT1', national_id: '3500100888999', full_name: 'นายสมชาย ใจดี', phone_number: '0861112223', address: '12/1 หมู่ 3 ต.ในเมือง อ.เมือง', role: 'patient', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', created_at: '2026-08-01 08:00:00', updated_at: '2026-08-01 08:00:00' },
  { user_id: 4, line_user_id: 'U2002_LINE_USER_PATIENT2', national_id: '3500200777888', full_name: 'นางมาลี รักสงบ', phone_number: '0873334445', address: '45/2 หมู่ 5 ต.ในเมือง อ.เมือง', role: 'patient', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', created_at: '2026-08-01 08:00:00', updated_at: '2026-08-01 08:00:00' },
  { user_id: 5, line_user_id: 'U2003_LINE_USER_PATIENT3', national_id: '3500300666777', full_name: 'นายบุญมี มีบุญ', phone_number: '0885556667', address: '89 หมู่ 1 ต.ในเมือง อ.เมือง', role: 'patient', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', created_at: '2026-08-01 08:00:00', updated_at: '2026-08-01 08:00:00' }
];

const INITIAL_EQUIPMENT = [
  { equipment_id: 1, asset_code: 'EQ-WC-001', equipment_name: 'รถเข็นผู้ป่วย พับได้ (Wheelchair)', category: 'รถเข็น', image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=60', status: 'borrowed', condition_detail: 'สภาพดี ล้อยางใหม่ มีเข็มขัดนิรภัย', created_at: '2026-08-01 08:00:00', updated_at: '2026-08-01 08:00:00' },
  { equipment_id: 2, asset_code: 'EQ-WC-002', equipment_name: 'รถเข็นผู้ป่วย พับได้ (Wheelchair)', category: 'รถเข็น', image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=60', status: 'available', condition_detail: 'เบาะมีรอยเล็กน้อย ใช้งานได้ปกติ โครงสร้างแข็งแรง', created_at: '2026-08-01 08:00:00', updated_at: '2026-08-01 08:00:00' },
  { equipment_id: 3, asset_code: 'EQ-O2-001', equipment_name: 'เครื่องผลิตออกซิเจน 5 ลิตร', category: 'เครื่องมือแพทย์', image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop&q=60', status: 'borrowed', condition_detail: 'ผ่านการฆ่าเชื้อและเช็คกรองแล้ว พร้อมสาย Cannula', created_at: '2026-08-01 08:00:00', updated_at: '2026-08-01 08:00:00' },
  { equipment_id: 4, asset_code: 'EQ-O2-002', equipment_name: 'เครื่องผลิตออกซิเจน 10 ลิตร', category: 'เครื่องมือแพทย์', image_url: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=500&auto=format&fit=crop&q=60', status: 'maintenance', condition_detail: 'ส่งศูนย์ซ่อมบำรุงเปลี่ยนไส้กรองและปั๊มลม', created_at: '2026-08-01 08:00:00', updated_at: '2026-08-01 08:00:00' },
  { equipment_id: 5, asset_code: 'EQ-BD-001', equipment_name: 'เตียงผู้ป่วย 3 ไกร์ มือหมุน', category: 'เตียงและฟูก', image_url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&auto=format&fit=crop&q=60', status: 'available', condition_detail: 'พร้อมฟูกยางพารา ราวกั้นอลูมิเนียม เสาน้ำเกลือ', created_at: '2026-08-01 08:00:00', updated_at: '2026-08-01 08:00:00' },
  { equipment_id: 6, asset_code: 'EQ-ST-001', equipment_name: 'ไม้เท้า 4 ขา ปรับระดับได้', category: 'กายอุปกรณ์', image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=60', status: 'available', condition_detail: 'จุกยางรองขาใหม่ ปรับระดับความสูงได้ 10 ระดับ', created_at: '2026-08-01 08:00:00', updated_at: '2026-08-01 08:00:00' }
];

const INITIAL_BORROW_RECORDS = [
  { record_id: 1, user_id: 3, equipment_id: 6, borrow_date: '2026-08-01', due_date: '2026-08-15', return_date: '2026-08-14', status: 'returned', approved_by: 2, remarks: 'ผู้ป่วยอาการดีขึ้น ยืนเดินได้แล้ว ส่งคืนครบถ้วน', created_at: '2026-08-01 09:30:00', updated_at: '2026-08-14 14:20:00' },
  { record_id: 2, user_id: 3, equipment_id: 1, borrow_date: '2026-08-20', due_date: '2026-09-20', return_date: null, status: 'borrowed', approved_by: 1, remarks: 'ขอยืมใช้สำหรับการเดินทางไปพบแพทย์ที่ รพ.ใหญ่', created_at: '2026-08-20 10:15:00', updated_at: '2026-08-20 10:30:00' },
  { record_id: 3, user_id: 4, equipment_id: 3, borrow_date: '2026-07-01', due_date: '2026-08-01', return_date: null, status: 'overdue', approved_by: 2, remarks: 'ติดตามผ่าน LINE Notification แล้ว อยู่ระหว่างติดต่อญาติ', created_at: '2026-07-01 11:00:00', updated_at: '2026-08-02 08:30:00' },
  { record_id: 4, user_id: 5, equipment_id: 5, borrow_date: '2026-09-02', due_date: '2026-10-02', return_date: null, status: 'pending', approved_by: null, remarks: 'ยื่นเรื่องผ่าน LINE LIFF แนบใบรับรองแพทย์เรียบร้อย', created_at: '2026-09-02 16:45:00', updated_at: '2026-09-02 16:45:00' }
];

class DatabaseService {
  constructor() {
    this.pool = null;
    this.isMySQLConnected = false;
    this.initMemoryFallback();
    this.initMySQL();
  }

  initMemoryFallback() {
    this.memUsers = JSON.parse(JSON.stringify(INITIAL_USERS));
    this.memEquipment = JSON.parse(JSON.stringify(INITIAL_EQUIPMENT));
    this.memBorrowRecords = JSON.parse(JSON.stringify(INITIAL_BORROW_RECORDS));
    this.nextUserId = 6;
    this.nextEquipmentId = 7;
    this.nextRecordId = 5;
  }

  async initMySQL() {
    try {
      this.pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'app_user',
        password: process.env.DB_PASSWORD || process.env.DB_PASS || 'SecurePass1234!',
        database: process.env.DB_NAME || 'hospital_equipment_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: 'utf8mb4'
      });

      // Test connection
      const [rows] = await this.pool.query('SELECT 1 + 1 AS test');
      if (rows && rows[0].test === 2) {
        this.isMySQLConnected = true;
        console.log('✅ [Database] เชื่อมต่อกับ MySQL (hospital_equipment_db) สำเร็จเรียบร้อย');
      }
    } catch (err) {
      console.warn('⚠️ [Database] ไม่สามารถเชื่อมต่อ MySQL โดยตรงได้ กำลังสลับไปใช้ Memory Store สำรอง:', err.message);
      this.isMySQLConnected = false;
    }
  }

  // --- Users ---
  async getUsers() {
    if (this.isMySQLConnected) {
      try {
        const [rows] = await this.pool.query('SELECT * FROM users');
        return rows;
      } catch (e) {
        console.error('MySQL Error in getUsers:', e.message);
      }
    }
    return this.memUsers;
  }

  async getUserById(id) {
    if (this.isMySQLConnected) {
      try {
        const [rows] = await this.pool.query('SELECT * FROM users WHERE user_id = ?', [Number(id)]);
        return rows[0] || null;
      } catch (e) {
        console.error('MySQL Error in getUserById:', e.message);
      }
    }
    return this.memUsers.find(u => u.user_id === Number(id)) || null;
  }

  async getUserByLineId(lineUserId) {
    if (this.isMySQLConnected) {
      try {
        const [rows] = await this.pool.query('SELECT * FROM users WHERE line_user_id = ?', [lineUserId]);
        return rows[0] || null;
      } catch (e) {
        console.error('MySQL Error in getUserByLineId:', e.message);
      }
    }
    return this.memUsers.find(u => u.line_user_id === lineUserId) || null;
  }

  async createUser(userData) {
    if (this.isMySQLConnected) {
      try {
        const [result] = await this.pool.query(
          'INSERT INTO users (line_user_id, national_id, full_name, phone_number, address, role) VALUES (?, ?, ?, ?, ?, ?)',
          [userData.line_user_id, userData.national_id || null, userData.full_name, userData.phone_number, userData.address || null, userData.role || 'patient']
        );
        return this.getUserById(result.insertId);
      } catch (e) {
        console.error('MySQL Error in createUser:', e.message);
      }
    }
    const newUser = {
      user_id: this.nextUserId++,
      line_user_id: userData.line_user_id,
      national_id: userData.national_id || null,
      full_name: userData.full_name,
      phone_number: userData.phone_number,
      address: userData.address || null,
      role: userData.role || 'patient',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.memUsers.push(newUser);
    return newUser;
  }

  // --- Equipment ---
  async getEquipment({ category, search, status } = {}) {
    if (this.isMySQLConnected) {
      try {
        let sql = 'SELECT * FROM equipment WHERE 1=1';
        const params = [];
        if (category && category !== 'all') {
          sql += ' AND category = ?';
          params.push(category);
        }
        if (status && status !== 'all') {
          sql += ' AND status = ?';
          params.push(status);
        }
        if (search) {
          sql += ' AND (equipment_name LIKE ? OR asset_code LIKE ? OR category LIKE ?)';
          const q = `%${search}%`;
          params.push(q, q, q);
        }
        const [rows] = await this.pool.query(sql, params);
        return rows;
      } catch (e) {
        console.error('MySQL Error in getEquipment:', e.message);
      }
    }

    let list = [...this.memEquipment];
    if (category && category !== 'all') list = list.filter(item => item.category === category);
    if (status && status !== 'all') list = list.filter(item => item.status === status);
    if (search) {
      const q = search.trim().toLowerCase();
      list = list.filter(item =>
        item.equipment_name.toLowerCase().includes(q) ||
        item.asset_code.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return list;
  }

  async getEquipmentById(id) {
    if (this.isMySQLConnected) {
      try {
        const [rows] = await this.pool.query('SELECT * FROM equipment WHERE equipment_id = ?', [Number(id)]);
        return rows[0] || null;
      } catch (e) {
        console.error('MySQL Error in getEquipmentById:', e.message);
      }
    }
    return this.memEquipment.find(e => e.equipment_id === Number(id)) || null;
  }

  async getEquipmentByAssetCode(code) {
    if (!code) return null;
    if (this.isMySQLConnected) {
      try {
        const [rows] = await this.pool.query('SELECT * FROM equipment WHERE UPPER(asset_code) = UPPER(?)', [code.trim()]);
        return rows[0] || null;
      } catch (e) {
        console.error('MySQL Error in getEquipmentByAssetCode:', e.message);
      }
    }
    return this.memEquipment.find(e => e.asset_code.trim().toUpperCase() === code.trim().toUpperCase()) || null;
  }

  async updateEquipmentStatus(equipmentId, status) {
    if (this.isMySQLConnected) {
      try {
        await this.pool.query('UPDATE equipment SET status = ?, updated_at = NOW() WHERE equipment_id = ?', [status, Number(equipmentId)]);
        return this.getEquipmentById(equipmentId);
      } catch (e) {
        console.error('MySQL Error in updateEquipmentStatus:', e.message);
      }
    }
    const item = await this.getEquipmentById(equipmentId);
    if (item) {
      item.status = status;
      item.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    }
    return item;
  }

  // --- Borrow Records ---
  async getBorrowRecords({ status, userId, equipmentId } = {}) {
    if (this.isMySQLConnected) {
      try {
        let sql = `
          SELECT 
            r.*,
            u.full_name as user_full_name,
            u.phone_number as user_phone,
            u.national_id as user_national_id,
            u.line_user_id as user_line_id,
            e.asset_code,
            e.equipment_name,
            e.category as equipment_category,
            e.image_url as equipment_image,
            e.status as equipment_current_status,
            a.full_name as approver_name,
            a.role as approver_role
          FROM borrow_records r
          LEFT JOIN users u ON r.user_id = u.user_id
          LEFT JOIN equipment e ON r.equipment_id = e.equipment_id
          LEFT JOIN users a ON r.approved_by = a.user_id
          WHERE 1=1
        `;
        const params = [];
        if (status && status !== 'all') {
          sql += ' AND r.status = ?';
          params.push(status);
        }
        if (userId) {
          sql += ' AND r.user_id = ?';
          params.push(Number(userId));
        }
        if (equipmentId) {
          sql += ' AND r.equipment_id = ?';
          params.push(Number(equipmentId));
        }
        sql += ' ORDER BY r.created_at DESC';

        const [rows] = await this.pool.query(sql, params);
        return rows.map(r => ({
          record_id: r.record_id,
          user_id: r.user_id,
          equipment_id: r.equipment_id,
          borrow_date: r.borrow_date instanceof Date ? r.borrow_date.toISOString().split('T')[0] : r.borrow_date,
          due_date: r.due_date instanceof Date ? r.due_date.toISOString().split('T')[0] : r.due_date,
          return_date: r.return_date ? (r.return_date instanceof Date ? r.return_date.toISOString().split('T')[0] : r.return_date) : null,
          status: r.status,
          approved_by: r.approved_by,
          remarks: r.remarks,
          created_at: r.created_at,
          updated_at: r.updated_at,
          user: {
            user_id: r.user_id,
            full_name: r.user_full_name,
            phone_number: r.user_phone,
            national_id: r.user_national_id,
            line_user_id: r.user_line_id
          },
          equipment: {
            equipment_id: r.equipment_id,
            asset_code: r.asset_code,
            equipment_name: r.equipment_name,
            category: r.equipment_category,
            image_url: r.equipment_image,
            status: r.equipment_current_status
          },
          approver: r.approved_by ? {
            user_id: r.approved_by,
            full_name: r.approver_name,
            role: r.approver_role
          } : null
        }));
      } catch (e) {
        console.error('MySQL Error in getBorrowRecords:', e.message);
      }
    }

    let records = [...this.memBorrowRecords];
    if (status && status !== 'all') records = records.filter(r => r.status === status);
    if (userId) records = records.filter(r => r.user_id === Number(userId));
    if (equipmentId) records = records.filter(r => r.equipment_id === Number(equipmentId));

    return records.map(r => {
      const user = this.memUsers.find(u => u.user_id === r.user_id);
      const equipment = this.memEquipment.find(e => e.equipment_id === r.equipment_id);
      const approver = r.approved_by ? this.memUsers.find(u => u.user_id === r.approved_by) : null;
      return {
        ...r,
        user: user ? {
          user_id: user.user_id,
          full_name: user.full_name,
          phone_number: user.phone_number,
          national_id: user.national_id,
          line_user_id: user.line_user_id
        } : null,
        equipment: equipment || null,
        approver: approver ? {
          user_id: approver.user_id,
          full_name: approver.full_name,
          role: approver.role
        } : null
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  async getBorrowRecordById(recordId) {
    const list = await this.getBorrowRecords();
    return list.find(r => r.record_id === Number(recordId)) || null;
  }

  async createBorrowRecord({ userId, equipmentId, borrowDate, dueDate, remarks }) {
    if (this.isMySQLConnected) {
      try {
        const bDate = borrowDate || new Date().toISOString().split('T')[0];
        const [result] = await this.pool.query(
          'INSERT INTO borrow_records (user_id, equipment_id, borrow_date, due_date, status, remarks) VALUES (?, ?, ?, ?, ?, ?)',
          [Number(userId), Number(equipmentId), bDate, dueDate, 'pending', remarks || '']
        );
        return this.getBorrowRecordById(result.insertId);
      } catch (e) {
        console.error('MySQL Error in createBorrowRecord:', e.message);
      }
    }

    const record = {
      record_id: this.nextRecordId++,
      user_id: Number(userId),
      equipment_id: Number(equipmentId),
      borrow_date: borrowDate || new Date().toISOString().split('T')[0],
      due_date: dueDate,
      return_date: null,
      status: 'pending',
      approved_by: null,
      remarks: remarks || '',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.memBorrowRecords.push(record);
    return this.getBorrowRecordById(record.record_id);
  }

  async approveBorrowRecord(recordId, approverUserId) {
    if (this.isMySQLConnected) {
      try {
        const [rows] = await this.pool.query('SELECT equipment_id FROM borrow_records WHERE record_id = ?', [Number(recordId)]);
        if (rows[0]) {
          await this.pool.query(
            'UPDATE borrow_records SET status = "borrowed", approved_by = ?, updated_at = NOW() WHERE record_id = ?',
            [Number(approverUserId), Number(recordId)]
          );
          await this.pool.query(
            'UPDATE equipment SET status = "borrowed", updated_at = NOW() WHERE equipment_id = ?',
            [rows[0].equipment_id]
          );
        }
        return this.getBorrowRecordById(recordId);
      } catch (e) {
        console.error('MySQL Error in approveBorrowRecord:', e.message);
      }
    }

    const record = this.memBorrowRecords.find(r => r.record_id === Number(recordId));
    if (!record) return null;
    record.status = 'borrowed';
    record.approved_by = Number(approverUserId);
    record.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    await this.updateEquipmentStatus(record.equipment_id, 'borrowed');
    return this.getBorrowRecordById(recordId);
  }

  async rejectBorrowRecord(recordId, approverUserId, remarks) {
    if (this.isMySQLConnected) {
      try {
        const [rows] = await this.pool.query('SELECT equipment_id FROM borrow_records WHERE record_id = ?', [Number(recordId)]);
        if (rows[0]) {
          await this.pool.query(
            'UPDATE borrow_records SET status = "rejected", approved_by = ?, remarks = ?, updated_at = NOW() WHERE record_id = ?',
            [Number(approverUserId), remarks || 'ปฏิเสธคำขอยืม', Number(recordId)]
          );
          await this.pool.query(
            'UPDATE equipment SET status = "available", updated_at = NOW() WHERE equipment_id = ? AND status != "maintenance"',
            [rows[0].equipment_id]
          );
        }
        return this.getBorrowRecordById(recordId);
      } catch (e) {
        console.error('MySQL Error in rejectBorrowRecord:', e.message);
      }
    }

    const record = this.memBorrowRecords.find(r => r.record_id === Number(recordId));
    if (!record) return null;
    record.status = 'rejected';
    record.approved_by = Number(approverUserId);
    if (remarks) record.remarks = remarks;
    record.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const equip = await this.getEquipmentById(record.equipment_id);
    if (equip && equip.status !== 'maintenance') {
      await this.updateEquipmentStatus(record.equipment_id, 'available');
    }
    return this.getBorrowRecordById(recordId);
  }

  async returnBorrowRecord(recordId, approverUserId, remarks) {
    if (this.isMySQLConnected) {
      try {
        const [rows] = await this.pool.query('SELECT equipment_id, remarks FROM borrow_records WHERE record_id = ?', [Number(recordId)]);
        if (rows[0]) {
          const newRemarks = (rows[0].remarks ? rows[0].remarks + ' | ' : '') + (remarks || 'รับคืนอุปกรณ์เรียบร้อย');
          await this.pool.query(
            'UPDATE borrow_records SET status = "returned", return_date = CURDATE(), approved_by = ?, remarks = ?, updated_at = NOW() WHERE record_id = ?',
            [Number(approverUserId), newRemarks, Number(recordId)]
          );
          await this.pool.query(
            'UPDATE equipment SET status = "available", updated_at = NOW() WHERE equipment_id = ?',
            [rows[0].equipment_id]
          );
        }
        return this.getBorrowRecordById(recordId);
      } catch (e) {
        console.error('MySQL Error in returnBorrowRecord:', e.message);
      }
    }

    const record = this.memBorrowRecords.find(r => r.record_id === Number(recordId));
    if (!record) return null;
    record.status = 'returned';
    record.return_date = new Date().toISOString().split('T')[0];
    record.approved_by = Number(approverUserId);
    if (remarks) record.remarks = (record.remarks ? record.remarks + ' | ' : '') + remarks;
    record.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    await this.updateEquipmentStatus(record.equipment_id, 'available');
    return this.getBorrowRecordById(recordId);
  }

  // --- Dashboard Stats ---
  async getDashboardStats() {
    if (this.isMySQLConnected) {
      try {
        const [equipStats] = await this.pool.query(`
          SELECT 
            COUNT(*) as totalEquipment,
            SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as availableEquipment,
            SUM(CASE WHEN status = 'borrowed' THEN 1 ELSE 0 END) as borrowedEquipment,
            SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenanceEquipment
          FROM equipment
        `);

        const [borrowStats] = await this.pool.query(`
          SELECT 
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingRequests,
            SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdueRecords,
            SUM(CASE WHEN status = 'borrowed' THEN 1 ELSE 0 END) as activeLoans
          FROM borrow_records
        `);

        return {
          totalEquipment: Number(equipStats[0].totalEquipment) || 0,
          availableEquipment: Number(equipStats[0].availableEquipment) || 0,
          borrowedEquipment: Number(equipStats[0].borrowedEquipment) || 0,
          maintenanceEquipment: Number(equipStats[0].maintenanceEquipment) || 0,
          pendingRequests: Number(borrowStats[0].pendingRequests) || 0,
          overdueRecords: Number(borrowStats[0].overdueRecords) || 0,
          activeLoans: Number(borrowStats[0].activeLoans) || 0
        };
      } catch (e) {
        console.error('MySQL Error in getDashboardStats:', e.message);
      }
    }

    const availableEquipment = this.memEquipment.filter(e => e.status === 'available').length;
    const borrowedEquipment = this.memEquipment.filter(e => e.status === 'borrowed').length;
    const maintenanceEquipment = this.memEquipment.filter(e => e.status === 'maintenance').length;
    const totalEquipment = this.memEquipment.length;

    const pendingRequests = this.memBorrowRecords.filter(r => r.status === 'pending').length;
    const overdueRecords = this.memBorrowRecords.filter(r => r.status === 'overdue').length;
    const activeLoans = this.memBorrowRecords.filter(r => r.status === 'borrowed').length;

    return {
      availableEquipment,
      borrowedEquipment,
      maintenanceEquipment,
      totalEquipment,
      pendingRequests,
      overdueRecords,
      activeLoans
    };
  }

  async resetToSeed() {
    this.initMemoryFallback();
  }
}

const db = new DatabaseService();
module.exports = db;
