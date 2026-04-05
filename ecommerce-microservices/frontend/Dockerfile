FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build step is optional if we just want to run dev server, but standard is to build
RUN npm run build

# We will just run the dev server for hot-reloading purposes in this demo
CMD ["npm", "run", "dev"]
