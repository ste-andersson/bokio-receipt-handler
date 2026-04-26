package se.sveki.receipthandler.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import se.sveki.receipthandler.model.CompanyAliasEntity;
import java.util.Optional;

public interface CompanyAliasRepository extends JpaRepository<CompanyAliasEntity, Long> {
    Optional<CompanyAliasEntity> findByAlias(String alias);
}