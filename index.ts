// This is an example of how to use the package
import { ZeroAccount } from './src'
import { Request, Response } from 'express'

import express from 'express'
const app = express()

app.use(express.json())

const zero = new ZeroAccount()

app.post('/zero/auth', async (req: Request, res: Response) => {
  try {
    const { data, metadata} = await zero.auth(req.headers, req.body)
    if (metadata.isWebhookRequest) return res.sendStatus(200);
    return res.status(200).json({data})
  } catch (err) {
    return res.status(401).json({ error: 'unauthenticated' })
  }
});

app.listen(process.env.PORT || 3000)
