import { orderModel } from '~/models/orderModel'
import { productModel } from '~/models/productModel'
import { userModel } from '~/models/userModel'

const getDashboardData = async (targetDate) => {
  try {
    const [
      totalOrders,
      totalRevenueResult,
      orderStatusStats,
      revenueOverTime,
      recentOrders,
      totalProducts,
      totalUsers
    ] = await Promise.all([
      orderModel.countTotalOrders(),
      orderModel.calculateTotalRevenue(),
      orderModel.getOrderStatusStats(),
      orderModel.getRevenueOverTime(targetDate || new Date(new Date().setMonth(new Date().getMonth() - 6))), // Default 6 months ago
      orderModel.getRecentOrders(5),
      productModel.countTotalProducts(),
      userModel.countTotalUsers()
    ])

    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].totalRevenue : 0

    return {
      totalOrders,
      totalRevenue,
      totalProducts,
      totalUsers,
      orderStatusStats,
      revenueOverTime,
      recentOrders
    }
  } catch (error) { throw error }
}

export const dashboardService = {
  getDashboardData
}
