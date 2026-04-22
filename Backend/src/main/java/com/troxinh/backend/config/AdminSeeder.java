package com.troxinh.backend.config;

import com.troxinh.backend.entity.User;
import com.troxinh.backend.repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements CommandLineRunner {

    private static final String ADMIN_EMAIL = "admin@troxinh.vn";
    private static final String ADMIN_PASSWORD = "admin123";

    private final UserRepository userRepository;

    public AdminSeeder(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        if (userRepository.existsByEmailIgnoreCase(ADMIN_EMAIL)) {
            return;
        }

        User admin = new User();
        admin.setFullName("TroXinh Admin");
        admin.setEmail(ADMIN_EMAIL);
        admin.setPhone("0000000000");
        admin.setPassword(BCrypt.hashpw(ADMIN_PASSWORD, BCrypt.gensalt()));
        admin.setAvatarUrl(null);
        admin.setRole("ADMIN");
        admin.setIsActive(true);

        userRepository.save(admin);
        System.out.println("Seeded default admin account: admin@troxinh.vn / admin123");
    }
}
