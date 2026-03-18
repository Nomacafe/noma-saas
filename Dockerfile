FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PATH=/app/node_modules/.bin:$PATH

EXPOSE 3000

CMD ["sh", "-c", "next start -p ${PORT:-3000}"]
