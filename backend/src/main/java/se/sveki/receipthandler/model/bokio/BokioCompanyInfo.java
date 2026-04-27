package se.sveki.receipthandler.model.bokio;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class BokioCompanyInfo {
    private String name;
    private String organizationNumber;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getOrganizationNumber() { return organizationNumber; }
    public void setOrganizationNumber(String organizationNumber) { this.organizationNumber = organizationNumber; }
}
