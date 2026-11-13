FROM node:26.13.1-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# 非 root（uid 101）で動く nginx。一時ファイルと pid は /tmp に置く。
FROM nginxinc/nginx-unprivileged:1.30.6-alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/public /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
