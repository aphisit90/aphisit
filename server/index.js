/**
 * CareBridge LIFF - Main Express Application
 * Sub-district Health Promoting Hospital Medical Equipment Loan System
 */

require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const { attachUser } = require('./middleware/auth');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach user session / mock LINE identity
app.use(attachUser);

// Serve static assets and mock screens
app.use('/equipment_catalog', express.static(path.join(__dirname, '../equipment_catalog')));
app.use('/borrow_request_form', express.static(path.join(__dirname, '../borrow_request_form')));
app.use('/my_loans', express.static(path.join(__dirname, '../my_loans')));
app.use('/qr_staff_portal', express.static(path.join(__dirname, '../qr_staff_portal')));
app.use('/assets/logo', express.static(path.join(__dirname, '../.._logo')));
app.use('/assets/avatar', express.static(path.join(__dirname, '../friendly_thai_healthcare_worker_or_caregiver_in_casual_neat_polo_uniform')));

// Mount API routes
app.use('/api', apiRoutes);

// Serve Integrated Frontend
app.use(express.static(path.join(__dirname, '../public')));

// Fallback to index.html for SPA routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Standard Error Handling Middleware (per rules.md section 4.3)
app.use((err, req, res, next) => {
  console.error('[ServerError]', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    status: status,
    error: err.message || 'เกิดข้อผิดพลาดภายในระบบเซิร์ฟเวอร์'
  });
});

if (require.main === module) {
  // API สำหรับยืนยันตัวตน LINE และตรวจสอบ/บันทึกผู้ใช้งาน
app.post('/api/auth/line', async (req, res) => {
  const { line_user_id, display_name } = req.body;

  if (!line_user_id) {
    return res.status(400).json({ success: false, message: 'กรุณาระบุ line_user_id' });
  }

  try {
    // 1. ตรวจสอบว่ามี line_user_id นี้ในตาราง users หรือยัง
    const [rows] = await db.query('SELECT * FROM users WHERE line_user_id = ?', [line_user_id]);

    if (rows.length > 0) {
      // มีผู้ใช้อยู่แล้ว ส่งข้อมูลผู้ใช้กลับไป
      return res.json({ success: true, user: rows[0] });
    } else {
      // ยังไม่มี ให้สร้างผู้ใช้ใหม่โดยใช้ชื่อจาก LINE
      const [result] = await db.query(
        'INSERT INTO users (full_name, line_user_id, role) VALUES (?, ?, "patient")',
        [display_name || 'ผู้ใช้งาน LINE', line_user_id]
      );

      // ดึงข้อมูลผู้ใช้ที่เพิ่งสร้าง
      const [newUser] = await db.query('SELECT * FROM users WHERE user_id = ?', [result.insertId]);
      return res.json({ success: true, user: newUser[0] });
    }
  } catch (error) {
    console.error('Line Auth Error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการยืนยันตัวตน' });
  }
});
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` CareBridge LIFF Server running at: http://localhost:${PORT}`);
    console.log(` - Catalog:        http://localhost:${PORT}/#catalog`);
    console.log(` - Borrow Request: http://localhost:${PORT}/#borrow`);
    console.log(` - My Loans:       http://localhost:${PORT}/#myloans`);
    console.log(` - Staff Portal:   http://localhost:${PORT}/#staff`);
    console.log(` - API Base:       http://localhost:${PORT}/api/equipment`);
    console.log(`====================================================`);
  });
}

module.exports = app;
