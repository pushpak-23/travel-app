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
COPY package*.json ./
RUN npm install --production --ignore-scripts
COPY --from=builder /app/dist ./dist
EXPOSE 5000
CMD ["npm", "start"]
