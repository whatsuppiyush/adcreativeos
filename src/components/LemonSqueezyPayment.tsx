import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const lemonSqueezyApiInstance = axios.create({
  baseURL: 'https://api.lemonsqueezy.com/v1',
  headers: {
    Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { productId, userId, userEmail } = req.body;

    const response = await lemonSqueezyApiInstance.post('/checkouts', {
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            custom: {
              user_id: userId,
            },
            email: userEmail,
          },
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: process.env.LEMON_SQUEEZY_STORE_ID,
            },
          },
          variant: {
            data: {
              type: 'variants',
              id: productId,
            },
          },
        },
      },
    });

    const checkoutUrl = response.data.data.attributes.url;
    res.status(200).json({ checkoutUrl });
  } catch (error) {
    console.error('Error creating LemonSqueezy checkout:', error);
    res
      .status(500)
      .json({ message: 'An error occurred while creating the checkout' });
  }
}
