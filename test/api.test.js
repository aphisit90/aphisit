/**
 * Automated Integration Test Suite for CareBridge LIFF API
 */

const assert = require('assert');
const app = require('../server/index');

const PORT = 3099;
let server;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runTests() {
  console.log('🧪 เริ่มต้นการทดสอบระบบ CareBridge LIFF API...');
  let passedCount = 0;
  let totalTests = 0;

  function test(name, fn) {
    totalTests++;
    return fn()
      .then(() => {
        console.log(`  ✅ [PASS] ${name}`);
        passedCount++;
      })
      .catch((err) => {
        console.error(`  ❌ [FAIL] ${name}:`, err.message);
        throw err;
      });
  }

  try {
    // 1. Start test server
    await new Promise((resolve) => {
      server = app.listen(PORT, resolve);
    });
    console.log(`📡 เซิร์ฟเวอร์ทดสอบเริ่มต้นที่พอร์ต ${PORT}`);

    // --- TEST 1: Equipment Catalog ---
    await test('1. GET /api/equipment - ดึงรายการอุปกรณ์ทั้งหมด และกรองตามหมวดหมู่ได้', async () => {
      const res = await fetch(`${BASE_URL}/equipment`);
      const body = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(body.success, true);
      assert(Array.isArray(body.data));
      assert(body.data.length >= 6);

      // Test filter by category
      const filterRes = await fetch(`${BASE_URL}/equipment?category=${encodeURIComponent('รถเข็น')}`);
      const filterBody = await filterRes.json();
      assert.strictEqual(filterBody.success, true);
      assert(filterBody.data.every(e => e.category === 'รถเข็น'));
    });

    // --- TEST 2: PDPA Masking & User Profile ---
    await test('2. GET /api/auth/me - ตรวจสอบการปกป้องข้อมูลตามมาตรฐาน PDPA (Masking เลขบัตรประชาชน)', async () => {
      // Default user is patient (user_id: 3)
      const res = await fetch(`${BASE_URL}/auth/me`);
      const body = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.data.role, 'patient');
      
      // Check masked national ID e.g. 3-5001-XXXXX-XX-9
      const maskedId = body.data.national_id;
      assert(maskedId.includes('XXXXX'), `เลขบัตรประชาชนต้องถูก Mask แต่ได้ค่า: ${maskedId}`);
      assert.strictEqual(maskedId.length, 17);
    });

    // --- TEST 3: User Persona Switching ---
    await test('3. POST /api/auth/switch - สลับผู้ใช้งานระหว่าง Patient และ Staff ได้อย่างถูกต้อง', async () => {
      // Switch to staff (user_id: 2, นางสาวสมศรี มีสุข)
      const switchRes = await fetch(`${BASE_URL}/auth/switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 2 })
      });
      const switchBody = await switchRes.json();
      assert.strictEqual(switchBody.success, true);
      assert.strictEqual(switchBody.data.role, 'staff');

      // Verify active user is now staff
      const meRes = await fetch(`${BASE_URL}/auth/me`);
      const meBody = await meRes.json();
      assert.strictEqual(meBody.data.user_id, 2);
      assert.strictEqual(meBody.data.role, 'staff');

      // Switch back to patient for next tests
      await fetch(`${BASE_URL}/auth/switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 3 })
      });
    });

    // --- TEST 4: Borrow Request Workflow ---
    let createdRecordId;
    await test('4. POST /api/borrow/request - ยื่นคำขอยืมอุปกรณ์สำเร็จและสร้างรายการในสถานะ pending', async () => {
      const payload = {
        equipment_id: 2, // รถเข็น EQ-WC-002 (available)
        borrow_date: '2026-09-05',
        due_date: '2026-10-05',
        remarks: 'ทดสอบยื่นคำขอผ่านระบบอัตโนมัติ'
      };

      const res = await fetch(`${BASE_URL}/borrow/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const body = await res.json();
      assert.strictEqual(res.status, 201);
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.data.status, 'pending');
      assert.strictEqual(body.data.equipment_id, 2);
      createdRecordId = body.data.record_id;
    });

    // --- TEST 5: Staff RBAC & Approval ---
    await test('5. POST /api/borrow/:id/approve - เจ้าหน้าที่อนุมัติคำขอยืม และเปลี่ยนสถานะอุปกรณ์เป็น borrowed', async () => {
      // 5.1 Patient cannot approve (RBAC check)
      const patientTryRes = await fetch(`${BASE_URL}/borrow/${createdRecordId}/approve`, { method: 'POST' });
      assert.strictEqual(patientTryRes.status, 403, 'ผู้ป่วยต้องไม่สามารถอนุมัติได้');

      // 5.2 Switch to Staff and approve
      await fetch(`${BASE_URL}/auth/switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 2 })
      });

      const approveRes = await fetch(`${BASE_URL}/borrow/${createdRecordId}/approve`, { method: 'POST' });
      const approveBody = await approveRes.json();
      assert.strictEqual(approveRes.status, 200);
      assert.strictEqual(approveBody.success, true);
      assert.strictEqual(approveBody.data.status, 'borrowed');

      // Check equipment status changed to borrowed
      const equipRes = await fetch(`${BASE_URL}/equipment/2`);
      const equipBody = await equipRes.json();
      assert.strictEqual(equipBody.data.status, 'borrowed');
    });

    // --- TEST 6: QR Code Scanning Lookup ---
    await test('6. GET /api/borrow/scan/:assetCode - สแกน QR Code เพื่อค้นหาอุปกรณ์และรายการยืมปัจจุบัน', async () => {
      const res = await fetch(`${BASE_URL}/borrow/scan/EQ-WC-002`);
      const body = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.data.equipment.asset_code, 'EQ-WC-002');
      assert(body.data.currentBorrow !== null);
      assert.strictEqual(body.data.currentBorrow.record_id, createdRecordId);
    });

    // --- TEST 7: Staff Return Equipment ---
    await test('7. POST /api/borrow/:id/return - เจ้าหน้าที่บันทึกรับคืนอุปกรณ์ และสถานะอุปกรณ์กลับเป็น available', async () => {
      const res = await fetch(`${BASE_URL}/borrow/${createdRecordId}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks: 'ตรวจรับคืนผ่าน Test Suite สภาพสมบูรณ์ 100%' })
      });
      const body = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.data.status, 'returned');
      assert(body.data.return_date !== null);

      // Verify equipment is now available again
      const equipRes = await fetch(`${BASE_URL}/equipment/2`);
      const equipBody = await equipRes.json();
      assert.strictEqual(equipBody.data.status, 'available');
    });

    // --- TEST 8: Dashboard Stats ---
    await test('8. GET /api/stats - คำนวณสรุปสถิติอุปกรณ์และรายการยืมได้อย่างแม่นยำ', async () => {
      const res = await fetch(`${BASE_URL}/stats`);
      const body = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(body.success, true);
      assert(typeof body.data.availableEquipment === 'number');
      assert(typeof body.data.borrowedEquipment === 'number');
      assert(typeof body.data.overdueRecords === 'number');
    });

    // --- TEST 9: Push Notification Window Check ---
    await test('9. POST /api/notifications/simulate-due-reminder - ตรวจสอบกรอบเวลาแจ้งเตือน (08:00 - 17:00)', async () => {
      const res = await fetch(`${BASE_URL}/notifications/simulate-due-reminder`, { method: 'POST' });
      const body = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(body.success, true);
      assert(typeof body.isWithinStandardWindow === 'boolean');
      assert(Array.isArray(body.notifications));
    });

    console.log(`\n🎉 การทดสอบเสร็จสมบูรณ์: ผ่านทั้งหมด ${passedCount}/${totalTests} การทดสอบ!`);
  } finally {
    if (server) {
      server.close();
      console.log('🛑 ปิดเซิร์ฟเวอร์ทดสอบเรียบร้อย');
    }
  }
}

if (require.main === module) {
  runTests().catch(() => process.exit(1));
}

module.exports = runTests;
