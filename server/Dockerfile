FROM python:3.11-slim-buster

# Set the working directory to /app.
WORKDIR /code

# Copy the requirements file into the container at /app.
COPY requirements.txt .

# Install the dependencies.
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container at /app.
COPY ./app /code/server/app
COPY ./logger_config.yaml /code
COPY ./config.yaml /code
COPY ./tag_file_tpl.docx /code
COPY ./logo_2.jpg /code

ENV DB_PORT=27017
ENV CLIENT_HOST=localhost
ENV CLIENT_PORT=5000

# Run the API using uvicorn.
CMD ["uvicorn", "server.app.main:app", "--host", "0.0.0.0", "--port", "5000"]
