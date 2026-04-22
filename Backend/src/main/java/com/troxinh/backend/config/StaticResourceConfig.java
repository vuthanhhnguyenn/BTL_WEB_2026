package com.troxinh.backend.config;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path cwd = Paths.get(System.getProperty("user.dir")).toAbsolutePath().normalize();
        Path uploadPath = cwd.resolve(uploadDir).normalize();
        if (Files.exists(cwd.resolve("Backend"))) {
            uploadPath = cwd.resolve("Backend").resolve(uploadDir).normalize();
        }
        registry.addResourceHandler("/uploads/**")
            .addResourceLocations(uploadPath.toUri().toString());
    }
}
