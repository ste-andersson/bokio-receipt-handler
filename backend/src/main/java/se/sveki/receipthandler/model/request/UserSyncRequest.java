package se.sveki.receipthandler.model.request;

public class UserSyncRequest {
    private String clerkUserId;
    private String email;

    public String getClerkUserId() { return clerkUserId; }
    public void setClerkUserId(String clerkUserId) { this.clerkUserId = clerkUserId; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}