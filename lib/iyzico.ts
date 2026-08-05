const IYZICO_API_KEY = process.env.NEXT_PUBLIC_IYZICO_API_KEY
const IYZICO_SECRET_KEY = process.env.NEXT_PUBLIC_IYZICO_SECRET_KEY

interface IyzicoCheckoutRequest {
  orderId: string
  amount: number
  email: string
  customerName: string
}

export async function createIyzicoCheckoutForm(request: IyzicoCheckoutRequest): Promise<string> {
  if (!IYZICO_API_KEY || !IYZICO_SECRET_KEY) {
    throw new Error('iyzico credentials not configured')
  }

  try {
    const response = await fetch('https://api.iyzipay.com/v1/checkout-form/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${IYZICO_API_KEY}:${IYZICO_SECRET_KEY}`).toString('base64')}`,
      },
      body: JSON.stringify({
        locale: 'tr',
        conversationId: request.orderId,
        price: request.amount,
        priceCurrency: 'TRY',
        basketId: request.orderId,
        paymentGroup: 'PRODUCT',
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/iyzico-callback`,
        buyer: {
          id: `buyer_${request.orderId}`,
          name: request.customerName.split(' ')[0],
          surname: request.customerName.split(' ')[1] || 'Customer',
          gsmNumber: '+905301234567',
          email: request.email,
          identityNumber: '12345678901',
          lastLoginDate: new Date().toISOString(),
          registrationDate: new Date().toISOString(),
          registrationAddress: 'Test Address',
          ip: '127.0.0.1',
          city: 'Istanbul',
          country: 'Turkey',
          zipCode: '34000',
        },
        shippingAddress: {
          contactName: request.customerName,
          city: 'Istanbul',
          country: 'Turkey',
          address: 'Test Address',
          zipCode: '34000',
        },
        billingAddress: {
          contactName: request.customerName,
          city: 'Istanbul',
          country: 'Turkey',
          address: 'Test Address',
          zipCode: '34000',
        },
        basketItems: [
          {
            id: request.orderId,
            name: 'Order',
            category1: 'Jewelry',
            itemType: 'PHYSICAL',
            price: request.amount,
          },
        ],
      }),
    })

    const data = await response.json()

    if (data.status !== 'success') {
      throw new Error(data.errorMessage || 'iyzico checkout creation failed')
    }

    return data.checkoutFormContent
  } catch (error) {
    console.error('iyzico error:', error)
    throw error
  }
}
