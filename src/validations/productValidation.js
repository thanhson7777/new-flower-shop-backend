import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validator'
import { STATUS_PRODUCT, PRODUCT_TYPE } from '~/utils/constants'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    name: Joi.string().required().min(3).max(100).trim().strict(),
    categoryId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    type: Joi.string().valid(...Object.values(PRODUCT_TYPE)).optional(),
    mainFlower: Joi.string().trim().optional(),
    referencePrice: Joi.number().min(0).required(),
    description: Joi.string().trim().allow(null, '').optional(),

    variants: Joi.array().items(
      Joi.object({
        size: Joi.string().required(),
        sku: Joi.string().trim().allow(null, ''),
        price: Joi.number().min(0).required(),
        stockQuantity: Joi.number().min(0).required().default(0)
      })
    ).min(1).required(),

    status: Joi.string().valid(...Object.values(STATUS_PRODUCT)).optional()
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const update = async (req, res, next) => {
  const correctCondition = Joi.object({
    name: Joi.string().min(3).max(100).trim().strict(),
    categoryId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    type: Joi.string().valid(...Object.values(PRODUCT_TYPE)).optional(),
    mainFlower: Joi.string().trim().optional(),
    referencePrice: Joi.number().min(0),
    description: Joi.string().trim().allow(null, '').optional(),

    variants: Joi.array().items(
      Joi.object({
        size: Joi.string().required(),
        sku: Joi.string().trim().allow(null, ''),
        price: Joi.number().min(0).required(),
        stockQuantity: Joi.number().min(0).required().default(0)
      })
    ).min(1),

    status: Joi.string().valid(...Object.values(STATUS_PRODUCT)).optional()
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const checkProductId = async (req, res, next) => {
  const correctCondition = Joi.object({
    id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  })

  try {
    await correctCondition.validateAsync(req.params)
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

export const productValidation = {
  createNew,
  update,
  checkProductId
}
