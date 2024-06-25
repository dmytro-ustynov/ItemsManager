# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:19-alpine as build_stage
WORKDIR /app
COPY package.json .
COPY /src ./src
COPY /public ./public
RUN npm install
ARG REACT_APP_SERVER_HOST
ARG REACT_APP_SERVER_PORT
RUN npm run build

#Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1.15
COPY --from=build_stage /app/build/ /usr/share/nginx/html
EXPOSE 80