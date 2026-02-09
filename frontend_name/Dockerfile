
#STAGE 1 (BUILD)
FROM node AS build
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci --only=production --legacy-peer-deps
COPY . .
ARG ENV
RUN npm run build:${ENV:-test}


#STAGE 2
FROM nginx
COPY nginx.conf /etc/nginx/nginx.conf
RUN mkdir /etc/nginx/ssl
COPY --from=build /usr/src/app/dist/frontend_name /usr/share/nginx/html

##FROM nginx:alpine можно попробовать
#FROM nginx:latest
#
#
#RUN rm -rf /usr/share/nginx/html/*
#
#COPY nginx.conf /etc/nginx/nginx.conf
#COPY ./dist/shell /usr/share/nginx/html
#
##RUN sed -i '/^}/i \ \ \ \ error_page  404 /index.html;' /etc/nginx/conf.d/default.conf
#
#ENTRYPOINT ["nginx", "-g", "daemon off;"]