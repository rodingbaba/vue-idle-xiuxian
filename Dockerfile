FROM node:latest

# 创建并设置工作目录
WORKDIR /workspace

# 将当前仓库内的所有最新代码复制到镜像中（这一步最关键，确保包含了你的数据堆叠优化）
COPY . .

# 全局安装 pnpm，安装项目依赖，并打包构建（使用默认官方源，在 GitHub Actions 中速度最快）
RUN npm install -g pnpm && \
    pnpm install && \
    pnpm run build

# 启动预览服务器，暴露 8080 端口供外部访问
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "8080"]