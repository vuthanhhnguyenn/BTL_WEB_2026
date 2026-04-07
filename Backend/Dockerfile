# Bước 1: Build file .jar bằng Maven
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Bước 2: Chạy ứng dụng từ file .jar
FROM openjdk:17.0.1-jdk-slim
WORKDIR /app
# Copy file .jar đã build từ Bước 1 sang
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080

# Cực kỳ quan trọng: Giới hạn RAM tối đa 300MB (-Xmx300m) 
# Điều này giúp server Free 512MB của Render không bị quá tải và sập
ENTRYPOINT ["java", "-Xmx300m", "-jar", "app.jar"]