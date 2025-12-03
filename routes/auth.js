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
    // Successful login, redirect to index.html
    res.redirect("/dashboard.html");
  }
);

// Logout route
router.get("/logout", (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect("/");
  });
});

// Serve login page
router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

module.exports = router;
