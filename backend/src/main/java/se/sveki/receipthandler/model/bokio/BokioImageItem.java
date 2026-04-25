package se.sveki.receipthandler.model.bokio;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class BokioImageItem {
    private String id;
    private String contentType;
    private String journalEntryId;
    private String description;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public String getJournalEntryId() { return journalEntryId; }
    public void setJournalEntryId(String journalEntryId) { this.journalEntryId = journalEntryId; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}