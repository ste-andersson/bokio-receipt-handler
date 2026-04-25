package se.sveki.receipthandler.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import se.sveki.receipthandler.model.LogEntity;
import se.sveki.receipthandler.model.bokio.BokioJournalEntry;
import se.sveki.receipthandler.model.request.AccountingRequest;
import se.sveki.receipthandler.repository.LogRepository;
import se.sveki.receipthandler.repository.UserRepository;

import java.util.List;

@Service
public class AccountingService {

    private static final String BOKIO_BASE_URL = "https://api.bokio.se";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final UserRepository userRepository;
    private final LogRepository logRepository;

    public AccountingService(UserRepository userRepository, LogRepository logRepository) {
        this.userRepository = userRepository;
        this.logRepository = logRepository;
    }

    public void submitReceipt(AccountingRequest request, MultipartFile image, String token, String companyId, String clerkUserId) {
        String journalEntryId = createJournalEntry(request, token, companyId);
        uploadImage(image, token, companyId, journalEntryId);
        logSubmission(clerkUserId);
    }

    private void logSubmission(String clerkUserId) {
        userRepository.findByClerkUserId(clerkUserId).ifPresent(user ->
                logRepository.save(new LogEntity(user.getId()))
        );
    }

    private String createJournalEntry(AccountingRequest request, String token, String companyId) {
        BokioJournalEntry entry = mapToBokioJournalEntry(request);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);

        HttpEntity<BokioJournalEntry> httpEntity = new HttpEntity<>(entry, headers);

        String url = BOKIO_BASE_URL + "/v1/companies/" + companyId + "/journal-entries";
        ResponseEntity<String> response = restTemplate.postForEntity(url, httpEntity, String.class);

        try {
            JsonNode json = objectMapper.readTree(response.getBody());
            return json.get("id").asText();
        } catch (Exception e) {
            throw new RuntimeException("Could not read journalEntryId from Bokio", e);
        }
    }

    private void uploadImage(MultipartFile image, String token, String companyId, String journalEntryId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.setBearerAuth(token);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(image.getBytes()) {
                @Override
                public String getFilename() {
                    return image.getOriginalFilename();
                }
            });
            body.add("journalEntryId", journalEntryId);

            HttpEntity<MultiValueMap<String, Object>> httpEntity = new HttpEntity<>(body, headers);

            String url = BOKIO_BASE_URL + "/v1/companies/" + companyId + "/uploads";
            restTemplate.postForEntity(url, httpEntity, String.class);

        } catch (Exception e) {
            throw new RuntimeException("Could not upload image to Bokio", e);
        }
    }

    private BokioJournalEntry mapToBokioJournalEntry(AccountingRequest request) {
        BokioJournalEntry entry = new BokioJournalEntry();
        entry.setTitle(request.getTitle());
        entry.setDate(request.getDate());

        List<BokioJournalEntry.JournalItem> items = request.getItems().stream()
                .map(i -> {
                    BokioJournalEntry.JournalItem item = new BokioJournalEntry.JournalItem();
                    item.setAccount(i.getAccount());
                    item.setDebit(i.getDebit());
                    item.setCredit(i.getCredit());
                    return item;
                })
                .toList();

        entry.setItems(items);
        return entry;
    }
}