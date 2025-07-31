FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY app/requirements/ ./requirements/
RUN pip install --no-cache-dir -r requirements/base.txt

# Copy application code
COPY app/ .

# Expose port
EXPOSE 8000

# Create entrypoint script
RUN chmod +x entrypoint.sh

# Default command
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
