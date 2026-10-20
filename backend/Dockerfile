FROM node:lts-bookworm

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      texlive-xetex \
      texlive-latex-extra \
      latexmk \
      fonts-lmodern && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"]