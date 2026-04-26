package se.sveki.receipthandler.service;

import org.springframework.stereotype.Service;
import se.sveki.receipthandler.model.ReceiptEntity;
import se.sveki.receipthandler.model.request.PostmarkInboundRequest;
import se.sveki.receipthandler.repository.CompanyAliasRepository;
import se.sveki.receipthandler.repository.ReceiptRepository;

import java.util.Base64;

@Service
public class MailService {

    private final CompanyAliasRepository companyAliasRepository;
    private final ReceiptRepository receiptRepository;

    public MailService(CompanyAliasRepository companyAliasRepository, ReceiptRepository receiptRepository) {
        this.companyAliasRepository = companyAliasRepository;
        this.receiptRepository = receiptRepository;
    }

    public void processInbound(PostmarkInboundRequest request) {
        String alias = extractAlias(request.getTo());

        companyAliasRepository.findByCompanyAlias(alias).ifPresent(companyAlias -> {
            if (request.getAttachments() == null || request.getAttachments().isEmpty()) return;

            request.getAttachments().stream()
                    .filter(a -> isImage(a.getContentType()))
                    .forEach(attachment -> {
                        byte[] imageData = Base64.getDecoder().decode(attachment.getContent());
                        ReceiptEntity receipt = new ReceiptEntity(
                                companyAlias.getCompanyId(),
                                attachment.getContentType(),
                                attachment.getName(),
                                imageData
                        );
                        receiptRepository.save(receipt);
                    });
        });
    }

    private String extractAlias(String to) {
        // "stefan@kvitto.tekont.se" -> "stefan"
        return to.split("@")[0].toLowerCase();
    }

    private boolean isImage(String contentType) {
        return contentType != null && (
                contentType.equals("image/jpeg") ||
                        contentType.equals("image/png") ||
                        contentType.equals("application/pdf")
        );
    }
}