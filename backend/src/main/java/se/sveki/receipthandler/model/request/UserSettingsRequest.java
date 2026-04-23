package se.sveki.receipthandler.model.request;

public class UserSettingsRequest {
    private String companyId;
    private String customPrompt;

    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }
    public String getCustomPrompt() { return customPrompt; }
    public void setCustomPrompt(String customPrompt) { this.customPrompt = customPrompt; }
}