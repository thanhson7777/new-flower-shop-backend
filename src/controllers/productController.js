import { StatusCodes } from 'http-status-codes'
import { productService } from '~/services/productService'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  try {
    const createdProduct = await productService.createNew(req.body, req.files)
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Tạo sản phẩm thành công!',
      data: createdProduct
    })
  } catch (error) { next(error) }
}

const getProducts = async (req, res, next) => {
  try {
    const { page, itemsPerPage, search, category, sort } = req.query

    const result = await productService.getProducts(
      page,
      itemsPerPage,
      search || null,
      category || null,
      sort || null
    )
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Lấy danh sách sản phẩm thành công!',
      data: result
    })
  } catch (error) { next(error) }
}

const getAccessories = async (req, res, next) => {
  try {
    const { limit } = req.query
    const result = await productService.getAccessories(limit)
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Lấy danh sách phụ kiện bán kèm thành công!',
      data: result
    })
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    const productId = req.params.id
    const product = await productService.getDetails(productId)

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Lấy chi tiết sản phẩm thành công!',
      data: product
    })
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const productId = req.params.id
    const updatedProduct = await productService.update(productId, req.body, req.files)

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Cập nhật sản phẩm thành công!',
      data: updatedProduct
    })
  } catch (error) { next(error) }
}

const deleteItem = async (req, res, next) => {
  try {
    const productId = req.params.id
    const product = await productService.deleteItem(productId)

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Xóa sản phẩm thành công!',
      data: product
    })
  } catch (error) { next(error) }
}

const getAdminProducts = async (req, res, next) => {
  try {
    const products = await productService.getAdminProducts()
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Lấy danh sách sản phẩm (admin) thành công!',
      data: products
    })
  } catch (error) { next(error) }
}

const restoreItem = async (req, res, next) => {
  try {
    const productId = req.params.id
    const restoredProduct = await productService.restoreItem(productId)
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Khôi phục sản phẩm thành công!',
      data: restoredProduct
    })
  } catch (error) { next(error) }
}

const forceDeleteItem = async (req, res, next) => {
  try {
    const productId = req.params.id
    const result = await productService.forceDeleteItem(productId)
    res.status(StatusCodes.OK).json({
      success: true,
      message: result.message
    })
  } catch (error) { next(error) }
}

const getRelatedProducts = async (req, res, next) => {
  try {
    const { id } = req.params
    const { categoryId, limit = 4 } = req.query

    if (!categoryId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Thiếu categoryId')
    }

    const products = await productService.getRelatedProducts(id, categoryId, parseInt(limit, 10))
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Lấy sản phẩm liên quan thành công!',
      data: products
    })
  } catch (error) { next(error) }
}

export const productController = {
  createNew,
  getProducts,
  getAccessories,
  getDetails,
  getRelatedProducts,
  update,
  deleteItem,
  getAdminProducts,
  restoreItem,
  forceDeleteItem
}
