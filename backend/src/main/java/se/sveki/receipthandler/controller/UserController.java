package se.sveki.receipthandler.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import se.sveki.receipthandler.model.UserEntity;
import se.sveki.receipthandler.model.request.UserSettingsRequest;
import se.sveki.receipthandler.model.request.UserSyncRequest;
import se.sveki.receipthandler.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @GetMapping(path = {"/", ""})
    ResponseEntity<List<UserEntity>> getAllUsers() {
        return ResponseEntity.ok(service.getAllUsers());
    }

    @GetMapping("/settings")
    public ResponseEntity<UserEntity> getSettings(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(service.getSettings(jwt.getSubject()));
    }

    @PutMapping("/settings")
    public ResponseEntity<Void> updateSettings(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody UserSettingsRequest request) {
        service.updateSettings(jwt.getSubject(), request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/sync")
    public ResponseEntity<UserEntity> syncUser(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody UserSyncRequest request) {
        UserEntity user = service.syncUser(jwt.getSubject(), request.getEmail());
        return ResponseEntity.ok(user);
    }
}
