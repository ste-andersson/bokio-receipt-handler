package se.sveki.receipthandler.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import se.sveki.receipthandler.model.request.AccountingRequest;
import se.sveki.receipthandler.service.AccountingService;

@RestController
@RequestMapping("/accounting")
public class AccountingController {

    private final AccountingService accountingService;

    public AccountingController(AccountingService accountingService) {
        this.accountingService = accountingService;
    }

    @PostMapping("/submit-receipt")
    public ResponseEntity<Void> submitReceipt(
            @RequestPart("data") AccountingRequest request,
            @RequestPart("image") MultipartFile image,
            @RequestHeader("X-Bokio-Token") String token,
            @RequestHeader("X-Bokio-Company-Id") String companyId
    ) {
        accountingService.submitReceipt(request, image, token, companyId);
        return ResponseEntity.ok().build();
    }
}