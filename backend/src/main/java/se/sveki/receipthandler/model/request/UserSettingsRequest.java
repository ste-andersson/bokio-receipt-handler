package se.sveki.receipthandler.model.request;

import se.sveki.receipthandler.model.AiProvider;

public class UserSettingsRequest {
    private String companyId;
    private String customPrompt;
    private AiProvider aiProvider;

    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }
    public String getCustomPrompt() { return customPrompt; }
    public void setCustomPrompt(String customPrompt) { this.customPrompt = customPrompt; }
    public AiProvider getAiProvider() { return aiProvider; }
    public void setAiProvider(AiProvider aiProvider) { this.aiProvider = aiProvider; }
}