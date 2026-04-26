package se.sveki.receipthandler.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import se.sveki.receipthandler.model.CompanyAliasEntity;
import se.sveki.receipthandler.service.CompanyAliasService;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/companyalias")
public class CompanyAliasController {

    private final CompanyAliasService companyAliasService;

    public CompanyAliasController(CompanyAliasService aliasService) {
        this.companyAliasService = aliasService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, String>>> getCompanyAliases(
            @RequestHeader("X-Clerk-User-Id") String clerkUserId
    ) {
        List<Map<String, String>> result = companyAliasService.getCompanyAliasesByClerkUserId(clerkUserId)
                .stream()
                .map(a -> Map.of("alias", a.getCompanyAlias()))
                .toList();
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> createCompanyAlias(
            @RequestHeader("X-Clerk-User-Id") String clerkUserId,
            @RequestBody Map<String, String> body
    ) {
        String companyAlias = body.get("companyAlias");
        CompanyAliasEntity created = companyAliasService.createCompanyAlias(companyAlias, clerkUserId);
        return ResponseEntity.ok(Map.of("companyAlias", created.getCompanyAlias()));
    }

    @DeleteMapping("/{companyAlias}")
    public ResponseEntity<Void> deleteCompanyAlias(
            @PathVariable String companyAlias,
            @RequestHeader("X-Clerk-User-Id") String clerkUserId
    ) {
        companyAliasService.deleteCompanyAlias(companyAlias, clerkUserId);
        return ResponseEntity.ok().build();
    }
}