package se.sveki.receipthandler.service;

import org.springframework.stereotype.Service;
import se.sveki.receipthandler.model.ReceiptEntity;
import se.sveki.receipthandler.repository.ReceiptRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ReceiptService {

    private final ReceiptRepository receiptRepository;

    public ReceiptService(ReceiptRepository receiptRepository) {
        this.receiptRepository = receiptRepository;
    }

    public List<ReceiptEntity> getUnbooked(String companyId) {
        return receiptRepository.findByCompanyIdAndBookedAtIsNull(companyId);
    }

    public Optional<ReceiptEntity> findById(Long id) {
        return receiptRepository.findById(id);
    }

    public boolean delete(Long id, String companyId) {
        Optional<ReceiptEntity> receipt = receiptRepository.findById(id)
                .filter(r -> r.getCompanyId().equals(companyId));
        receipt.ifPresent(receiptRepository::delete);
        return receipt.isPresent();
    }
}
