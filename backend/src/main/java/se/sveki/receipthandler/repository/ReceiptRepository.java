package se.sveki.receipthandler.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import se.sveki.receipthandler.model.ReceiptEntity;
import java.util.List;

public interface ReceiptRepository extends JpaRepository<ReceiptEntity, Long> {
    List<ReceiptEntity> findByCompanyIdAndBookedAtIsNull(String companyId);
}