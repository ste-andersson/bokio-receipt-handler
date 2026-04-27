package se.sveki.receipthandler.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import se.sveki.receipthandler.model.bokio.BokioImageItem;
import se.sveki.receipthandler.service.BacklogService;

import java.util.List;

@RestController
@RequestMapping("/api/backlog")
public class BacklogController {

    private final BacklogService backlogService;

    public BacklogController(BacklogService backlogService) {
        this.backlogService = backlogService;
    }

    @GetMapping
    public ResponseEntity<List<BokioImageItem>> getUnbookedUploads(
            @RequestHeader("X-Bokio-Token") String token,
            @RequestHeader("X-Bokio-Company-Id") String companyId
    ) {
        return ResponseEntity.ok(backlogService.getUnbookedUploads(token, companyId));
    }

    @GetMapping("/{uploadId}/image")
    public ResponseEntity<byte[]> getImage(
            @PathVariable String uploadId,
            @RequestHeader("X-Bokio-Token") String token,
            @RequestHeader("X-Bokio-Company-Id") String companyId
    ) {
        byte[] image = backlogService.downloadUpload(token, companyId, uploadId);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(image);
    }
}