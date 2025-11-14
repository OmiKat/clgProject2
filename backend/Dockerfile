
FROM eclipse-temurin:21-jre-alpine

# Set working directory
WORKDIR /app

ARG JAR_FILE=target/ClgProject-0.0.1-SNAPSHOT.jar

# Copy the JAR file from the build context to the container
COPY ${JAR_FILE} app.jar
# Expose application port
EXPOSE 8081

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]


