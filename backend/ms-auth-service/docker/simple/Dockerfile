# Pull official base image 
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Set env variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update \
    && apt-get install -y gcc python3-dev musl-dev libmagic1 libffi-dev netcat-openbsd \
    && pip install Pillow

# Copy requirements first for better caching
COPY ./app/requirements ./requirements

# Install dependencies
RUN pip install --upgrade pip
RUN pip install -r ./requirements/dev.txt

# Copy the entire app
COPY ./app /app

# Create a comprehensive startup script
RUN echo '#!/bin/bash\n\
echo "Waiting for database..."\n\
sleep 10\n\
export DJANGO_SETTINGS_MODULE=core.settings.docker_dev\n\
echo "Creating migrations..."\n\
python manage.py makemigrations --noinput\n\
echo "Running migrations..."\n\
python manage.py migrate --noinput\n\
echo "Creating superuser..."\n\
python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(email='"'"'admin@sportboard.com'"'"').exists() or User.objects.create_superuser('"'"'admin@sportboard.com'"'"', '"'"'admin123'"'"', firstname='"'"'Admin'"'"', lastname='"'"'User'"'"')"\n\
echo "Starting Django development server..."\n\
python manage.py runserver 0.0.0.0:8011' > /app/start.sh

RUN chmod +x /app/start.sh

# Expose port 8011
EXPOSE 8011

# Set environment variable for Django settings
ENV DJANGO_SETTINGS_MODULE=core.settings.docker_dev

# Run the startup script
CMD ["/bin/bash", "/app/start.sh"]
