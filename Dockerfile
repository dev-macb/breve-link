ARG APP_CAMINHO_BASE=
FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
COPY api/package.json ./api/
COPY app/package.json ./app/
RUN npm ci
COPY tsconfig.base.json ./
COPY api ./api
COPY app ./app
ARG APP_CAMINHO_BASE
ENV APP_CAMINHO_BASE=$APP_CAMINHO_BASE
RUN npm run build && npm prune --omit=dev

FROM node:22-bookworm-slim
WORKDIR /app
ARG APP_CAMINHO_BASE
ENV NODE_ENV=production APP_HOST=0.0.0.0 APP_PORTA=6001 APP_CAMINHO_BASE=$APP_CAMINHO_BASE
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/api/build ./api/build
COPY --from=build /app/app/dist ./app/dist
RUN mkdir -p database && chown node:node database
USER node
EXPOSE 6001
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD node -e "fetch('http://127.0.0.1:'+process.env.APP_PORTA+(process.env.APP_CAMINHO_BASE||'')+'/api/saude').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "api/build/index.js"]
