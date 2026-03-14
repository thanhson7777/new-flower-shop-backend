import express from 'express'
import { cartController } from '~/controllers/cartController'
import { cartValidation } from '~/validations/cartValidation'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.use(authMiddleware.isAuthorized)

Router.route('/')
  .get(cartController.getCart)

Router.route('/add')
  .post(
    cartValidation.addToCart,
    cartController.addToCart
  )

Router.route('/update')
  .put(
    cartValidation.updateCart,
    cartController.updateCart
  )

Router.route('/remove')
  .delete(
    cartValidation.removeFromCart,
    cartController.removeFromCart
  )

Router.route('/sync')
  .post(
    cartValidation.syncCart,
    cartController.syncCart
  )

export const cartRoute = Router