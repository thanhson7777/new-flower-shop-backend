import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cartModel } from '~/models/cartModel'
import { productModel } from '~/models/productModel'

const getCart = async (userId) => {
  return await cartModel.getCartWithProductDetails(userId)
}

const addToCart = async (userId, payload) => {
  const { productId, size, quantity } = payload

  const product = await productModel.findOneById(productId)
  if (!product || product._destroy || product.status !== 'active') {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Sản phẩm không khả dụng!')
  }

  const variant = product.variants.find(v => v.size === size)
  if (!variant) {
    throw new ApiError(StatusCodes.BAD_REQUEST, `Không tìm thấy size ${size} của sản phẩm này!`)
  }

  let currentCart = await cartModel.findByUserId(userId)
  if (!currentCart) {
    currentCart = await cartModel.createCart(userId)
  }

  let cartItems = [...currentCart.items]

  const itemIndex = cartItems.findIndex(i => i.productId.toString() === productId && i.size === size)

  if (itemIndex > -1) {
    const newQuantity = cartItems[itemIndex].quantity + quantity
    if (newQuantity > variant.stockQuantity) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Số lượng vượt quá tồn kho. Chỉ còn lại ${variant.stockQuantity} sản phẩm!`)
    }
    cartItems[itemIndex].quantity = newQuantity
  } else {
    if (quantity > variant.stockQuantity) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Số lượng vượt quá tồn kho. Chỉ còn lại ${variant.stockQuantity} sản phẩm!`)
    }
    cartItems.push({ productId, size, quantity })
  }

  await cartModel.updateCartItems(userId, cartItems)
  return await getCart(userId)
}

const updateCartItemQuantity = async (userId, payload) => {
  const { productId, size, quantity } = payload

  const product = await productModel.findOneById(productId)
  if (!product) throw new ApiError(StatusCodes.NOT_FOUND, 'Sản phẩm không khả dụng!')

  const variant = product.variants.find(v => v.size === size)
  if (!variant) throw new ApiError(StatusCodes.BAD_REQUEST, `Không tìm thấy size ${size}!`)

  if (quantity > variant.stockQuantity) {
    throw new ApiError(StatusCodes.BAD_REQUEST, `Số lượng yêu cầu vượt quá tồn kho (${variant.stockQuantity})!`)
  }

  const currentCart = await cartModel.findByUserId(userId)
  if (!currentCart) throw new ApiError(StatusCodes.NOT_FOUND, 'Giỏ hàng không tồn tại')

  const cartItems = currentCart.items.map(item => {
    if (item.productId.toString() === productId && item.size === size) {
      return { ...item, quantity }
    }
    return item
  })

  await cartModel.updateCartItems(userId, cartItems)
  return await getCart(userId)
}

const removeFromCart = async (userId, payload) => {
  const { productId, size } = payload

  const currentCart = await cartModel.findByUserId(userId)
  if (!currentCart) return null

  const cartItems = currentCart.items.filter(
    item => !(item.productId.toString() === productId && item.size === size)
  )

  await cartModel.updateCartItems(userId, cartItems)
  return await getCart(userId)
}

const syncCart = async (userId, payload) => {
  const { items } = payload

  let currentCart = await cartModel.findByUserId(userId)
  if (!currentCart) {
    currentCart = await cartModel.createCart(userId)
  }

  const cartItems = [...currentCart.items]

  for (const item of items) {
    const { productId, size, quantity } = item

    // Validate product exists and is active
    const product = await productModel.findOneById(productId)
    if (!product || product._destroy || product.status !== 'active') {
      continue
    }

    const variant = product.variants?.find(v => v.size === size)
    if (!variant) {
      continue
    }

    // Check stock
    const maxQuantity = variant.stockQuantity
    if (quantity > maxQuantity) {
      continue
    }

    const itemIndex = cartItems.findIndex(
      i => i.productId.toString() === productId && i.size === size
    )

    if (itemIndex > -1) {
      // Update quantity (keep the higher quantity)
      const newQuantity = Math.max(cartItems[itemIndex].quantity, quantity)
      if (newQuantity <= maxQuantity) {
        cartItems[itemIndex].quantity = newQuantity
      }
    } else {
      cartItems.push({ productId, size, quantity: Math.min(quantity, maxQuantity) })
    }
  }

  await cartModel.updateCartItems(userId, cartItems)
  return await getCart(userId)
}

export const cartService = {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  syncCart
}
