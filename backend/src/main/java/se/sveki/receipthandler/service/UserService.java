package se.sveki.receipthandler.service;

import org.springframework.stereotype.Service;
import se.sveki.receipthandler.model.UserEntity;
import se.sveki.receipthandler.model.request.UserSettingsRequest;
import se.sveki.receipthandler.repository.UserRepository;

import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    public List<UserEntity> getAllUsers() {
        return repository.findAll();
    }

    public UserEntity getSettings(UUID userId) {
        return repository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public void updateSettings(UUID userId, UserSettingsRequest request) {
        UserEntity user = repository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setCompanyId(request.getCompanyId());
        user.setCustomPrompt(request.getCustomPrompt());
        repository.save(user);
    }
}
