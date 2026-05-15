const express = require('express');
const businessRoutes   = require('./business.routes');
const reputationRoutes = require('./reputation.routes');
const router = express.Router();
router.use('/business',   businessRoutes);
router.use('/reputation', reputationRoutes);
module.exports = router;
