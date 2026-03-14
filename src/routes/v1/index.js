import express from 'express'
import { userRoute } from '~/routes/v1/userRoute'
import { categoryRoute } from '~/routes/v1/categoryRoute'
import { couponRoute } from '~/routes/v1/couponRoute'
import { articleRoute } from '~/routes/v1/articleRoute'
import { productRoute } from '~/routes/v1/productRoute'
import { cartRoute } from '~/routes/v1/cartRoute'
import { orderRoute } from '~/routes/v1/orderRoute'
import { paymentRoute } from './paymentRoute'
import { reviewRoute } from './reviewRoute'
import { dashboardRoute } from './dashboardRoute'
import { contactRoute } from './contactRoute'

const Router = express.Router()

Router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to API version 1.0.0'
  })
})

Router.use('/users', userRoute)
Router.use('/categories', categoryRoute)
Router.use('/products', productRoute)
Router.use('/carts', cartRoute)
Router.use('/coupons', couponRoute)
Router.use('/articles', articleRoute)
Router.use('/orders', orderRoute)
Router.use('/payments', paymentRoute)
Router.use('/reviews', reviewRoute)
Router.use('/dashboard', dashboardRoute)
Router.use('/contacts', contactRoute)

export const APIS_V1 = Router
