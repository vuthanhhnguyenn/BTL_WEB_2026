package com.troxinh.backend.controller;

import com.troxinh.backend.dto.auth.ChangePasswordRequest;
import com.troxinh.backend.dto.user.UserResponse;
import com.troxinh.backend.dto.user.UserUpdateRequest;
import com.troxinh.backend.service.AuthService;
import com.troxinh.backend.service.JwtService;
import com.troxinh.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;


@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;
    private final AuthService authService;
    private final JwtService jwtService;

    public UserController(UserService userService, AuthService authService, JwtService jwtService) {
        this.userService = userService;
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        Long authorizedId = extractUserId(authorizationHeader);
        if (authorizedId == null || !authorizedId.equals(id)) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "You can only update your own profile");
        }
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @PutMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(
            @PathVariable Long id,
            @Valid @RequestBody ChangePasswordRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        Long authorizedId = extractUserId(authorizationHeader);
        if (authorizedId == null || !authorizedId.equals(id)) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "You can only change your own password");
        }
        authService.changePassword(id, request.oldPassword(), request.newPassword());
        return ResponseEntity.ok(java.util.Map.of("success", true, "message", "Password changed successfully"));
    }

    private Long extractUserId(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            return null;
        }
        try {
            if (authorizationHeader.startsWith("Bearer ")) {
                String token = authorizationHeader.substring(7);
                if (jwtService.validateToken(token)) {
                    return jwtService.getUserIdFromToken(token);
                }
            }
        } catch (Exception e) {
            // Invalid token
        }
        return null;
    }
}
