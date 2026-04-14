# ─── Stage 1: Build the Meteor bundle ─────────────────────────────────────────
FROM node:20-bookworm AS builder

# Install OS dependencies required by Meteor & its npm packages
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Meteor (pinned to the project's release)
ENV HOME=/root
RUN curl https://install.meteor.com/?release=3.3.2 | sh
ENV PATH="$PATH:/root/.meteor"

WORKDIR /app

# Copy the full project (node_modules and .meteor/local are excluded by .dockerignore)
COPY . .

# Install npm dependencies inside the Meteor toolchain
RUN meteor npm ci

# Build a production Node.js bundle
RUN meteor build /bundle --directory --architecture os.linux.x86_64

# ─── Stage 2: Lightweight production image ────────────────────────────────────
FROM node:20-slim AS runtime

WORKDIR /app

# Copy the compiled bundle from the builder stage
COPY --from=builder /bundle/bundle .

# Install only the server-side npm dependencies
RUN cd programs/server && npm install --omit=dev

# Cloud Run expects the app to listen on PORT (default 8080)
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "main.js"]

