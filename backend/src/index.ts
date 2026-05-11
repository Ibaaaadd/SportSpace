import cors from 'cors'
import dotenv from 'dotenv'
import express, { type Request, type Response } from 'express'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' })
})

const port = process.env.PORT ? Number(process.env.PORT) : 4000

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`)
})
