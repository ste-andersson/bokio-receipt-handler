package se.sveki.receipthandler.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import se.sveki.receipthandler.model.LogEntity;
import java.util.UUID;

public interface LogRepository extends JpaRepository<LogEntity, Long> {
}