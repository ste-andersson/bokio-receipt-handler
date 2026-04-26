package se.sveki.receipthandler.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
public class CompanyAliasEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String alias;
    private String companyId;

    public CompanyAliasEntity() {}

    public CompanyAliasEntity(String alias, String companyId) {
        this.alias = alias;
        this.companyId = companyId;
    }

    public Long getId() { return id; }
    public String getAlias() { return alias; }
    public String getCompanyId() { return companyId; }
}