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

    public UserEntity getSettings(String clerkUserId) {
        return repository.findByClerkUserId(clerkUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public void updateSettings(String clerkUserId, UserSettingsRequest request) {
        UserEntity user = repository.findByClerkUserId(clerkUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setCompanyId(request.getCompanyId());
        user.setCustomPrompt(request.getCustomPrompt());
        user.setAiProvider(request.getAiProvider());
        if (request.getShowCamera() != null) user.setShowCamera(request.getShowCamera());
        if (request.getShowBokioBacklog() != null) user.setShowBokioBacklog(request.getShowBokioBacklog());
        if (request.getShowTekontoBacklog() != null) user.setShowTekontoBacklog(request.getShowTekontoBacklog());
        repository.save(user);
    }

    public UserEntity syncUser(String clerkUserId, String email) {
        return repository.findByClerkUserId(clerkUserId)
                .orElseGet(() -> repository.save(new UserEntity(clerkUserId, email)));
    }
}
