/**
 * MySQL Database Setup & Initialization Script
 * Reads database/schema.sql and executes on MySQL server
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function setupDatabase() {
  console.log('🔄 กำลังเชื่อมต่อ MySQL เพื่อติดตั้งฐานข้อมูล hospital_equipment_db...');

  // First connect without specifying database to create database if not exists
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = 'root'; // Setup typically runs as root or admin
  const password = ''; // Default XAMPP password is empty

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true,
      charset: 'utf8mb4'
    });
    console.log('✅ เชื่อมต่อ MySQL Server สำเร็จ');
  } catch (err) {
    console.error('❌ ไม่สามารถเชื่อมต่อ MySQL ในฐานะ root ได้:', err.message);
    console.log('💡 โปรดตรวจสอบว่า MySQL ใน XAMPP หรือ Service เปิดทำงานอยู่บนพอร์ต 3306');
    process.exit(1);
  }

  try {
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('📥 กำลังรันคำสั่ง DDL, DCL, และ DML จาก database/schema.sql...');
    await connection.query(sql);

    console.log('✨ [สำเร็จ] ติดตั้งฐานข้อมูล hospital_equipment_db เรียบร้อยแล้ว!');

    // Show summary counts
    await connection.query('USE hospital_equipment_db');
    const [u] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [e] = await connection.query('SELECT COUNT(*) as count FROM equipment');
    const [b] = await connection.query('SELECT COUNT(*) as count FROM borrow_records');

    console.log('📊 สรุปข้อมูลในฐานข้อมูล:');
    console.log(`   - ผู้ใช้งาน (users):          ${u[0].count} รายการ`);
    console.log(`   - อุปกรณ์ทางการแพทย์ (equipment): ${e[0].count} รายการ`);
    console.log(`   - ประวัติการยืม-คืน (borrow):    ${b[0].count} รายการ`);
    console.log('\n🔐 สร้างผู้ใช้ฐานข้อมูลตาม rules.md:');
    console.log('   - app_user@localhost (CRUD สิทธิ์สำหรับ Backend)');
    console.log('   - report_user@localhost (SELECT สิทธิ์สำหรับ Dashboard/Report)');
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาดขณะรัน Schema:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

setupDatabase();
