package se.sveki.receipthandler.service;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import se.sveki.receipthandler.model.bokio.BokioImageItem;
import se.sveki.receipthandler.model.bokio.BokioImagesResponse;

import java.util.List;

@Service
public class BacklogService {

    private static final String BOKIO_BASE_URL = "https://api.bokio.se";
    private final RestTemplate restTemplate = new RestTemplate();

    public List<BokioImageItem> getUnbookedUploads(String token, String companyId) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        String url = BOKIO_BASE_URL + "/v1/companies/" + companyId + "/uploads";
        ResponseEntity<BokioImagesResponse> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, BokioImagesResponse.class
        );

        if (response.getBody() == null || response.getBody().getItems() == null) {
            return List.of();
        }

        return response.getBody().getItems().stream()
                .filter(item -> item.getJournalEntryId() == null)
                .toList();
    }

    public byte[] downloadUpload(String token, String companyId, String uploadId) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        String url = BOKIO_BASE_URL + "/v1/companies/" + companyId + "/uploads/" + uploadId + "/download";
        ResponseEntity<byte[]> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, byte[].class
        );

        return response.getBody();
    }
}