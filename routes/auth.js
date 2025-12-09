const router = require("express").Router();
const passport = require("passport");

// Start Google OAuth
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// OAuth callback route - Google redirects here after login
router.get("/auth/google/callback", (req, res, next) => {
  passport.authenticate("google", (err, user, info) => {
    if (err) {
      console.error("Google OAuth error:", err);
      return res.status(500).json({
        error: true,
        message: "Google OAuth error",
        details: err.message || err,
      });
    }

    if (!user) {
      console.error("Google OAuth failed, info:", info);
      return res.status(401).json({
        error: true,
        message: "Google OAuth login failed",
        details: info || "No user returned from Google",
      });
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error("Error establishing session:", loginErr);
        return res.status(500).json({
          error: true,
          message: "Failed to establish session",
          details: loginErr.message || loginErr,
        });
      }

      // Success!
      return res.redirect("/");
    });
  })(req, res, next);
});

// Logout route (keep this with next!)
router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect("/");
  });
});

module.exports = router;