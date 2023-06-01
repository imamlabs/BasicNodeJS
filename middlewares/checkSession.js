// File: middlewares/checkSession.js
const checkSession = (req, res, next) => {
  if (req.session.lastActivity && Date.now() - req.session.lastActivity > 300000) {
    req.session.destroy();
    res.redirect('/');
  } else {
    req.session.lastActivity = Date.now();
    next();
  }
};

module.exports = checkSession;
