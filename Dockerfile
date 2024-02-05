FROM nginx

RUN rm /etc/nginx/conf.d/default.conf
COPY config/nginx.config /etc/nginx/conf.d/default.conf

COPY dist/ /usr/share/nginx/html

