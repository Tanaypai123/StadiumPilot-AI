import express from 'express'
import dotenv from 'dotenv'
import crypto from 'node:crypto'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'


dotenv.config()

const { createServerConfig } = await import('./config/serverConfig.js')
const { createGeminiConfig } = await import('./config/geminiConfig.js')
const { configureGeminiClient } = await import('./services/geminiClient.js')

const geminiConfig = createGeminiConfig()
let startupInfo = null
try {
  startupInfo = await configureGeminiClient(geminiConfig)
} catch (error) {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'error',
    event: 'server_startup_aborted',
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : String(error),
  }))

  process.exit(1)
}

const { registerAiRoutes } = await import('./routes/ai.js')

const app = express()
const { port } = createServerConfig()

console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'info',
  event: 'server_startup',
  hasApiKey: startupInfo.hasApiKey,
  apiKeyPrefix: startupInfo.apiKeyPrefix,
  requestedModel: startupInfo.requestedModel,
  selectedModel: startupInfo.selectedModel,
  clientCreated: startupInfo.clientCreated,
  modelCreated: startupInfo.modelCreated,
  port,
}))

const corsOptions = {
  origin: (origin, callback) => {
    // Dynamically reflect the request origin to guarantee CORS compatibility
    callback(null, true)
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
}

app.use(cors(corsOptions))
app.options(/.*/, cors(corsOptions))

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per 15 mins
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
})
app.use('/api', apiLimiter)


app.use((request, response, next) => {
  const requestId = typeof request.headers['x-request-id'] === 'string' && request.headers['x-request-id'].trim()
    ? request.headers['x-request-id'].trim()
    : crypto.randomUUID()

  request.requestId = requestId
  response.setHeader('x-request-id', requestId)
  next()
})

app.use(express.json({ limit: '16kb' }))

app.get('/health', (_request, response) => {
  response.json({ ok: true })
})

registerAiRoutes(app)

app.use((error, _request, response, _next) => {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'error',
    event: 'server_error',
    message: error instanceof Error ? error.message : 'Unknown error',
  }))
  response.status(500).json({
    error: 'Internal server error',
  })
})

app.listen(port, () => {
  console.log(`Gemini server listening on http://localhost:${port}`)
})
