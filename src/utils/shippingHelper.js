const FREE_SHIP_THRESHOLD = 500000
const FEE_DEFAULT = 30000

const calculateShippingFee = (province, district, totalProductPrice) => {
  if (totalProductPrice >= FREE_SHIP_THRESHOLD) {
    return 0
  }
  return FEE_DEFAULT
}

export const shippingHelper = {
  calculateShippingFee
}