const router = require("express").Router();
const passport = require("passport");
const path = require("path");

// Start Google OAuth
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// OAuth callback - Google redirects here after login
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
    session: true,
  }),
  (req, res) => {
    // Successful login, redirect to dashboard
    res.redirect("/dashboard.html");
  }
);

// Logout route
router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect("/");
  });
});

// Serve a login page (if you want a dedicated route)
router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

module.exports = router;
