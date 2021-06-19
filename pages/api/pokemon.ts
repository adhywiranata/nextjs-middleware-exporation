// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  let resp = {};
  if (req.headers.authorization && req.headers.authorization.length === 36) {
    const res = await fetch('https://pokeapi.co/api/v2/')
    const pokemon = await res.json()
    resp = { code: 'SUCCESS', data: pokemon }
  } else {
    resp = { code: 'UNAUTHORIZED', data: null }
  }

  res.status(200).json(resp)
}
