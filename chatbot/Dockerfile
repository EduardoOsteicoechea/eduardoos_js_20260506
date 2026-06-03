FROM golang:1.22-alpine AS build

WORKDIR /src

COPY go.mod ./
RUN go mod download 2>/dev/null || true

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /chatbot ./cmd/server

FROM alpine:3.20

COPY --from=build /chatbot /usr/local/bin/chatbot

EXPOSE 8110

ENV PORT=8110
ENV BIND_HOST=0.0.0.0

CMD ["chatbot"]
