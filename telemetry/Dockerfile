FROM golang:1.22-alpine AS build

WORKDIR /src

COPY go.mod ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /telemetry ./cmd/server

FROM alpine:3.20

RUN apk add --no-cache docker-cli

COPY --from=build /telemetry /usr/local/bin/telemetry

EXPOSE 8100

ENV PORT=8100
ENV LOG_MODE=docker
ENV HOST_PROC=/host/proc
ENV DISK_PATH=/

CMD ["telemetry"]
