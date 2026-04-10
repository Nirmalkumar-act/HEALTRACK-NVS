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

ENV PORT=10000
EXPOSE 10000

# DataSourceConfig.java handles all DB URL parsing — just pass PORT here
ENTRYPOINT ["sh", "-c", "exec java -Dserver.port=${PORT:-10000} -Dserver.address=0.0.0.0 -jar app.jar"]
