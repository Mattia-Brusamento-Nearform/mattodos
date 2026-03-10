# Stage 1: Dependencies
FROM python:3.11-slim AS deps
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim
WORKDIR /app
COPY --from=deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin
COPY . .
RUN chmod +x entrypoint.sh
RUN useradd -r -s /bin/false appuser
USER appuser
EXPOSE 8000
ENTRYPOINT ["./entrypoint.sh"]
