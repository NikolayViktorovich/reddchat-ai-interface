FROM ollama/ollama:latest
RUN ollama pull deepseek-r1:8b
EXPOSE 11434
CMD ["ollama", "serve"]