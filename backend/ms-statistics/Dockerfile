FROM python:3.12-slim

WORKDIR /app

# Instalar dependencias del sistema si es necesario
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# La configuración por defecto
RUN echo "MONGO_URL=mongodb://mongo:27017/statistics\nJWT_SECRET=your_secret_here\nJWT_ALGORITHM=HS256" > .env

EXPOSE 8012

# Crear usuario no root para seguridad
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8012"]