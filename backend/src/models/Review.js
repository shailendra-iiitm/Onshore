const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true
    },
    source: {
      type: String,
      enum: ['google', 'zomato', 'tripadvisor', 'swiggy', 'reddit', 'x', 'instagram', 'blog', 'other'],
      required: true
    },
    author: { type: String, required: true },
    content: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    reviewedAt: { type: Date, required: true },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
    topics: [{ type: String }],
    emotion: { type: String, default: 'neutral' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);

