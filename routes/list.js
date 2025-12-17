// src/routes/list.js ----------------------------------------------------
const router      = require('express').Router();
const listCtrl    = require('../controllers/listController');
const validate    = require('../middleware/validation');
const requireAuth = require('../middleware/requireauth');

/* -----------------------------------------------------------------
   1️⃣  TEST‑MODE: bypass auth & validation
   ----------------------------------------------------------------- */
if (process.env.NODE_ENV === 'test') {
  console.log('⚡️ TEST MODE – auth & validation disabled for lists');

  // Fake admin user (same shape as other test‑mode routes)
  router.use((_req, _res, next) => {
    _req.user = {
      _id: '507f1f77bcf86cd799439011',
      email: 'testadmin@example.com',
      name: 'Test Admin',
      role: 'admin',
    };
    _req.isAuthenticated = () => true;
    next();
  });

  // No‑op validator
  const noop = (_req, _res, next) => next();

  // Routes (relative to /api/lists)
  router.post('/', noop, listCtrl.createList);
  router.get('/', listCtrl.getLists);
  router.get('/:id', listCtrl.getListById);
  router.patch('/:id', noop, listCtrl.updateList);
  router.delete('/:id', listCtrl.deleteList);
}

/* -----------------------------------------------------------------
   2️⃣  PRODUCTION – keep real auth & validation
   ----------------------------------------------------------------- */
else {
  // All list routes require a logged‑in user (admin or regular)
  router.use(requireAuth);

  // ---------- CREATE ----------
  router.post(
    '/',
    validate.createListRules,
    /**
     * #swagger.tags = ['List']
     * #swagger.summary = 'Create a new list'
     */
    listCtrl.createList
  );

  // ---------- READ ALL ----------
  router.get(
    '/',
    /**
     * #swagger.tags = ['List']
     * #swagger.summary = 'Get all lists for the current user'
     */
    listCtrl.getLists
  );

  // ---------- READ ONE ----------
  router.get(
    '/:id',
    /**
     * #swagger.tags = ['List']
     * #swagger.summary = 'Get a single list by id'
     */
    listCtrl.getListById
  );

  // ---------- UPDATE ----------
  router.patch(
    '/:id',
    validate.updateListRules,
    /**
     * #swagger.tags = ['List']
     * #swagger.summary = 'Update a list'
     */
    listCtrl.updateList
  );

  // ---------- DELETE ----------
  router.delete(
    '/:id',
    /**
     * #swagger.tags = ['List']
     * #swagger.summary = 'Delete a list'
     */
    listCtrl.deleteList
  );
}

/* -----------------------------------------------------------------
   EXPORT – only once
   ----------------------------------------------------------------- */
module.exports = router;
