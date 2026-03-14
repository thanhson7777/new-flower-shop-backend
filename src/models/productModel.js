import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import { pagingSkipValue } from '~/utils/algorithm'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validator'
import { STATUS_PRODUCT, PRODUCT_TYPE } from '~/utils/constants'

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const PRODUCT_COLLECTION_NAME = 'products'
const PRODUCT_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().min(3).max(100).trim().strict(),
  categoryId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  slug: Joi.string().required().min(3).trim().strict(),

  type: Joi.string().valid(...Object.values(PRODUCT_TYPE)).default(PRODUCT_TYPE.FLOWER),

  mainFlower: Joi.string().trim().default('Đang cập nhật'),

  variants: Joi.array().items(
    Joi.object({
      size: Joi.string().required(),
      sku: Joi.string().trim().allow(null, ''),
      price: Joi.number().min(0).required(),
      stockQuantity: Joi.number().min(0).required().default(0)
    })
  ).min(1).required(),

  referencePrice: Joi.number().min(0).required(),

  description: Joi.string().trim().default(null),
  images: Joi.array().items(Joi.string().trim().allow(null, '')).default([]),

  ratingAverage: Joi.number().min(0).max(5).default(0),
  ratingQuantity: Joi.number().min(0).default(0),

  status: Joi.string().valid(...Object.values(STATUS_PRODUCT)).default(STATUS_PRODUCT.ACTIVE),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await PRODUCT_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false, allowUnknown: true })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)

    const newProduct = {
      ...validData,
      categoryId: new ObjectId(String(validData.categoryId))
    }
    return await GET_DB().collection(PRODUCT_COLLECTION_NAME).insertOne(newProduct)
  } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
  try {
    return await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOne({ _id: new ObjectId(String(id)) })
  } catch (error) { throw new Error(error) }
}

const getCrossSellAccessories = async (limit = 5) => {
  try {
    return await GET_DB().collection(PRODUCT_COLLECTION_NAME).find({
      _destroy: false,
      status: STATUS_PRODUCT.ACTIVE,
      type: PRODUCT_TYPE.ACCESSORY
    }).limit(limit).toArray()
  } catch (error) { throw new Error(error) }
}

const getProducts = async (page, itemsPerPage) => {
  try {
    const query = await GET_DB().collection(PRODUCT_COLLECTION_NAME).aggregate(
      [
        {
          $match: {
            _destroy: false,
            status: STATUS_PRODUCT.ACTIVE
          }
        },
        {
          $facet: {
            'queryProducts': [
              { $sort: { createdAt: -1 } },
              { $skip: pagingSkipValue(page, itemsPerPage) },
              { $limit: itemsPerPage }
            ],
            'queryTotalProducts': [
              { $count: 'countedAllProducts' }
            ]
          }
        }
      ]
    ).toArray()

    const res = query[0]

    return {
      products: res.queryProducts || [],
      totalProducts: res.queryTotalProducts[0]?.countedAllProducts || 0
    }
  } catch (error) { throw new Error(error) }
}

const update = async (productId, updateData) => {
  try {
    Object.keys(updateData).forEach(fielName => {
      if (INVALID_UPDATE_FIELDS.includes(fielName)) {
        delete updateData[fielName]
      }
    })

    if (updateData.categoryId) {
      updateData.categoryId = new ObjectId(String(updateData.categoryId))
    }

    updateData.updatedAt = Date.now()

    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(productId)) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const deleteByOneId = async (productId) => {
  try {
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(productId)) },
      {
        $set: {
          _destroy: true,
          updatedAt: Date.now()
        }
      },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const deleteManyByCategoryId = async (categoryId) => {
  try {
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).updateMany(
      { categoryId: new ObjectId(String(categoryId)) },
      {
        $set: {
          _destroy: true,
          updatedAt: Date.now()
        }
      }
    )
    return result
  } catch (error) { throw error }
}

const getAdminProducts = async () => {
  try {
    return await GET_DB().collection(PRODUCT_COLLECTION_NAME)
      .find({})
      .sort({ createdAt: -1 })
      .toArray()
  } catch (error) { throw new Error(error) }
}

const restoreProduct = async (productId) => {
  try {
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(productId)) },
      {
        $set: {
          _destroy: false,
          updatedAt: Date.now()
        }
      },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const forceDeleteProduct = async (productId) => {
  try {
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).deleteOne({
      _id: new ObjectId(String(productId))
    })
    return result
  } catch (error) { throw new Error(error) }
}

const updateProductStock = async (productId, size, quantitySold) => {
  try {
    const db = GET_DB().collection(PRODUCT_COLLECTION_NAME)
    const pId = new ObjectId(String(productId))

    await db.updateOne(
      { _id: pId, 'variants.size': size },
      {
        $inc: {
          'variants.$.stockQuantity': -quantitySold
        }
      }
    )
  } catch (error) { throw error }
}

const countLowStock = async (limit = 5) => {
  try {
    return await GET_DB().collection(PRODUCT_COLLECTION_NAME).countDocuments({
      'variants.stockQuantity': { $lt: limit },
      _destroy: { $ne: true }
    })
  } catch (error) {
    throw new Error(error)
  }
}

const updateRating = async (productId, ratingAverage, ratingQuantity) => {
  try {
    return await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(productId)) },
      { $set: { ratingAverage, ratingQuantity, updatedAt: Date.now() } },
      { returnDocument: 'after' }
    )
  } catch (error) { throw error }
}

const countTotalProducts = async () => {
  try {
    return await GET_DB().collection(PRODUCT_COLLECTION_NAME).countDocuments({})
  } catch (error) { throw error }
}

export const productModel = {
  PRODUCT_COLLECTION_NAME,
  PRODUCT_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getCrossSellAccessories,
  getProducts,
  update,
  deleteByOneId,
  deleteManyByCategoryId,
  getAdminProducts,
  restoreProduct,
  forceDeleteProduct,
  updateProductStock,
  countLowStock,
  updateRating,
  countTotalProducts
}
