package se.sveki.receipthandler.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import se.sveki.receipthandler.model.request.PostmarkInboundRequest;
import se.sveki.receipthandler.service.MailService;

@RestController
@RequestMapping("/api/mail")
public class MailController {

    private final MailService mailService;

    public MailController(MailService mailService) {
        this.mailService = mailService;
    }

    @PostMapping("/inbound")
    public ResponseEntity<Void> inbound(@RequestBody PostmarkInboundRequest request) {
        mailService.processInbound(request);
        return ResponseEntity.ok().build();
    }
}