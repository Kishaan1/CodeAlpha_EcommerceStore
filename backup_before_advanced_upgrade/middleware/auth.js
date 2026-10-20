/**
 * middleware/auth.js
 * ------------------
 * Verifies the JWT sent in the Authorization header (Bearer <token>)
 * and attaches the decoded payload to req.user. Used to protect any
 * route that requires a logged-in user (placing orders, viewing order
 * history, fetching the current profile, etc).
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'codealpha_dev_secret_change_me';

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Your session has expired. Please log in again.' });
  }
}

module.exports = { authenticate, JWT_SECRET };
