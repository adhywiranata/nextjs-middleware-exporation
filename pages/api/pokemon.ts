// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import Cookies from 'cookies'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  let resp = {};
  const cookies = new Cookies(req, res);
  if (cookies.get('PHPSESSID')) {
    const res = await fetch('https://pokeapi.co/api/v2/')
    const pokemon = await res.json()
    resp = { code: 'SUCCESS', data: pokemon }
  } else {
    resp = { code: 'UNAUTHORIZED', data: null }
  }

  res.status(200).json(resp)
}