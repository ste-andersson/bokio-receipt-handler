package se.sveki.receipthandler.service;

import org.springframework.stereotype.Service;
import se.sveki.receipthandler.model.CompanyAliasEntity;
import se.sveki.receipthandler.repository.CompanyAliasRepository;
import se.sveki.receipthandler.repository.UserRepository;

import java.util.List;

@Service
public class CompanyAliasService {

    private final CompanyAliasRepository companyAliasRepository;
    private final UserRepository userRepository;

    public CompanyAliasService(CompanyAliasRepository companyAliasRepository, UserRepository userRepository) {
        this.companyAliasRepository = companyAliasRepository;
        this.userRepository = userRepository;
    }

    public List<CompanyAliasEntity> getCompanyAliasesByClerkUserId(String clerkUserId) {
        return userRepository.findByClerkUserId(clerkUserId)
                .map(user -> companyAliasRepository.findByCompanyId(user.getCompanyId()))
                .orElse(List.of());
    }

    public CompanyAliasEntity createCompanyAlias(String companyAlias, String clerkUserId) {
        String normalizedAlias = companyAlias.toLowerCase();
        if (companyAliasRepository.findByCompanyAlias(normalizedAlias).isPresent()) {
            throw new IllegalArgumentException("Alias already exists: " + normalizedAlias);
        }
        return userRepository.findByClerkUserId(clerkUserId)
                .map(user -> companyAliasRepository.save(
                        new CompanyAliasEntity(normalizedAlias, user.getCompanyId())
                ))
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public void deleteCompanyAlias(String companyAlias, String clerkUserId) {
        userRepository.findByClerkUserId(clerkUserId).ifPresent(user ->
                companyAliasRepository.findByCompanyAlias(companyAlias)
                        .filter(a -> a.getCompanyId().equals(user.getCompanyId()))
                        .ifPresent(companyAliasRepository::delete)
        );
    }
}