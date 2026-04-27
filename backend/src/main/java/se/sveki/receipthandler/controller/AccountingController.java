package se.sveki.receipthandler.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import se.sveki.receipthandler.model.AiProvider;
import se.sveki.receipthandler.model.request.AccountingRequest;
import se.sveki.receipthandler.model.response.AccountingSuggestion;
import se.sveki.receipthandler.service.AccountingService;
import se.sveki.receipthandler.service.AiService;
import se.sveki.receipthandler.service.UserService;

@RestController
@RequestMapping("/api/accounting")
public class AccountingController {

    private final AccountingService accountingService;
    private final AiService aiService;
    private final UserService userService;

    public AccountingController(AccountingService accountingService,
                                AiService aiService,
                                UserService userService) {
        this.accountingService = accountingService;
        this.aiService = aiService;
        this.userService = userService;
    }

    @PostMapping("/submit-receipt")
    public ResponseEntity<Void> submitReceipt(
            @RequestPart("data") AccountingRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestHeader("X-Bokio-Token") String token,
            @RequestHeader("X-Bokio-Company-Id") String companyId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        accountingService.submitReceipt(request, image, token, companyId, jwt.getSubject());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/analyze")
    public ResponseEntity<AccountingSuggestion> analyze(
            @RequestPart("image") MultipartFile image,
            @RequestPart("accountPlan") String accountPlan,
            @AuthenticationPrincipal Jwt jwt
    ) {
        var user = userService.getSettings(jwt.getSubject());
        if (user.getAiProvider() == AiProvider.OFF) {
            return ResponseEntity.noContent().build();
        }
        String customPrompt = user.getCustomPrompt();
        AccountingSuggestion suggestion = aiService.analyzeReceipt(image, accountPlan, customPrompt, user.getAiProvider());
        return ResponseEntity.ok(suggestion);
    }
}
