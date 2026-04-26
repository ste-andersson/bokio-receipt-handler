package se.sveki.receipthandler.model;

import jakarta.persistence.*;

@Entity
public class CompanyAliasEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String companyAlias;
    private String companyId;

    public CompanyAliasEntity() {}

    public CompanyAliasEntity(String companyAlias, String companyId) {
        this.companyAlias = companyAlias;
        this.companyId = companyId;
    }

    public Long getId() { return id; }
    public String getCompanyAlias() { return companyAlias; }
    public String getCompanyId() { return companyId; }
}