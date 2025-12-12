const router = require("express").Router();
const passport = require("passport");
const path = require("path");

// Start Google OAuth
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// OAuth callback route - Google redirects here after login
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

// Logout route (keep this with next!)
router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect("/");
  });
});

module.exports = router;
// Serve login page
router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

module.exports = router;