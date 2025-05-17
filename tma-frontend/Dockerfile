# Stage 1: Builder
FROM node:24-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Copy package files first for better layer caching
COPY package.json package-lock.json ./

# Install dependencies (including devDependencies)
RUN npm ci

# Copy all files and build the application
COPY . .
RUN npm run build

# Stage 2: Runner
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# # Create a non-root user and switch to it
# RUN addgroup -g 1001 -S nodejs && \
#     adduser -S -u 1001 -G nodejs nodejs && \
#     chown -R nodejs:nodejs /app
# USER nodejs

EXPOSE 3000
CMD ["npm", "start"]