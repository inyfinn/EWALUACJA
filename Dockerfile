FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_BASE_PATH=/panel-ankiet/
ENV VITE_BASE_PATH=$VITE_BASE_PATH
ENV NODE_ENV=production

RUN npm run build

ENV PORT=3040
EXPOSE 3040

CMD ["node", "dist/server.cjs"]
