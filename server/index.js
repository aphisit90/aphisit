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
