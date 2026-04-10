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
COPY --from=builder /app/src/main/resources/META-INF /app/META-INF

ENV PORT=10000
EXPOSE 10000

# Startup script: converts postgresql:// → jdbc:postgresql://
# and clears username/password when credentials are embedded in the URL
ENTRYPOINT ["sh", "-c", "\
  DB_URL=\"${DATABASE_URL:-}\"; \
  if [ -n \"$DB_URL\" ]; then \
    case \"$DB_URL\" in \
      postgresql://*|postgres://*) DB_URL=\"jdbc:$DB_URL\" ;; \
    esac; \
    echo \"=== Production DB detected ===\"; \
    exec java \
      -Dserver.port=${PORT:-10000} \
      -Dserver.address=0.0.0.0 \
      -Dspring.datasource.url=\"$DB_URL\" \
      -Dspring.datasource.username= \
      -Dspring.datasource.password= \
      -jar app.jar; \
  else \
    echo \"=== Local/fallback DB ===\"; \
    exec java \
      -Dserver.port=${PORT:-10000} \
      -Dserver.address=0.0.0.0 \
      -jar app.jar; \
  fi"]
