# 第一阶段：构建前端纯静态产物
FROM node:20-alpine AS builder

# 创建并设置工作目录
WORKDIR /workspace

# 先安装 pnpm
RUN npm install -g pnpm

# 先复制依赖配置文件，利用 Docker 缓存加速后续依赖安装
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# 复制所有仓库代码并执行打包
COPY . .
RUN pnpm run build

# 第二阶段：使用轻量级的 Nginx 镜像提供 Web 服务
FROM nginx:alpine

# 注入单页应用(SPA)路由的 Nginx 配置，防止刷新页面报 404
RUN echo 'server { \
    listen       80; \
    server_name  localhost; \
    location / { \
        root   /usr/share/nginx/html; \
        index  index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# 仅仅将第一阶段生成的体积较小的纯静态 dist 目录复制过来
COPY --from=builder /workspace/dist /usr/share/nginx/html

# 暴露 80 端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]