import 'dotenv/config'

type EnvironmentVariables = {
  port: string
  jwtSecret: string
}

export const env: EnvironmentVariables = {
  port: process.env.PORT ?? '3333',
  jwtSecret: process.env.JWT_SECRET ?? '78ff8711f227acdbc148f93c3298d610be59b9398bd76647ce07b11f0ecae0c8',
}