package se.sveki.receipthandler.model.bokio;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class BokioImagesResponse {
    private List<BokioImageItem> items;

    public List<BokioImageItem> getItems() { return items; }
    public void setItems(List<BokioImageItem> items) { this.items = items; }
}