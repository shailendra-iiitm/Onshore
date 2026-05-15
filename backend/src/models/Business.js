const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    type: { type: String, enum: ['restaurant', 'hotel'], default: 'restaurant' },
    website: { type: String, trim: true }
  },
  { timestamps: true }
);

businessSchema.index({ name: 1, city: 1 }, { unique: true });

module.exports = mongoose.model('Business', businessSchema);

