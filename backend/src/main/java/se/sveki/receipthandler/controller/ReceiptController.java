package se.sveki.receipthandler.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import se.sveki.receipthandler.service.ReceiptService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/receipts")
public class ReceiptController {

    private final ReceiptService receiptService;

    public ReceiptController(ReceiptService receiptService) {
        this.receiptService = receiptService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getUnbooked(
            @RequestHeader("X-Bokio-Company-Id") String companyId
    ) {
        List<Map<String, Object>> result = receiptService.getUnbooked(companyId)
                .stream()
                .map(r -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", r.getId());
                    map.put("contentType", r.getContentType());
                    map.put("originalFilename", r.getOriginalFilename());
                    map.put("receivedAt", r.getReceivedAt());
                    return map;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getImage(@PathVariable Long id) {
        return receiptService.findById(id)
                .map(r -> ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(r.getContentType()))
                        .body(r.getImageData()))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestHeader("X-Bokio-Company-Id") String companyId
    ) {
        if (!receiptService.delete(id, companyId)) return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }
}
