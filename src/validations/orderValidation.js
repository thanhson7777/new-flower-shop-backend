import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { PAYMENT_METHOD } from '~/utils/constants'
import { PHONE_RULE, OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validator' // Gom import cho gọn

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    buyerInfo: Joi.object({
      fullname: Joi.string().required().min(2).trim().strict(),
      phone: Joi.string().required().pattern(PHONE_RULE)
    }).required(),

    receiverAddress: Joi.object({
      fullname: Joi.string().required().min(2).trim().strict(),
      phone: Joi.string().required().pattern(PHONE_RULE),
      province: Joi.string().required().trim(),
      district: Joi.string().required().trim(),
      address: Joi.string().required().min(5)
    }).required(),

    deliveryInfo: Joi.object({
      deliveryDate: Joi.date().iso().required(),
      deliveryTimeSlot: Joi.string().required(),
      cardMessage: Joi.string().allow('', null).optional(),
      isAnonymous: Joi.boolean().optional(),
      note: Joi.string().allow('', null).optional()
    }).required(),

    paymentMethod: Joi.string().required().valid(...Object.values(PAYMENT_METHOD))
      .default(PAYMENT_METHOD.COD),

    couponCode: Joi.string().allow(null, '').optional(),
    couponId: Joi.string().pattern(OBJECT_ID_RULE).optional(),

    shippingFee: Joi.number().min(0).required(),
    totalProductPrice: Joi.number().min(0).required(),

    items: Joi.array().items(Joi.object({
      productId: Joi.string().pattern(OBJECT_ID_RULE).required(),
      size: Joi.string().required(),
      name: Joi.string().required(),
      price: Joi.number().min(0).required(),
      quantity: Joi.number().min(1).required(),
      image: Joi.string().required()
    })).min(1).required()
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false, stripUnknown: true })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const checkOrderId = async (req, res, next) => {
  const condition = Joi.object({
    id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  })
  try {
    await condition.validateAsync(req.params)
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

export const orderValidation = { createNew, checkOrderId }