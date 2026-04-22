package se.sveki.receipthandler.service;

import org.springframework.stereotype.Service;
import se.sveki.receipthandler.model.UserEntity;
import se.sveki.receipthandler.repository.UserRepository;

import java.util.List;

@Service
public class UserService {

    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    public List<UserEntity> getAllUsers() {
        return repository.findAll();
    }
}
