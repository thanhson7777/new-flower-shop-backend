import { StatusCodes } from 'http-status-codes'
import { dashboardService } from '~/services/dashboardService'

const getDashboardData = async (req, res, next) => {
  try {
    const targetDate = req.query.targetDate || new Date(new Date().setMonth(new Date().getMonth() - 6))

    const data = await dashboardService.getDashboardData(targetDate)

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Lấy dữ liệu dashboard thành công!',
      data
    })
  } catch (error) { next(error) }
}

export const dashboardController = {
  getDashboardData
}
