# Introduction
This project consists in an API to invest in Bitcoins.

# Running Locally
1. Use the project version of node: `nvm install` and then `nvm use`; (Download and configure NVM [here](https://github.com/nvm-sh/nvm))
   1. Optionally, can manually download Node 22.11.0 and use it.
2. Install dependencies: `yarn`;
3. Copy `.env.example` to `.env`: `cp .env.example .env`;
4. Start docker: `docker compose up` (Can use -d flag to detach from terminal);
5. Generate *Prisma* and run migrations: `yarn db`;
6. Run tests: `yarn test` or `yarn test:coverage`.
