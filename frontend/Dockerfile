FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS dev
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

FROM base AS builder
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine AS prod
WORKDIR /app
ENV NODE_ENV production

# Next.js standalone runner output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
