/**
 * Authentication, RBAC and PDPA compliance middleware
 * Implements security rules specified in rules.md
 */

const db = require('../db');

// In-memory active user session (Default: นายสมชาย ใจดี [patient])
let activeUserId = 3;

/**
 * Mask Thai National ID to adhere to PDPA rules: 3-5001-XXXXX-XX-X
 */
function maskNationalId(nationalId) {
  if (!nationalId) return null;
  const clean = nationalId.replace(/\D/g, '');
  if (clean.length !== 13) return nationalId;
  return `${clean[0]}-${clean.slice(1, 5)}-XXXXX-XX-${clean[12]}`;
}

/**
 * Middleware to attach current authenticated user
 */
async function attachUser(req, res, next) {
  try {
    // In production, extract user from LINE LIFF JWT ID Token or Header
    // In local dev/demo, use activeUserId or X-User-Id header
    const requestedUserId = req.headers['x-user-id'] || activeUserId;
    const user = await db.getUserById(requestedUserId);

    if (user) {
      req.currentUser = user;
    } else {
      // Fallback to first patient
      req.currentUser = await db.getUserById(3);
    }
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * RBAC Guard Middleware
 * Restricts endpoint to specific roles e.g. ['staff', 'admin']
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.currentUser) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: โปรดยืนยันตัวตนผ่าน LINE LIFF ก่อนทำรายการ'
      });
    }

    if (!allowedRoles.includes(req.currentUser.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: คุณไม่มีสิทธิ์เข้าถึงส่วนนี้ (ต้องการสิทธิ์: ${allowedRoles.join(', ')})`
      });
    }

    next();
  };
}

/**
 * Switch active simulated user
 */
function setActiveUserId(userId) {
  activeUserId = Number(userId);
}

function getActiveUserId() {
  return activeUserId;
}

module.exports = {
  maskNationalId,
  attachUser,
  requireRole,
  setActiveUserId,
  getActiveUserId
};
