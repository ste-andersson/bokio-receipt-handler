package se.sveki.receipthandler.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import java.util.UUID;

@Entity
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String clerkUserId;
    private String email;
    private String companyId;
    private String customPrompt;

    @Enumerated(EnumType.STRING)
    private AiProvider aiProvider = AiProvider.OPENAI;

    private Boolean showCamera = true;
    private Boolean showBokioBacklog = true;
    private Boolean showTekontoBacklog = true;

    public UserEntity() {
    }

    public UserEntity(String clerkUserId, String email) {
        this.clerkUserId = clerkUserId;
        this.email = email;
    }

    public UUID getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCompanyId() {
        return companyId;
    }

    public void setCompanyId(String companyId) {
        this.companyId = companyId;
    }

    public String getCustomPrompt() {
        return customPrompt;
    }

    public void setCustomPrompt(String customPrompt) {
        this.customPrompt = customPrompt;
    }

    public AiProvider getAiProvider() {
        return aiProvider;
    }

    public void setAiProvider(AiProvider aiProvider) {
        this.aiProvider = aiProvider;
    }

    public Boolean getShowCamera() {
        return showCamera == null || showCamera;
    }

    public void setShowCamera(Boolean showCamera) {
        this.showCamera = showCamera;
    }

    public Boolean getShowBokioBacklog() {
        return showBokioBacklog == null || showBokioBacklog;
    }

    public void setShowBokioBacklog(Boolean showBokioBacklog) {
        this.showBokioBacklog = showBokioBacklog;
    }

    public Boolean getShowTekontoBacklog() {
        return showTekontoBacklog == null || showTekontoBacklog;
    }

    public void setShowTekontoBacklog(Boolean showTekontoBacklog) {
        this.showTekontoBacklog = showTekontoBacklog;
    }
}
