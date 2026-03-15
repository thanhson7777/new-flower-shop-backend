import { slugify } from '~/utils/formatter'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { productModel } from '~/models/productModel'
import { reviewModel } from '~/models/reviewModel'
import { DEFAULT_PAGE, DEFAULT_ITEM_PER_PAGE } from '~/utils/constants'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import { categoryModel } from '~/models/categoryModel'

const createNew = async (reqBody, reqFiles) => {
  try {
    const newProductData = {
      ...reqBody,
      slug: slugify(reqBody.name)
    }

    const foundCategory = await categoryModel.findOneById(reqBody.categoryId)
    if (!foundCategory) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Danh mục không tồn tại!')
    }

    if (reqFiles && reqFiles.length > 0) {
      const uploadPromises = reqFiles.map(file => CloudinaryProvider.streamUpload(file.buffer, 'image-product-flower-shop'))
      const uploadResults = await Promise.all(uploadPromises)

      newProductData.images = uploadResults.map(res => res.secure_url)
      newProductData.image = uploadResults[0].secure_url
    }

    const createdProduct = await productModel.createNew(newProductData)
    const getNewProduct = await productModel.findOneById(createdProduct.insertedId)
    return getNewProduct
  } catch (error) { throw error }
}

const getProducts = async (page, itemsPerPage, search = null, category = null, sort = null) => {
  try {
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEM_PER_PAGE

    const results = await productModel.getProducts(
      parseInt(page, 10),
      parseInt(itemsPerPage, 10),
      search,
      category,
      sort
    )

    return results
  } catch (error) { throw new Error(error) }
}

const getAccessories = async (limit) => {
  try {
    return await productModel.getCrossSellAccessories(limit ? parseInt(limit, 10) : 5)
  } catch (error) {
    throw new Error(error)
  }
}

const getDetails = async (productId) => {
  const product = await productModel.findOneById(productId)
  if (!product) throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy sản phẩm')

  // Lấy 5 review mới nhất hiển thị ở chi tiết
  const reviewData = await reviewModel.getProductReviews(productId, 1, 5)
  product.recentReviews = reviewData.reviews
  product.totalReviews = reviewData.total

  return product
}

const update = async (productId, reqBody, reqFiles) => {
  try {
    const updateData = {
      ...reqBody
    }

    if (reqFiles && reqFiles.length > 0) {
      const uploadPromises = reqFiles.map(file => CloudinaryProvider.streamUpload(file.buffer, 'image-product-flower-shop'))
      const uploadResults = await Promise.all(uploadPromises)

      updateData.images = uploadResults.map(res => res.secure_url)
      updateData.image = uploadResults[0].secure_url
    }

    if (updateData.name) {
      updateData.slug = slugify(updateData.name)
    }

    const updatedData = await productModel.update(productId, updateData)
    return updatedData
  } catch (error) { throw error }
}

const deleteItem = async (productId) => {
  try {
    const product = await productModel.findOneById(productId)
    if (!product) throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy sản phẩm')
    await productModel.deleteByOneId(productId)
    return { deleteResult: 'Đã xóa thành công!' }
  } catch (error) { throw error }
}

const getAdminProducts = async () => {
  const products = await productModel.getAdminProducts()
  return products
}

const restoreItem = async (productId) => {
  const restoredProduct = await productModel.restoreProduct(productId)
  if (!restoredProduct) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy sản phẩm để khôi phục!')
  }
  return restoredProduct
}

const forceDeleteItem = async (productId) => {
  const result = await productModel.forceDeleteProduct(productId)
  if (result.deletedCount === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Sản phẩm không tồn tại hoặc đã bị xóa!')
  }
  return { message: 'Đã xóa vĩnh viễn sản phẩm thành công!' }
}

const getRelatedProducts = async (productId, categoryId, limit = 4) => {
  try {
    return await productModel.getRelatedProducts(productId, categoryId, limit)
  } catch (error) { throw new Error(error) }
}

export const productService = {
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
