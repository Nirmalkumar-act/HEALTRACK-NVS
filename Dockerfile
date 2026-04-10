# ── Stage 1: Build with Maven ─────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app
COPY backend/pom.xml .
RUN mvn dependency:go-offline -q
COPY backend/src ./src
RUN mvn clean package -DskipTests -q

# ── Stage 2: Run the jar ──────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=builder /app/target/hms-backend-0.0.1-SNAPSHOT.jar app.jar

# Render injects PORT at runtime (usually 10000)
ENV PORT=10000
EXPOSE 10000

ENTRYPOINT ["sh", "-c", "echo Starting on port $PORT && java -Dserver.port=$PORT -Dserver.address=0.0.0.0 -jar app.jar"]
