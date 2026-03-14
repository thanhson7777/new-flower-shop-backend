import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const transformFormData = (req, res, next) => {
  try {
    if (req.body.variants && typeof req.body.variants === 'string') {
      req.body.variants = JSON.parse(req.body.variants)
    }

    if (req.body.referencePrice) {
      req.body.referencePrice = Number(req.body.referencePrice)
    }

    next()
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, 'Chuỗi JSON không hợp lệ trong FormData'))
  }
}

export const productFormDataMiddleware = { transformFormData }