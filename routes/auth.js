const router = require("express").Router();
const passport = require("passport");
const path = require("path");

// OAuth login route - triggers Google OAuth2 login process
router.get("/auth/google",
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
    res.redirect("/dashboard");
  }
);

// Logout route
router.get("/logout", (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect("/");
  });
});

// Serve dashboard page
router.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/dashboard.html"));
});

// Serve login page
router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

module.exports = router;
