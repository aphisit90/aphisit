/**
 * Authentication, RBAC and PDPA compliance middleware
 * Implements security rules specified in rules.md
 */

const db = require('../db');

// In-memory active user session (Default: null - require login)
let activeUserId = null;

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
    const requestedUserId = req.headers['x-user-id'] || activeUserId;
    if (requestedUserId) {
      const user = await db.getUserById(requestedUserId);
      req.currentUser = user || null;
    } else {
      req.currentUser = null;
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
        error: 'Unauthorized: กรุณาเข้าสู่ระบบก่อนทำรายการ'
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
 * Require login middleware
 */
function requireAuth(req, res, next) {
  if (!req.currentUser) {
    return res.status(401).json({
      success: false,
      error: 'กรุณาเข้าสู่ระบบก่อนทำรายการ'
    });
  }
  next();
}

/**
 * Switch active simulated user
 */
function setActiveUserId(userId) {
  activeUserId = userId ? Number(userId) : null;
}

function clearActiveUser() {
  activeUserId = null;
}

function getActiveUserId() {
  return activeUserId;
}

module.exports = {
  maskNationalId,
  attachUser,
  requireRole,
  requireAuth,
  setActiveUserId,
  clearActiveUser,
  getActiveUserId
};
