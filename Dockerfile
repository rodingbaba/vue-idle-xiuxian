FROM node:latest

# 创建并设置工作目录
WORKDIR /workspace

# 先复制依赖配置文件到镜像中，以便利用 Docker 缓存层
COPY package.json pnpm-lock.yaml* ./

# 全局安装 pnpm 并安装项目依赖（只要依赖不变，由于缓存复用，这一步会直接跳过）
RUN npm install -g pnpm && pnpm install

# 将当前仓库内的所有最新代码复制到镜像中
COPY . .

# 独立执行打包构建（这部分会随着业务代码变化而执行）
RUN pnpm run build


# 启动预览服务器，暴露 8080 端口供外部访问
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "8080"]