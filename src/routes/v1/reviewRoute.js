import express from 'express'
import { reviewValidation } from '~/validations/reviewValidation'
import { reviewController } from '~/controllers/reviewController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

// Public route - Lấy reviews cho homepage (không cần auth)
Router.route('/public')
  .get(reviewController.getPublicReviews)

// User routes
Router.route('/')
  .post(
    authMiddleware.isAuthorized,
    reviewValidation.createNew,
    reviewController.createNew
  )

// Admin routes
Router.route('/admin')
  .get(
    authMiddleware.isAuthorized,
    authMiddleware.isAuthorizedAdmin,
    reviewController.getReviews
  )

Router.route('/admin/:id')
  .get(
    authMiddleware.isAuthorized,
    authMiddleware.isAuthorizedAdmin,
    reviewController.getDetails
  )
  .put(
    authMiddleware.isAuthorized,
    authMiddleware.isAuthorizedAdmin,
    reviewController.update
  )
  .delete(
    authMiddleware.isAuthorized,
    authMiddleware.isAuthorizedAdmin,
    reviewController.deleteItem
  )

export const reviewRoute = Router
