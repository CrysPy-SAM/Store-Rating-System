const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  }
}, { timestamps: true });

// UNIQUE: one rating per user per store
ratingSchema.index({ user: 1, store: 1 }, { unique: true });

/* ================= METHODS ================= */

ratingSchema.statics.getByStoreId = async function (storeId) {
  return this.find({ store: storeId })
    .populate('user', 'name email address')
    .sort({ createdAt: -1 });
};

ratingSchema.statics.getAverage = async function (storeId) {
  const res = await this.aggregate([
    { $match: { store: new mongoose.Types.ObjectId(storeId) } },
    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
  ]);
  return res.length ? res[0].avgRating.toFixed(1) : '0.0';
};

ratingSchema.statics.getCount = async function () {
  return this.countDocuments();
};

ratingSchema.statics.getDistribution = async function (storeId) {
  const rows = await this.aggregate([
    { $match: { store: new mongoose.Types.ObjectId(storeId) } },
    { $group: { _id: '$rating', count: { $sum: 1 } } }
  ]);

  const dist = { 5:0, 4:0, 3:0, 2:0, 1:0 };
  rows.forEach(r => dist[r._id] = r.count);
  return dist;
};

ratingSchema.statics.getUserRating = async function (userId, storeId) {
  return this.findOne({ user: userId, store: storeId });
};

ratingSchema.statics.getByUserId = async function (userId) {
  return this.find({ user: userId })
    .populate('store', 'name address')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Rating', ratingSchema);
