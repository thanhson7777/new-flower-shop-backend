import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validator'

const CART_COLLECTION_NAME = 'carts'

const CART_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      size: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required()
    })
  ).default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null)
})

const findByUserId = async (userId) => {
  return await GET_DB().collection(CART_COLLECTION_NAME).findOne({ userId: new ObjectId(String(userId)) })
}

const createCart = async (userId) => {
  const newCart = { userId: new ObjectId(String(userId)), items: [], createdAt: Date.now(), updatedAt: null }
  const result = await GET_DB().collection(CART_COLLECTION_NAME).insertOne(newCart)
  return { ...newCart, _id: result.insertedId }
}

const updateCartItems = async (userId, items) => {
  const normalizedItems = items.map(item => ({
    ...item,
    productId: new ObjectId(String(item.productId))
  }))

  const result = await GET_DB().collection(CART_COLLECTION_NAME).findOneAndUpdate(
    { userId: new ObjectId(String(userId)) },
    { $set: { items: normalizedItems, updatedAt: Date.now() } },
    { returnDocument: 'after' }
  )
  return result
}

const clearCart = async (userId) => {
  const result = await GET_DB().collection(CART_COLLECTION_NAME).findOneAndUpdate(
    { userId: new ObjectId(String(userId)) },
    { $set: { items: [], updatedAt: Date.now() } },
    { returnDocument: 'after' }
  )
  return result
}

const getCartWithProductDetails = async (userId) => {
  const result = await GET_DB().collection(CART_COLLECTION_NAME).aggregate([
    { $match: { userId: new ObjectId(String(userId)) } },
    { $unwind: { path: '$items', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'products',
        localField: 'items.productId',
        foreignField: '_id',
        as: 'productDetail'
      }
    },
    { $unwind: { path: '$productDetail', preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        'items.productName': '$productDetail.name',
        'items.productImage': '$productDetail.image',
        'items.slug': '$productDetail.slug',
        'items.isActive': '$productDetail.status',
        'items.variantDetail': {
          $filter: {
            input: { $ifNull: ['$productDetail.variants', []] },
            as: 'variant',
            cond: { $eq: ['$$variant.size', '$items.size'] }
          }
        }
      }
    },
    {
      $addFields: {
        'items.currentPrice': { $arrayElemAt: ['$items.variantDetail.price', 0] },
        'items.maxStock': { $arrayElemAt: ['$items.variantDetail.stockQuantity', 0] }
      }
    },
    {
      $group: {
        _id: '$_id',
        userId: { $first: '$userId' },
        updatedAt: { $first: '$updatedAt' },
        items: {
          $push: {
            $cond: [
              { $not: ['$items.productId'] },
              '$$REMOVE',
              {
                productId: '$items.productId',
                size: '$items.size',
                quantity: '$items.quantity',
                name: '$items.productName',
                image: '$items.productImage',
                slug: '$items.slug',
                price: '$items.currentPrice',
                stockQuantity: '$items.maxStock',
                isActive: '$items.isActive'
              }
            ]
          }
        }
      }
    }
  ]).toArray()

  if (result.length === 0) {
    const newCart = await createCart(userId)
    return newCart
  }
  return result[0]
}

export const cartModel = {
  CART_COLLECTION_NAME,
  CART_COLLECTION_SCHEMA,
  findByUserId,
  createCart,
  updateCartItems,
  clearCart,
  getCartWithProductDetails
}
