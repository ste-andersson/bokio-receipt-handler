package se.sveki.receipthandler.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import se.sveki.receipthandler.model.UserEntity;
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
    ResponseEntity<List<UserEntity>> getAllPlayers() {
        return ResponseEntity.ok(service.getAllUsers());
    }

}

