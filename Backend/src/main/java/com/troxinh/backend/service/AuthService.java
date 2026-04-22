package com.troxinh.backend.service;

import com.troxinh.backend.dto.auth.LoginRequest;
import com.troxinh.backend.dto.auth.LoginResponse;
import com.troxinh.backend.dto.auth.LoginUserResponse;
import com.troxinh.backend.dto.auth.RegisterRequest;
import com.troxinh.backend.dto.auth.RegisterResponse;
import com.troxinh.backend.entity.User;
import com.troxinh.backend.repository.UserRepository;
import java.util.Set;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private static final String DEFAULT_ROLE = "USER";
    private static final Set<String> ALLOWED_ROLES = Set.of("USER", "HOST", "ADMIN");

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    public RegisterResponse register(RegisterRequest request) {
        String email = normalize(request.email()).toLowerCase();
        String fullName = normalize(request.fullName());
        String phone = normalize(request.phone());
        String password = request.password();
        String confirmPassword = request.confirmPassword();

        if (confirmPassword != null && !confirmPassword.isBlank() && !password.equals(confirmPassword)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "confirmPassword does not match password");
        }

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "email already exists");
        }

        String role = normalizeRole(request.role());

        User newUser = new User();
        newUser.setFullName(fullName);
        newUser.setEmail(email);
        newUser.setPhone(phone);
        newUser.setPassword(BCrypt.hashpw(password, BCrypt.gensalt()));
        newUser.setAvatarUrl(null);
        newUser.setRole(role);
        newUser.setIsActive(true);

        User saved = userRepository.save(newUser);

        return new RegisterResponse(
            saved.getId(),
            saved.getFullName(),
            saved.getEmail(),
            saved.getPhone(),
            saved.getRole(),
            saved.getIsActive(),
            "Register successful"
        );
    }

    public LoginResponse login(LoginRequest request) {
        String email = normalize(request.email()).toLowerCase();
        String password = request.password();

        User user = userRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!BCrypt.checkpw(password, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is inactive");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());

        return new LoginResponse(
            token,
            new LoginUserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getAvatarUrl()
            ),
            "Login successful"
        );
    }

    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!BCrypt.checkpw(oldPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Old password is incorrect");
        }

        user.setPassword(BCrypt.hashpw(newPassword, BCrypt.gensalt()));
        userRepository.save(user);
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            return DEFAULT_ROLE;
        }
        String normalized = role.trim().toUpperCase();
        if (!ALLOWED_ROLES.contains(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role");
        }
        return normalized;
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }
}
