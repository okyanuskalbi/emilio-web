const PAYTR_MERCHANT_ID = process.env.NEXT_PUBLIC_PAYTR_MERCHANT_ID
const PAYTR_MERCHANT_KEY = process.env.NEXT_PUBLIC_PAYTR_MERCHANT_KEY

interface PayTRTokenRequest {
  orderId: string
  amount: number
  email: string
  customerName: string
  userIpAddress: string
}

export async function generatePayTRToken(request: PayTRTokenRequest): Promise<string> {
  if (!PAYTR_MERCHANT_ID || !PAYTR_MERCHANT_KEY) {
    throw new Error('PayTR credentials not configured')
  }

  try {
    const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        merchant_id: PAYTR_MERCHANT_ID,
        user_ip: request.userIpAddress,
        merchant_oid: request.orderId,
        email: request.email,
        payment_amount: (request.amount * 100).toString(),
        currency: 'TL',
        test_mode: '1', // sandbox mode
        user_name: request.customerName,
        user_address: 'Test Address',
        user_phone: '05301234567',
        merchant_ok_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
        merchant_fail_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/failed`,
      }).toString(),
    })

    const text = await response.text()
    const result = JSON.parse(text)

    if (result.status !== 'success') {
      throw new Error(result.reason || 'PayTR token generation failed')
    }

    return result.token
  } catch (error) {
    console.error('PayTR error:', error)
    throw error
  }
}
