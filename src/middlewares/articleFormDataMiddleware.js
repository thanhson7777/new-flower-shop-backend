import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const transformFormData = (req, res, next) => {
  try {
    // Log để debug
    // console.log('=== Article FormData Debug ===')
    // console.log('req.body:', req.body)
    // console.log('req.file:', req.file)
    // console.log('===============================')
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, 'Dữ liệu FormData không hợp lệ'))
  }
}

export const articleFormDataMiddleware = { transformFormData }
