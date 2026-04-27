package se.sveki.receipthandler.service;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import se.sveki.receipthandler.model.bokio.BokioCompanyInfo;

@Service
public class BokioCompanyService {

    private static final String BOKIO_BASE_URL = "https://api.bokio.se";
    private final RestTemplate restTemplate = new RestTemplate();

    public BokioCompanyInfo getCompanyInfo(String token, String companyId) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setAccept(java.util.List.of(MediaType.APPLICATION_JSON));

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        String url = BOKIO_BASE_URL + "/v1/companies/" + companyId + "/company-information";
        ResponseEntity<BokioCompanyInfo> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, BokioCompanyInfo.class
        );

        return response.getBody();
    }
}
