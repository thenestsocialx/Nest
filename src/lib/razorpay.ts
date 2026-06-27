import Razorpay from 'razorpay'

let _client: Razorpay | null = null

export function getRazorpay(): Razorpay {
  if (!_client) {
    const key_id = process.env.RAZORPAY_KEY_ID
    const key_secret = process.env.RAZORPAY_KEY_SECRET
    if (!key_id || !key_secret) throw new Error('Razorpay credentials not configured')
    _client = new Razorpay({ key_id, key_secret })
  }
  return _client
}
