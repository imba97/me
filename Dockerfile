# 使用官方 Node.js 镜像作为基础镜像
FROM node:18

# 创建并设置工作目录
WORKDIR /usr/src/app

# 复制所有源代码到工作目录
COPY . .

# 安装 pnpm
RUN npm install -g pnpm

# 安装项目依赖
RUN pnpm install

# 构建 Nuxt.js 应用程序
RUN pnpm run build

# 暴露端口（默认端口为 3000，可以通过环境变量 NUXT_PORT 配置）
ENV NUXT_PORT=3000
EXPOSE ${NUXT_PORT}

# 启动 Nuxt.js 应用程序
CMD [ "pnpm", "start-docker" ]
