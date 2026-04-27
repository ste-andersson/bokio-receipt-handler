package se.sveki.receipthandler.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import se.sveki.receipthandler.model.CompanyAliasEntity;
import se.sveki.receipthandler.service.CompanyAliasService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/companyalias")
public class CompanyAliasController {

    private final CompanyAliasService companyAliasService;

    public CompanyAliasController(CompanyAliasService aliasService) {
        this.companyAliasService = aliasService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, String>>> getCompanyAliases(@AuthenticationPrincipal Jwt jwt) {
        List<Map<String, String>> result = companyAliasService.getCompanyAliasesByClerkUserId(jwt.getSubject())
                .stream()
                .map(a -> Map.of("companyAlias", a.getCompanyAlias()))
                .toList();
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> createCompanyAlias(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, String> body
    ) {
        String companyAlias = body.get("companyAlias");
        try {
            CompanyAliasEntity created = companyAliasService.createCompanyAlias(companyAlias, jwt.getSubject());
            return ResponseEntity.ok(Map.of("companyAlias", created.getCompanyAlias()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{companyAlias}")
    public ResponseEntity<Void> deleteCompanyAlias(
            @PathVariable String companyAlias,
            @AuthenticationPrincipal Jwt jwt
    ) {
        companyAliasService.deleteCompanyAlias(companyAlias, jwt.getSubject());
        return ResponseEntity.ok().build();
    }
}
