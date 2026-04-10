package com.troxinh.backend.service;

import com.troxinh.backend.dto.user.UserResponse;
import com.troxinh.backend.dto.user.UserUpdateRequest;
import com.troxinh.backend.entity.User;
import com.troxinh.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return toUserResponse(user);
    }

    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setFullName(normalize(request.fullName()));
        user.setPhone(normalize(request.phone()));
        if (request.avatarUrl() != null) {
            user.setAvatarUrl(request.avatarUrl().isBlank() ? null : normalize(request.avatarUrl()));
        }

        User saved = userRepository.save(user);
        return toUserResponse(saved);
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getPhone(),
            user.getRole(),
            user.getAvatarUrl(),
            user.getIsActive()
        );
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }
}
