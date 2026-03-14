import { reviewModel } from '~/models/reviewModel'
import { productModel } from '~/models/productModel'
import { orderModel } from '~/models/orderModel'
import { STATUS_ORDER } from '~/utils/constants'
import { STATUS_REVIEW } from '~/utils/constants'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createNew = async (userId, data) => {
  const order = await orderModel.findOneById(data.orderId)
  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy đơn hàng')
  }
  if (order.userId.toString() !== userId.toString()) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền đánh giá đơn hàng này')
  }

  if (order.status !== STATUS_ORDER.DELIVERED) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Đơn hàng chưa được giao, không thể đánh giá')
  }

  const itemInOrder = order.items.find(item => item.productId.toString() === data.productId.toString())
  if (!itemInOrder) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Sản phẩm không nằm trong đơn hàng này')
  }

  const existingReview = await reviewModel.checkUserReviewed(userId, data.productId, data.orderId)
  if (existingReview) {
    throw new ApiError(StatusCodes.CONFLICT, 'Bạn đã đánh giá sản phẩm này trong đơn hàng rồi')
  }

  const reviewData = {
    ...data,
    userId
  }
  const result = await reviewModel.createNew(reviewData)

  const ratingStats = await reviewModel.calcAverageRating(data.productId)

  await productModel.updateRating(data.productId, ratingStats.ratingAverage, ratingStats.ratingQuantity)

  return { ...reviewData, _id: result.insertedId }
}

// Admin functions
const getAllReviews = async () => {
  try {
    const reviews = await reviewModel.getAllReviews()
    return reviews
  } catch (error) { throw error }
}

const getReviewDetails = async (reviewId) => {
  try {
    const review = await reviewModel.findOneById(reviewId)
    if (!review) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy đánh giá!')
    }
    return review
  } catch (error) { throw error }
}

const updateReview = async (reviewId, data) => {
  try {
    const review = await reviewModel.findOneById(reviewId)
    if (!review) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy đánh giá!')
    }

    const updateData = {}
    if (data.status !== undefined) {
      updateData.status = data.status
    }
    if (data.adminReply !== undefined) {
      updateData.adminReply = data.adminReply
    }

    const updatedReview = await reviewModel.updateReview(reviewId, updateData)

    // Recalculate rating if status changed
    if (data.status !== undefined) {
      const ratingStats = await reviewModel.calcAverageRating(review.productId)
      await productModel.updateRating(review.productId, ratingStats.ratingAverage, ratingStats.ratingQuantity)
    }

    return updatedReview
  } catch (error) { throw error }
}

const deleteReview = async (reviewId) => {
  try {
    const review = await reviewModel.findOneById(reviewId)
    if (!review) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy đánh giá!')
    }

    await reviewModel.deleteReview(reviewId)

    // Recalculate rating after delete
    const ratingStats = await reviewModel.calcAverageRating(review.productId)
    await productModel.updateRating(review.productId, ratingStats.ratingAverage, ratingStats.ratingQuantity)

    return { deleteResult: 'Xóa đánh giá thành công!' }
  } catch (error) { throw error }
}

// Public function - Lấy reviews cho homepage
const getPublicReviews = async (limit = 6) => {
  try {
    const reviews = await reviewModel.getPublicReviews(limit)
    return reviews
  } catch (error) { throw error }
}

export const reviewService = {
  createNew,
  // Admin functions
  getAllReviews,
  getReviewDetails,
  updateReview,
  deleteReview,
  // Public functions
  getPublicReviews
}
