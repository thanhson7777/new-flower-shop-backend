import { StatusCodes } from 'http-status-codes'
import { cartService } from '~/services/cartService'

const getCart = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const cart = await cartService.getCart(userId)

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Lấy thông tin giỏ hàng thành công',
      data: cart
    })
  } catch (error) { next(error) }
}

const addToCart = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const updatedCart = await cartService.addToCart(userId, req.body)

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Đã thêm sản phẩm vào giỏ hàng',
      data: updatedCart
    })
  } catch (error) { next(error) }
}

const updateCart = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const updatedCart = await cartService.updateCartItemQuantity(userId, req.body)

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Cập nhật số lượng thành công',
      data: updatedCart
    })
  } catch (error) { next(error) }
}

const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const updatedCart = await cartService.removeFromCart(userId, req.body)

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Đã xoá sản phẩm khỏi giỏ hàng',
      data: updatedCart
    })
  } catch (error) { next(error) }
}

const syncCart = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const updatedCart = await cartService.syncCart(userId, req.body)

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Đồng bộ giỏ hàng thành công',
      data: updatedCart
    })
  } catch (error) { next(error) }
}

export const cartController = {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  syncCart
}
