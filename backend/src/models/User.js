const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  address: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

/* ================= METHODS ================= */

storeSchema.statics.createStore = async function (data) {
  return this.create(data);
};

storeSchema.statics.findByIdWithRating = async function (id) {
  const res = await this.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: 'ratings',
        localField: '_id',
        foreignField: 'store',
        as: 'ratings'
      }
    },
    {
      $addFields: {
        rating: { $ifNull: [{ $avg: '$ratings.rating' }, 0] }
      }
    }
  ]);
  return res[0];
};

storeSchema.statics.findByEmail = async function (email) {
  return this.findOne({ email });
};

storeSchema.statics.getAll = async function (filters = {}, sort = {}, userId = null) {
  const pipeline = [];

  if (filters.name) pipeline.push({ $match: { name: new RegExp(filters.name, 'i') } });
  if (filters.address) pipeline.push({ $match: { address: new RegExp(filters.address, 'i') } });

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

  pipeline.push({ $sort: { [sort.field || 'name']: sort.order === 'desc' ? -1 : 1 } });

  return this.aggregate(pipeline);
};

storeSchema.statics.getCount = async function () {
  return this.countDocuments();
};

module.exports = mongoose.model('Store', storeSchema);
