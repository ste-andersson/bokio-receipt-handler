package se.sveki.receipthandler.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import se.sveki.receipthandler.model.UserEntity;
import java.util.Optional;

import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    Optional<UserEntity> findByClerkUserId(String clerkUserId);
}
