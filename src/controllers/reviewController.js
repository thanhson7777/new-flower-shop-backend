import { StatusCodes } from 'http-status-codes'
import { reviewService } from '~/services/reviewService'

const createNew = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const createdReview = await reviewService.createNew(userId, req.body)

    res.status(StatusCodes.CREATED).json({
      message: 'Đánh giá sản phẩm thành công',
      data: createdReview
    })
  } catch (error) {
    next(error)
  }
}

// Admin functions
const getReviews = async (req, res, next) => {
  try {
    const reviews = await reviewService.getAllReviews()
    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Lấy danh sách đánh giá thành công',
      data: reviews
    })
  } catch (error) {
    next(error)
  }
}

const getDetails = async (req, res, next) => {
  try {
    const reviewId = req.params.id
    const review = await reviewService.getReviewDetails(reviewId)
    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Lấy chi tiết đánh giá thành công',
      data: review
    })
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const reviewId = req.params.id
    const updatedReview = await reviewService.updateReview(reviewId, req.body)
    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Cập nhật đánh giá thành công',
      data: updatedReview
    })
  } catch (error) {
    next(error)
  }
}

const deleteItem = async (req, res, next) => {
  try {
    const reviewId = req.params.id
    const result = await reviewService.deleteReview(reviewId)
    res.status(StatusCodes.OK).json({
      status: 'success',
      message: result.deleteResult
    })
  } catch (error) {
    next(error)
  }
}

// Public function - Lấy reviews cho homepage
const getPublicReviews = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 6
    const reviews = await reviewService.getPublicReviews(limit)
    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Lấy danh sách đánh giá thành công',
      data: reviews
    })
  } catch (error) {
    next(error)
  }
}

export const reviewController = {
  createNew,
  // Admin functions
  getReviews,
  getDetails,
  update,
  deleteItem,
  // Public functions
  getPublicReviews
}
