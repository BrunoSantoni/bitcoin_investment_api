# Introduction
This project consists in an API to invest in Bitcoins.

# Running Locally with Docker
1. Copy `.env.example` to `.env`: `cp .env.example .env` (At `./src/main/config/env` a default JWT Secret is defined just to be easier to test);
2. Add the value of `.env` missing fields (The SendGrid API Key and SendGrid API sender will be sent privately if you want to use the account I created);
3. Start docker: `docker compose up` (Can use -d flag to detach from terminal);
4. Generate *Prisma* and run migrations: `yarn db`;
5. Run tests: `yarn test` or `yarn test:coverage`.

# Running Locally without Docker
1. Use the project version of node: `nvm install` and then `nvm use`; (Download and configure NVM [here](https://github.com/nvm-sh/nvm))
   1. Optionally, can manually download Node 22.11.0 and use it.
2. Install dependencies: `yarn`;
3. Copy `.env.example` to `.env`: `cp .env.example .env` (At `./src/main/config/env` a default JWT Secret is defined just to be easier to test);
4. Start docker for DB: `docker compose up db` (Can use -d flag to detach from terminal);
5. Start docker for RabbitMQ: `docker compose up rabbitmq`;
6. Generate *Prisma* and run migrations: `yarn db`;
7. Run tests: `yarn test` or `yarn test:coverage`;
8. Run application locally: `yarn start:local:watch` or `yarn start:local`.
# Observations
- The SendGrid API Key and SendGrid API sender will be sent privately if you want to use the account I created;
- Integration tests uses database, be sure to run them on docker or locally before running tests.

# Endpoints

## Create new account
`POST /account`

### Request
```shell
curl --request POST \
  --url http://{api_url}/account \
  --header 'Content-Type: application/json' \
  --data '{
	"name": "Teste usuário",
	"email": "teste@mail.com",
	"password": "12345678"
  }'
```

### Response
`Status Code: 201 Created`
```json
{
	"id": "uuid-for-the-created-user"
}
```

## Login into existing account
`POST /login`

### Request
```shell
curl --request POST \
  --url http://{api_url}/login \
  --header 'Content-Type: application/json' \
  --data '{
	"email": "teste@mail.com",
	"password": "12345678"
  }'
```

### Response
`Status Code: 200 OK`
```json
{
  "accessToken": "jwt-token"
}
```

## Make a deposit into account
`POST /account/deposit`

### Request
```shell
curl --request POST \
  --url http://{api_url}/account/deposit \
  --header 'Authorization: Bearer jwt-token' \
  --header 'Content-Type: application/json' \
  --data '{
	"amount": 20
  }'
```

### Response
`Status Code: 204 No Content`

## Obtain account balance
`GET /account/balance`

### Request
```shell
curl --request GET \
  --url http://{api_url}/account/balance \
  --header 'Authorization: Bearer jwt-token'
```

### Response
`Status Code: 200 OK`
```json
{
  "balance": 100
}
```

# Next Steps
Here are the next steps I will be working on:
- Add the endpoints to consult Bitcoin value, get user balance, buy BTC and sell BTC;
- Convert console.logs to Winston and add more logs;
- Add API Key to increase security;
- Add Redis to cache bitcoin response;
- Abstract Fastify architecture (currently the API is attached to him);
- Add E2E tests;
- Add password reset.
