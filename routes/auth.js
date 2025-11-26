const router = require("express").Router();
const passport = require("passport");

// OAuth login route - triggers Google OAuth2 login process
router.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// OAuth callback route - Google redirects here after login
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: true,
  }),
  (req, res) => {
    // Successful login, do not redirect anywhere for now
    res.send("Login successful");
  }
);

// Logout route
router.get("/logout", (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect("/");
  });
});

module.exports = router;
