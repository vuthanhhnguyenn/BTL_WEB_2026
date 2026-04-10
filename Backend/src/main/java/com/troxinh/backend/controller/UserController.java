package com.troxinh.backend.controller;

import com.troxinh.backend.dto.user.UserResponse;
import com.troxinh.backend.dto.user.UserUpdateRequest;
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

    public UserController(UserService userService) {
        this.userService = userService;
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

    private Long extractUserId(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            return null;
        }
        String prefix = "Bearer troxinh-token-";
        if (!authorizationHeader.startsWith(prefix)) {
            return null;
        }
        try {
            return Long.parseLong(authorizationHeader.substring(prefix.length()).trim());
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Invalid token");
        }
    }
}
