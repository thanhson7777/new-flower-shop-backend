/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import { StatusCodes } from 'http-status-codes'
import { paymentService } from '~/services/paymentService'

const vnpayReturn = async (req, res, next) => {
  try {
    const result = await paymentService.verifyVnpayIpn(req.query)
    if (result.RspCode === '00') {
      res.redirect(`${process.env.WEBISTE_DOMAIN_DEVELOPMENT}/order-success?payment=success`)
    } else {
      res.redirect(`${process.env.WEBISTE_DOMAIN_DEVELOPMENT}/order-success?payment=failed`)
    }
  } catch (error) {
    console.error('Lỗi Return VNPAY:', error)
    res.redirect(`${process.env.WEBISTE_DOMAIN_DEVELOPMENT}/order-success?payment=error`)
  }
}

const vnpayIpn = async (req, res, next) => {
  try {
    const result = await paymentService.verifyVnpayIpn(req.query)
    console.log('result', result)
    res.status(200).json(result)
  } catch (error) {
    console.error('Lỗi IPN VNPAY:', error)
    res.status(200).json({ RspCode: '99', Message: 'Unknown Error' })
  }
}

const momoCallback = async (req, res, next) => {
  try {
    const momoParams = Object.keys(req.body).length > 0 ? req.body : req.query

    await paymentService.verifyMomoCallback(momoParams)

    res.status(StatusCodes.NO_CONTENT).send()
  } catch (error) {
    console.error('Lỗi IPN MOMO:', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message })
  }
}

const momoReturn = async (req, res, next) => {
  try {
    const momoParams = Object.keys(req.body).length > 0 ? req.body : req.query

    const { resultCode } = momoParams

    if (String(resultCode) === '0') {
      await paymentService.verifyMomoCallback(momoParams)
      res.redirect(`${process.env.WEBISTE_DOMAIN_DEVELOPMENT}/order-success?payment=success`)
    } else {
      res.redirect(`${process.env.WEBISTE_DOMAIN_DEVELOPMENT}/order-success?payment=failed`)
    }
  } catch (error) {
    console.error('Lỗi Return MOMO:', error)
    res.redirect(`${process.env.WEBISTE_DOMAIN_DEVELOPMENT}/order-success?payment=error`)
  }
}

export const paymentController = {
  vnpayReturn,
  vnpayIpn,
  momoCallback,
  momoReturn
}