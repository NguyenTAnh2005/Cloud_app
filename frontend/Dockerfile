# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install --production=false
COPY . .
RUN npm run build

# Serve stage
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Copy file template vào thư mục templates của Nginx
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
