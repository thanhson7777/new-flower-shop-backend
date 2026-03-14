import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validator'
import { STATUS_REVIEW } from '~/utils/constants'

const REVIEW_COLLECTION_NAME = 'reviews'

const REVIEW_COLLECTION_SCHEMA = Joi.object({
  productId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  orderId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  rating: Joi.number().integer().min(1).max(5).required(),
  content: Joi.string().min(10).max(1000).required().trim(),
  images: Joi.array().items(Joi.string().trim()).default([]),

  adminReply: Joi.object({
    content: Joi.string().required().trim(),
    repliedAt: Joi.date().timestamp('javascript').default(Date.now)
  }).default(null),

  status: Joi.string().valid(...Object.values(STATUS_REVIEW)).default(STATUS_REVIEW.ACTIVE),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null)
})

const createNew = async (data) => {
  try {
    const validData = await REVIEW_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false, stripUnknown: true })
    const insertData = {
      ...validData,
      productId: new ObjectId(String(validData.productId)),
      userId: new ObjectId(String(validData.userId)),
      orderId: new ObjectId(String(validData.orderId))
    }
    const result = await GET_DB().collection(REVIEW_COLLECTION_NAME).insertOne(insertData)
    return result
  } catch (error) { throw error }
}

const checkUserReviewed = async (userId, productId, orderId) => {
  try {
    return await GET_DB().collection(REVIEW_COLLECTION_NAME).findOne({
      userId: new ObjectId(String(userId)),
      productId: new ObjectId(String(productId)),
      orderId: new ObjectId(String(orderId))
    })
  } catch (error) { throw error }
}

const calcAverageRating = async (productId) => {
  try {
    const defaultReviewResult = [{ ratingQuantity: 0, ratingAverage: 0 }]
    const result = await GET_DB().collection(REVIEW_COLLECTION_NAME).aggregate([
      {
        $match: {
          productId: new ObjectId(String(productId)),
          status: STATUS_REVIEW.ACTIVE
        }
      },
      {
        $group: {
          _id: '$productId',
          ratingQuantity: { $sum: 1 },
          ratingAverage: { $avg: '$rating' }
        }
      }
    ]).toArray()

    return result.length > 0 ? result[0] : defaultReviewResult[0]
  } catch (error) { throw error }
}

const getProductReviews = async (productId, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit
    const reviews = await GET_DB().collection(REVIEW_COLLECTION_NAME).aggregate([
      {
        $match: {
          productId: new ObjectId(String(productId)),
          status: STATUS_REVIEW.ACTIVE
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          rating: 1,
          content: 1,
          images: 1,
          createdAt: 1,
          adminReply: 1,
          'user.name': 1,
          'user.avatar': 1 // Giả sử user có file avatar
        }
      }
    ]).toArray()

    const total = await GET_DB().collection(REVIEW_COLLECTION_NAME).countDocuments({
      productId: new ObjectId(String(productId)),
      status: STATUS_REVIEW.ACTIVE
    })

    return { reviews, total }
  } catch (error) { throw error }
}

// Admin functions
const getAllReviews = async () => {
  try {
    const reviews = await GET_DB().collection(REVIEW_COLLECTION_NAME).aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          rating: 1,
          content: 1,
          images: 1,
          adminReply: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          'user.name': 1,
          'user.avatar': 1,
          'product.name': 1,
          'product.thumbnail': 1
        }
      }
    ]).toArray()
    return reviews
  } catch (error) { throw error }
}

const findOneById = async (id) => {
  try {
    return await GET_DB().collection(REVIEW_COLLECTION_NAME).findOne({ _id: new ObjectId(String(id)) })
  } catch (error) { throw error }
}

const updateReview = async (reviewId, updateData) => {
  try {
    const result = await GET_DB().collection(REVIEW_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(reviewId)) },
      { $set: { ...updateData, updatedAt: Date.now() } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw error }
}

const deleteReview = async (reviewId) => {
  try {
    const result = await GET_DB().collection(REVIEW_COLLECTION_NAME).deleteOne(
      { _id: new ObjectId(String(reviewId)) }
    )
    return result
  } catch (error) { throw error }
}

// Public function - Lấy reviews cho homepage (chỉ lấy reviews có status ACTIVE)
const getPublicReviews = async (limit = 6) => {
  try {
    const reviews = await GET_DB().collection(REVIEW_COLLECTION_NAME).aggregate([
      { $match: { status: STATUS_REVIEW.ACTIVE } },
      { $sort: { createdAt: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          rating: 1,
          content: 1,
          images: 1,
          createdAt: 1,
          'user.name': 1,
          'user.avatar': 1,
          'product.name': 1,
          'product.thumbnail': 1
        }
      }
    ]).toArray()
    return reviews
  } catch (error) { throw error }
}

export const reviewModel = {
  REVIEW_COLLECTION_NAME,
  REVIEW_COLLECTION_SCHEMA,
  createNew,
  checkUserReviewed,
  calcAverageRating,
  getProductReviews,
  // Admin functions
  getAllReviews,
  findOneById,
  updateReview,
  deleteReview,
  // Public functions
  getPublicReviews
}