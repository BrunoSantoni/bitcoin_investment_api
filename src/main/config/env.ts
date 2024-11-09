import 'dotenv/config'

type EnvironmentVariables = {
  port: string
}

export const env: EnvironmentVariables = {
  port: process.env.PORT ?? '3333',
}
