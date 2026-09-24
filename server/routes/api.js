/**
 * CareBridge LIFF API Routes
 * Implements REST endpoints for Public LIFF & Staff Portal
 */

const express = require('express');
const router = express.Router();
const db = require('../db');
const { maskNationalId, requireRole, setActiveUserId, getActiveUserId } = require('../middleware/auth');

// ==========================================
// 1. User & Persona / Auth Simulation APIs
// ==========================================

// Get current user profile
router.get('/auth/me', async (req, res) => {
  try {
    const user = { ...req.currentUser };
    // If not staff/admin, mask national_id according to PDPA
    if (user.role === 'patient') {
      user.national_id = maskNationalId(user.national_id);
    }
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// List all personas for demo/testing
router.get('/auth/users', async (req, res) => {
  try {
    const users = await db.getUsers();
    const currentId = getActiveUserId();
    const sanitized = users.map(u => ({
      user_id: u.user_id,
      full_name: u.full_name,
      role: u.role,
      phone_number: u.phone_number,
      avatar: u.avatar,
      is_current: u.user_id === currentId
    }));
    res.json({ success: true, data: sanitized });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Switch active user persona
router.post('/auth/switch', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'ไม่พบผู้ใช้งานนี้ในระบบ' });
    }
    setActiveUserId(userId);
    res.json({
      success: true,
      message: `สลับผู้ใช้งานเป็น ${user.full_name} (${user.role}) เรียบร้อยแล้ว`,
      data: {
        ...user,
        national_id: user.role === 'patient' ? maskNationalId(user.national_id) : user.national_id
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. Equipment Catalog APIs
// ==========================================

// Get list of equipment with filters (category, search, status)
router.get('/equipment', async (req, res) => {
  try {
    const { category, search, status } = req.query;
    const equipment = await db.getEquipment({ category, search, status });
    res.json({ success: true, count: equipment.length, data: equipment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get equipment categories
router.get('/equipment/categories', async (req, res) => {
  try {
    const equipment = await db.getEquipment();
    const categories = ['all', ...new Set(equipment.map(e => e.category))];
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single equipment by ID
router.get('/equipment/:id', async (req, res) => {
  try {
    const item = await db.getEquipmentById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'ไม่พบอุปกรณ์ที่ระบุ' });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. Borrowing & Returning Workflow APIs
// ==========================================

// Get my loans (for current user)
router.get('/borrow/my-loans', async (req, res) => {
  try {
    const records = await db.getBorrowRecords({ userId: req.currentUser.user_id });
    
    // Group into active (borrowed, overdue, pending) and history (returned, rejected)
    const active = records.filter(r => ['borrowed', 'overdue', 'pending'].includes(r.status));
    const history = records.filter(r => ['returned', 'rejected'].includes(r.status));

    res.json({
      success: true,
      data: {
        active,
        history,
        totalActive: active.length,
        totalHistory: history.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Submit a new borrow request
router.post('/borrow/request', async (req, res) => {
  try {
    const { equipment_id, borrow_date, due_date, remarks, phone_number, full_name, national_id } = req.body;

    if (!equipment_id || !due_date) {
      return res.status(400).json({
        success: false,
        error: 'กรุณากรอกข้อมูลอุปกรณ์และวันที่กำหนดส่งคืนให้ครบถ้วน'
      });
    }

    const equipment = await db.getEquipmentById(equipment_id);
    if (!equipment) {
      return res.status(404).json({ success: false, error: 'ไม่พบอุปกรณ์ที่ต้องการยืม' });
    }

    if (equipment.status !== 'available') {
      return res.status(400).json({
        success: false,
        error: `ขออภัย อุปกรณ์นี้อยู่ในสถานะ "${equipment.status}" ไม่พร้อมให้ยืมในขณะนี้`
      });
    }

    // Update user contact if provided
    if (phone_number && req.currentUser) {
      req.currentUser.phone_number = phone_number;
    }

    const newRecord = await db.createBorrowRecord({
      userId: req.currentUser.user_id,
      equipmentId: equipment_id,
      borrowDate: borrow_date || new Date().toISOString().split('T')[0],
      dueDate: due_date,
      remarks: remarks || 'ยื่นคำขอผ่าน LINE LIFF'
    });

    res.status(201).json({
      success: true,
      message: 'ยื่นคำขอยืมอุปกรณ์เรียบร้อยแล้ว รอเจ้าหน้าที่ รพ.สต. ตรวจสอบและอนุมัติ',
      data: newRecord
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Staff: Get all borrow records with optional status filter
router.get('/borrow/records', requireRole(['staff', 'admin']), async (req, res) => {
  try {
    const { status } = req.query;
    const records = await db.getBorrowRecords({ status });
    res.json({ success: true, count: records.length, data: records });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Staff: Approve borrow request
router.post('/borrow/:id/approve', requireRole(['staff', 'admin']), async (req, res) => {
  try {
    const recordId = req.params.id;
    const record = await db.getBorrowRecordById(recordId);

    if (!record) {
      return res.status(404).json({ success: false, error: 'ไม่พบรายการคำขอยืมนี้' });
    }

    if (record.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `รายการนี้อยู่ในสถานะ ${record.status} ไม่สามารถอนุมัติได้`
      });
    }

    const updated = await db.approveBorrowRecord(recordId, req.currentUser.user_id);
    res.json({
      success: true,
      message: `อนุมัติคำขอยืมอุปกรณ์ ${record.equipment?.equipment_name} เรียบร้อยแล้ว`,
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Staff: Reject borrow request
router.post('/borrow/:id/reject', requireRole(['staff', 'admin']), async (req, res) => {
  try {
    const recordId = req.params.id;
    const { remarks } = req.body;
    const record = await db.getBorrowRecordById(recordId);

    if (!record) {
      return res.status(404).json({ success: false, error: 'ไม่พบรายการคำขอยืมนี้' });
    }

    const updated = await db.rejectBorrowRecord(recordId, req.currentUser.user_id, remarks);
    res.json({
      success: true,
      message: 'ปฏิเสธคำขอยืมเรียบร้อยแล้ว',
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Staff: Process equipment return (via QR Code or ID)
router.post('/borrow/:id/return', requireRole(['staff', 'admin']), async (req, res) => {
  try {
    const recordId = req.params.id;
    const { remarks } = req.body;
    const record = await db.getBorrowRecordById(recordId);

    if (!record) {
      return res.status(404).json({ success: false, error: 'ไม่พบรายการนี้' });
    }

    if (!['borrowed', 'overdue'].includes(record.status)) {
      return res.status(400).json({
        success: false,
        error: `รายการนี้อยู่ในสถานะ ${record.status} ไม่ได้อยู่ระหว่างยืม`
      });
    }

    const updated = await db.returnBorrowRecord(recordId, req.currentUser.user_id, remarks || 'รับคืนอุปกรณ์เรียบร้อย สภาพปกติ');
    res.json({
      success: true,
      message: `บันทึกการส่งคืนอุปกรณ์ ${record.equipment?.equipment_name} เรียบร้อยแล้ว อุปกรณ์พร้อมใช้งานในคลัง`,
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// QR Code / Asset code lookup (for staff scan & patient lookup)
router.get('/borrow/scan/:assetCode', async (req, res) => {
  try {
    const assetCode = req.params.assetCode;
    const equipment = await db.getEquipmentByAssetCode(assetCode);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        error: `ไม่พบอุปกรณ์รหัสครุภัณฑ์ "${assetCode}" ในระบบ`
      });
    }

    // Find active borrow record if any
    const activeRecords = await db.getBorrowRecords({
      equipmentId: equipment.equipment_id
    });
    const currentBorrow = activeRecords.find(r => ['borrowed', 'overdue', 'pending'].includes(r.status)) || null;

    res.json({
      success: true,
      data: {
        equipment,
        currentBorrow
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. Dashboard Stats & Notifications
// ==========================================

// Dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await db.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Simulate LINE OA Push Notification (validating rules.md 8:00 - 17:00 window)
router.post('/notifications/simulate-due-reminder', async (req, res) => {
  try {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Check rules.md: push message window 08:00 - 17:00
    const isWithinWindow = currentHour >= 8 && currentHour < 17;

    const overdueAndDueSoon = (await db.getBorrowRecords())
      .filter(r => ['borrowed', 'overdue'].includes(r.status));

    const notificationPayload = overdueAndDueSoon.map(r => ({
      userId: r.user?.line_user_id,
      userName: r.user?.full_name,
      equipmentName: r.equipment?.equipment_name,
      dueDate: r.due_date,
      status: r.status,
      message: r.status === 'overdue' 
        ? `⚠️ [รพ.สต. บ้านดอน] แจ้งเตือน: อุปกรณ์ ${r.equipment?.equipment_name} เกินกำหนดส่งคืน (${r.due_date}) โปรดติดต่อส่งคืนหรือแจ้งขอขยายเวลา`
        : `🔔 [รพ.สต. บ้านดอน] แจ้งเตือน: อุปกรณ์ ${r.equipment?.equipment_name} มีกำหนดส่งคืนในวันที่ ${r.due_date} กรุณาเตรียมการส่งคืน`
    }));

    res.json({
      success: true,
      isWithinStandardWindow: isWithinWindow,
      note: isWithinWindow ? 'ส่งข้อความตามกรอบเวลามาตรฐาน (08:00 - 17:00 น.)' : 'จำลองการส่งนอกเวลาเพื่อการทดสอบ (ระบบจริงจะตั้ง Cron Job ในช่วง 08:00 - 17:00 น.)',
      dispatchedCount: notificationPayload.length,
      notifications: notificationPayload
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reset database to seed
router.post('/admin/reset-db', requireRole(['admin']), async (req, res) => {
  try {
    db.resetToSeed();
    res.json({ success: true, message: 'รีเซ็ตข้อมูลทั้งหมดกลับสู่ค่าเริ่มต้นเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
