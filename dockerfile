FROM --platform=linux/amd64 ubuntu:22.04
WORKDIR /app
RUN apt-get update
RUN apt-get install -y python3
RUN apt-get install -y python3-pip
COPY app/ .
RUN pip install -r ./requirements.txt
EXPOSE 3000
CMD ["python3", "./src/main.py"]
