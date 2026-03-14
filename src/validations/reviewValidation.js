import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validator'

const createNew = async (req, res, next) => {
  const schema = Joi.object({
    productId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    orderId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    rating: Joi.number().integer().min(1).max(5).required().messages({
      'any.required': 'Chưa chọn số sao đánh giá',
      'number.min': 'Đánh giá tối thiểu là 1 sao',
      'number.max': 'Đánh giá tối đa là 5 sao'
    }),
    content: Joi.string().min(10).max(1000).required().trim().messages({
      'string.min': 'Nội dung đánh giá quá ngắn (tối thiểu 10 ký tự)',
      'string.max': 'Nội dung đánh giá quá dài (tối đa 1000 ký tự)',
      'any.required': 'Chưa nhập nội dung đánh giá'
    }),
    images: Joi.array().items(Joi.string().trim()).default([])
  })

  try {
    await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const reviewValidation = {
  createNew
}
