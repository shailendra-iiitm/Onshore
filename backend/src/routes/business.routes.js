const express = require('express');
const Business = require('../models/Business');
const { seedIfEmpty } = require('../services/bootstrap.service');

const router = express.Router();

/**
 * POST /api/business/search
 * Find-or-create a business by name + city, then seed it with reviews if empty.
 */
router.post('/search', async (req, res, next) => {
  try {
    const { name, city, type = 'restaurant', website = '' } = req.body;

    if (!name || !city) {
      return res.status(400).json({ error: 'name and city are required' });
    }

    const business = await Business.findOneAndUpdate(
      { name: name.trim(), city: city.trim() },
      { $setOnInsert: { name: name.trim(), city: city.trim(), type, website } },
      { new: true, upsert: true }
    );

    await seedIfEmpty(business);

    return res.json(business);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

