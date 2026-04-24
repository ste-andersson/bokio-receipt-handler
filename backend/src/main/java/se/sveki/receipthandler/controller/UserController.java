package se.sveki.receipthandler.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import se.sveki.receipthandler.model.UserEntity;
import se.sveki.receipthandler.model.request.UserSettingsRequest;
import se.sveki.receipthandler.model.request.UserSyncRequest;
import se.sveki.receipthandler.service.UserService;

import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @GetMapping(path = {"/", ""})
    ResponseEntity<List<UserEntity>> getAllPlayers() {
        return ResponseEntity.ok(service.getAllUsers());
    }

    @GetMapping("/settings")
    public ResponseEntity<UserEntity> getSettings(
            @RequestHeader("X-Clerk-User-Id") String clerkUserId) {
        return ResponseEntity.ok(service.getSettings(clerkUserId));
    }

    @PutMapping("/settings")
    public ResponseEntity<Void> updateSettings(
            @RequestHeader ("X-Clerk-User-Id") String clerkUserId,
            @RequestBody UserSettingsRequest request) {
        service.updateSettings(clerkUserId, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/sync")
    public ResponseEntity<UserEntity> syncUser(@RequestBody UserSyncRequest request) {
        UserEntity user = service.syncUser(request.getClerkUserId(), request.getEmail());
        return ResponseEntity.ok(user);
    }

}

