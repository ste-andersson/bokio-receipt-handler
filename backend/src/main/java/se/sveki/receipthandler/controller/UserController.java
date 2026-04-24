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
    public ResponseEntity<UserEntity> getSettings() {
        UUID hardcodedUserId = UUID.fromString("7c2354bd-4e8a-444d-afba-c0ea547f5a85");
        return ResponseEntity.ok(service.getSettings(hardcodedUserId));
    }

    @PutMapping("/settings")
    public ResponseEntity<Void> updateSettings(@RequestBody UserSettingsRequest request) {
        UUID hardcodedUserId = UUID.fromString("7c2354bd-4e8a-444d-afba-c0ea547f5a85");
        service.updateSettings(hardcodedUserId, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/sync")
    public ResponseEntity<UserEntity> syncUser(@RequestBody UserSyncRequest request) {
        UserEntity user = service.syncUser(request.getClerkUserId(), request.getEmail());
        return ResponseEntity.ok(user);
    }

}

