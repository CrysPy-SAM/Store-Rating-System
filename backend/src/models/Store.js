const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 60
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    address: {
      type: String
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

/* ================= STATIC METHODS ================= */

storeSchema.statics.getAll = async function (filters = {}, sort = {}, userId = null) {
  const pipeline = [];

  if (filters.name) {
    pipeline.push({ $match: { name: new RegExp(filters.name, 'i') } });
  }
  if (filters.email) {
    pipeline.push({ $match: { email: new RegExp(filters.email, 'i') } });
  }
  if (filters.address) {
    pipeline.push({ $match: { address: new RegExp(filters.address, 'i') } });
  }

  pipeline.push({
    $lookup: {
      from: 'ratings',
      localField: '_id',
      foreignField: 'store',
      as: 'ratings'
    }
  });

  pipeline.push({
    $addFields: {
      rating: { $ifNull: [{ $avg: '$ratings.rating' }, 0] }
    }
  });

  if (userId) {
    pipeline.push({
      $addFields: {
        user_rating: {
          $let: {
            vars: {
              ur: {
                $filter: {
                  input: '$ratings',
                  as: 'r',
                  cond: { $eq: ['$$r.user', new mongoose.Types.ObjectId(userId)] }
                }
              }
            },
            in: { $arrayElemAt: ['$$ur.rating', 0] }
          }
        }
      }
    });
  }

  pipeline.push({
    $sort: {
      [sort.field || 'name']: sort.order === 'desc' ? -1 : 1
    }
  });

  return this.aggregate(pipeline);
};

/* ================= EXPORT ================= */

module.exports =
  mongoose.models.Store || mongoose.model('Store', storeSchema);
