FROM --platform=$BUILDPLATFORM node:22-slim AS builder

# Build application and add additional files
WORKDIR /ghostfolio

RUN apt-get update && apt-get install -y --no-install-suggests \
  g++ \
  git \
  make \
  openssl \
  python3 \
  && rm -rf /var/lib/apt/lists/*

# Only add basic files without the application itself to avoid rebuilding
# layers when files (package.json etc.) have not changed
COPY ./.config .config/
COPY ./CHANGELOG.md CHANGELOG.md
COPY ./LICENSE LICENSE
COPY ./package.json package.json
COPY ./package-lock.json package-lock.json
COPY ./prisma/copy-sqlite-client-source-map.mjs ./prisma/database.d.ts ./prisma/database.js ./prisma/generate-sqlite-schema.mjs ./prisma/schema.prisma prisma/

RUN npm install

COPY ./apps apps/
COPY ./libs libs/
COPY ./jest.config.ts jest.config.ts
COPY ./jest.preset.js jest.preset.js
COPY ./nx.json nx.json
COPY ./replace.build.mjs replace.build.mjs
COPY ./tsconfig.base.json tsconfig.base.json

ENV NX_DAEMON=false
RUN npm run build:production

# Install native runtime dependencies for the target platform
FROM node:22-slim AS runtime-dependencies
WORKDIR /ghostfolio/apps/api

RUN apt-get update && apt-get install -y --no-install-suggests \
  g++ \
  make \
  openssl \
  python3 \
  && rm -rf /var/lib/apt/lists/*

COPY .config .config/
COPY package.json package-lock.json ./
COPY prisma prisma/

RUN npm install

# Image to run, copy everything needed from builder
FROM node:22-slim
LABEL org.opencontainers.image.source="https://github.com/ghostfolio/ghostfolio"
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-suggests \
  curl \
  openssl \
  && rm -rf /var/lib/apt/lists/*

COPY --chown=node:node --from=builder /ghostfolio/dist/apps /ghostfolio/apps/
COPY --chown=node:node --from=runtime-dependencies /ghostfolio/apps/api/.config /ghostfolio/apps/api/.config/
COPY --chown=node:node --from=runtime-dependencies /ghostfolio/apps/api/node_modules /ghostfolio/apps/api/node_modules/
COPY --chown=node:node --from=runtime-dependencies /ghostfolio/apps/api/package.json /ghostfolio/apps/api/package-lock.json /ghostfolio/apps/api/
COPY --chown=node:node --from=runtime-dependencies /ghostfolio/apps/api/prisma /ghostfolio/apps/api/prisma/
COPY --chown=node:node ./docker/entrypoint.sh /ghostfolio/
WORKDIR /ghostfolio/apps/api
RUN mkdir -p db && chown node:node db
EXPOSE ${PORT:-3333}
USER node
CMD [ "/ghostfolio/entrypoint.sh" ]
