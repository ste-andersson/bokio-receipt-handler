package se.sveki.receipthandler.model.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PostmarkInboundRequest {

    @JsonProperty("From")
    private String from;

    @JsonProperty("To")
    private String to;

    @JsonProperty("Subject")
    private String subject;

    @JsonProperty("Attachments")
    private List<Attachment> attachments;

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Attachment {
        @JsonProperty("Name")
        private String name;

        @JsonProperty("Content")
        private String content;

        @JsonProperty("ContentType")
        private String contentType;

        public String getName() { return name; }
        public String getContent() { return content; }
        public String getContentType() { return contentType; }
    }

    public String getFrom() { return from; }
    public String getTo() { return to; }
    public String getSubject() { return subject; }
    public List<Attachment> getAttachments() { return attachments; }
}