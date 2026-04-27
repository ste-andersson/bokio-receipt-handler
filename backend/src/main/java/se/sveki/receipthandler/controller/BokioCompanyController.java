package se.sveki.receipthandler.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import se.sveki.receipthandler.model.bokio.BokioCompanyInfo;
import se.sveki.receipthandler.model.response.CompanyInfoResponse;
import se.sveki.receipthandler.service.BokioCompanyService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/bokio")
public class BokioCompanyController {

    private final BokioCompanyService bokioCompanyService;

    public BokioCompanyController(BokioCompanyService bokioCompanyService) {
        this.bokioCompanyService = bokioCompanyService;
    }

    @GetMapping("/company")
    public ResponseEntity<CompanyInfoResponse> getCompanyInfo(
            @RequestHeader("X-Bokio-Token") String token,
            @RequestHeader("X-Bokio-Company-Id") String companyId
    ) {
        try {
            BokioCompanyInfo info = bokioCompanyService.getCompanyInfo(token, companyId);
            if (info == null || info.getName() == null) {
                return ResponseEntity.badRequest().build();
            }
            return ResponseEntity.ok(new CompanyInfoResponse(info.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
