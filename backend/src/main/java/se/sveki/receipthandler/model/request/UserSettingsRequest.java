package se.sveki.receipthandler.model.request;

import se.sveki.receipthandler.model.AiProvider;

public class UserSettingsRequest {
    private String companyId;
    private String customPrompt;
    private AiProvider aiProvider;
    private Boolean showCamera;
    private Boolean showBokioBacklog;
    private Boolean showTekontoBacklog;

    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }
    public String getCustomPrompt() { return customPrompt; }
    public void setCustomPrompt(String customPrompt) { this.customPrompt = customPrompt; }
    public AiProvider getAiProvider() { return aiProvider; }
    public void setAiProvider(AiProvider aiProvider) { this.aiProvider = aiProvider; }
    public Boolean getShowCamera() { return showCamera; }
    public void setShowCamera(Boolean showCamera) { this.showCamera = showCamera; }
    public Boolean getShowBokioBacklog() { return showBokioBacklog; }
    public void setShowBokioBacklog(Boolean showBokioBacklog) { this.showBokioBacklog = showBokioBacklog; }
    public Boolean getShowTekontoBacklog() { return showTekontoBacklog; }
    public void setShowTekontoBacklog(Boolean showTekontoBacklog) { this.showTekontoBacklog = showTekontoBacklog; }
}