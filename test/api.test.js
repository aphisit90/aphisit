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

    // --- TEST 2: Unauthenticated State & Auth Guard ---
    await test('2. Auth Gate - ตรวจสอบสถานะก่อน Login และการป้องกันการยืมเมื่อยังไม่ได้ล็อกอิน', async () => {
      // 2.1 GET /api/auth/me returns authenticated: false
      const meRes = await fetch(`${BASE_URL}/auth/me`);
      const meBody = await meRes.json();
      assert.strictEqual(meRes.status, 200);
      assert.strictEqual(meBody.authenticated, false);
      assert.strictEqual(meBody.data, null);

      // 2.2 Attempt to borrow without login returns 401
      const borrowRes = await fetch(`${BASE_URL}/borrow/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipment_id: 2, borrow_date: '2026-09-05', due_date: '2026-10-05' })
      });
      assert.strictEqual(borrowRes.status, 401);
    });

    // --- TEST 3: Login Authentication Flow & PDPA Masking ---
    await test('3. POST /api/auth/login - เข้าสู่ระบบด้วยข้อมูลประจำตัว (เบอร์โทร/User ID) และ PDPA Masking', async () => {
      // 3.1 Invalid login credentials
      const invalidRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: '0999999999' })
      });
      assert.strictEqual(invalidRes.status, 401);

      // 3.2 Valid login using phone number (0861112223 - นายสมชาย)
      const validRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: '0861112223' })
      });
      const validBody = await validRes.json();
      assert.strictEqual(validRes.status, 200);
      assert.strictEqual(validBody.success, true);
      assert.strictEqual(validBody.authenticated, true);
      assert.strictEqual(validBody.data.user_id, 3);
      assert.strictEqual(validBody.data.role, 'patient');

      // 3.3 Verify /api/auth/me is now authenticated and respects PDPA
      const meRes = await fetch(`${BASE_URL}/auth/me`);
      const meBody = await meRes.json();
      assert.strictEqual(meBody.authenticated, true);
      assert.strictEqual(meBody.data.user_id, 3);
      const maskedId = meBody.data.national_id;
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

    // --- TEST 10: Member Registration ---
    const testLineId = `U_TEST_PATIENT_${Date.now()}`;
    const testNationalId = '12' + Math.floor(10000000000 + Math.random() * 90000000000);
    let newUserId;

    await test('10. POST /api/auth/register - สมัครสมาชิกผู้ยืมใหม่ บันทึกลงตาราง users และตรวจจับข้อมูลซ้ำ', async () => {
      const regRes = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          line_user_id: testLineId,
          national_id: testNationalId,
          full_name: 'นายทดสอบ สมัครใหม่',
          phone_number: '0899998888',
          address: '99 หมู่ 9 ต.ทดสอบ อ.เมือง'
        })
      });
      const regBody = await regRes.json();
      assert.strictEqual(regRes.status, 201);
      assert.strictEqual(regBody.success, true);
      assert.strictEqual(regBody.data.full_name, 'นายทดสอบ สมัครใหม่');
      assert.strictEqual(regBody.data.role, 'patient');
      newUserId = regBody.data.user_id;

      // Duplicate test
      const dupRes = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          line_user_id: testLineId,
          national_id: testNationalId,
          full_name: 'คนซ้ำ',
          phone_number: '0800000000'
        })
      });
      assert.strictEqual(dupRes.status, 400);
    });

    // --- TEST 11: Borrower Isolation (Strict My-Loans Filtering) ---
    await test('11. GET /api/borrow/my-loans - ผู้ยืมใหม่ต้องเห็นเฉพาะรายการของตนเองเท่านั้น (ยังไม่มีประวัติของคนอื่น)', async () => {
      // Active user was automatically switched to newUserId
      const loansRes = await fetch(`${BASE_URL}/borrow/my-loans`);
      const loansBody = await loansRes.json();
      assert.strictEqual(loansRes.status, 200);
      assert.strictEqual(loansBody.success, true);
      assert.strictEqual(loansBody.data.user.user_id, newUserId);
      assert.strictEqual(loansBody.data.totalActive, 0, 'ผู้ใช้ใหม่ต้องยังไม่มีรายการยืมของตนเอง');
      assert.strictEqual(loansBody.data.totalHistory, 0, 'ผู้ใช้ใหม่ต้องไม่เห็นประวัติของผู้อื่น');
    });

    // --- TEST 12: Request & Rejection Status Tracking ---
    await test('12. Borrow Flow & Rejection - ยื่นขอยืม และตรวจสอบสถานะไม่อนุมัติ (rejected) พร้อมเหตุผล', async () => {
      // Find currently available equipment
      const availRes = await fetch(`${BASE_URL}/equipment?status=available`);
      const availBody = await availRes.json();
      assert(availBody.data.length > 0, 'ต้องมีอุปกรณ์ที่พร้อมยืม');
      const targetEquipment = availBody.data[0];

      // Submit loan request as new user
      const reqRes = await fetch(`${BASE_URL}/borrow/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipment_id: targetEquipment.equipment_id,
          borrow_date: '2026-10-10',
          due_date: '2026-11-10',
          remarks: 'ขอยืมเพื่อฟื้นฟูหลังข้อเท้าแพลง'
        })
      });
      const reqBody = await reqRes.json();
      assert.strictEqual(reqRes.status, 201, `Failed to submit borrow request: ${JSON.stringify(reqBody)}`);
      const newRecordId = reqBody.data.record_id;

      // Staff rejects the request with a reason
      await fetch(`${BASE_URL}/auth/switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 2 }) // Staff สมศรี
      });

      const rejectRes = await fetch(`${BASE_URL}/borrow/${newRecordId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks: 'อุปกรณ์รุ่นนี้เหมาะสำหรับผู้สูงอายุ แนะนำให้แพทย์ประเมินซ้ำ' })
      });
      assert.strictEqual(rejectRes.status, 200);

      // Switch back to new user and check status in my-loans
      await fetch(`${BASE_URL}/auth/switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: newUserId })
      });

      const checkRes = await fetch(`${BASE_URL}/borrow/my-loans`);
      const checkBody = await checkRes.json();
      assert.strictEqual(checkBody.success, true);
      assert.strictEqual(checkBody.data.history.length, 1);
      const rejectedLoan = checkBody.data.history[0];
      assert.strictEqual(rejectedLoan.status, 'rejected');
      assert(rejectedLoan.remarks.includes('แนะนำให้แพทย์ประเมินซ้ำ'));
    });

    // --- TEST 13: LINE LIFF Authentication ---
    await test('13. POST /api/auth/line - เข้าสู่ระบบผ่าน LINE LIFF Profile สำเร็จและสร้างผู้ใช้งานอัตโนมัติหากยังไม่มี', async () => {
      const lineRes = await fetch(`${BASE_URL}/auth/line`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          line_user_id: 'U9999_TEST_LINE_LOGIN',
          display_name: 'คุณสายใจ ทดสอบไลน์'
        })
      });
      const lineBody = await lineRes.json();
      assert.strictEqual(lineRes.status, 200);
      assert.strictEqual(lineBody.success, true);
      assert.strictEqual(lineBody.authenticated, true);
      assert.strictEqual(lineBody.user.line_user_id, 'U9999_TEST_LINE_LOGIN');
    });

    // --- TEST 14: Logout Flow ---
    await test('14. POST /api/auth/logout - ออกจากระบบสำเร็จ ล้างเซสชัน และกลับสู่สถานะ unauthenticated', async () => {
      const logoutRes = await fetch(`${BASE_URL}/auth/logout`, { method: 'POST' });
      const logoutBody = await logoutRes.json();
      assert.strictEqual(logoutRes.status, 200);
      assert.strictEqual(logoutBody.success, true);
      assert.strictEqual(logoutBody.authenticated, false);

      const meRes = await fetch(`${BASE_URL}/auth/me`);
      const meBody = await meRes.json();
      assert.strictEqual(meBody.authenticated, false);
      assert.strictEqual(meBody.data, null);
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
