# --------- Build frontend ---------
FROM node:20-alpine AS frontend_build
WORKDIR /frontend

COPY frontend/package*.json ./
# If you use yarn/pnpm, adjust accordingly
RUN npm ci

COPY frontend/ .
RUN npm run build

# --------- Nginx runtime ---------
FROM nginx:1.26-alpine

# Replace default site config
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend artifacts into nginx web root
COPY --from=frontend_build /frontend/dist /usr/share/nginx/html
# If CRA, it may be /frontend/build instead of /frontend/dist

EXPOSE 80
