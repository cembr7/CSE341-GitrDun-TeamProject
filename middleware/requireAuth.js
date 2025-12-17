// middleware/requireAuth.js

function requireAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({
    error: true,
    message: "Not authenticated. Please log in with Google.",
  });
}

module.exports = requireAuth;
