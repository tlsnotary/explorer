# Build app
FROM node:latest as builder

ENV PATH="${PATH}:/root/.cargo/bin"
WORKDIR /builder

COPY . .

RUN curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh -s -- -y
RUN npm i
RUN npm i --prefix rs/verifier/
RUN npm run build

# Create image for the app by copying build artifacts from builder
FROM node:latest as runner

RUN apt-get update; apt-get install netcat-openbsd -y
USER node

ARG PORT=3000

WORKDIR /home/node/explorer
COPY --from=builder /builder/build ./build

EXPOSE ${PORT}
CMD ["node", "build/server/index.bundle.js"]
