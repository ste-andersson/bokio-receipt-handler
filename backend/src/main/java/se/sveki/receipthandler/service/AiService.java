package se.sveki.receipthandler.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.*;
import com.openai.models.chat.completions.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import se.sveki.receipthandler.model.AiProvider;
import se.sveki.receipthandler.model.response.AccountingSuggestion;

import java.util.Base64;
import java.util.List;

@Service
public class AiService {

    @Value("${openai.api-key}")
    private String openAiApiKey;

    @Value("${groq.api-key}")
    private String groqApiKey;

    @Value("${grok.api-key}")
    private String grokApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private String buildPrompt(String accountPlan, String customPrompt) {
        StringBuilder prompt = new StringBuilder("""
Du är en expert på svensk bokföring och kvittotolkning.

Analysera bilden av kvittot och returnera ENDAST giltig JSON.
Ingen markdown.
Ingen förklaring.
Ingen text före eller efter JSON.

JSON-format:

{
  "title": "kort beskrivning av inköpet",
  "date": "YYYY-MM-DD",
  "items": [
    { "account": 1930, "debit": 0.00, "credit": 125.00 },
    { "account": 2641, "debit": 25.00, "credit": 0.00 },
    { "account": 5460, "debit": 100.00, "credit": 0.00 }
  ]
}

Regler:

1. Läs kvittot noggrant. Använd endast information som faktiskt syns.
2. Gissa inte datum, moms eller totalsumma.
3. Om moms ej framgår tydligt: sätt ingen momsrad.
4. Första raden ska vara kredit:
   - 1930 = företagskort
   - 2890 = privat utlägg / kontanter
5. Därefter momsrad (2641) om tydlig avdragsgill moms finns.
6. Därefter kostnadskonton i debet.
7. Debet och kredit måste balansera exakt.
8. title ska beskriva köpet kortfattat.
9. Belopp anges med två decimaler.
10. Om information saknas, välj rimlig konservativ bokföring.

Kontoplan:
""");

        prompt.append(accountPlan);

        if (customPrompt != null && !customPrompt.isBlank()) {
            prompt.append("\n\nExtra instruktioner:\n").append(customPrompt);
        }

        return prompt.toString();
    }

    private OpenAIClient buildClient(AiProvider provider) {
        return switch (provider) {
            case OPENAI -> OpenAIOkHttpClient.builder()
                    .apiKey(openAiApiKey)
                    .build();
            case GROQ -> OpenAIOkHttpClient.builder()
                    .apiKey(groqApiKey)
                    .baseUrl("https://api.groq.com/openai/v1")
                    .build();
            case GROK -> OpenAIOkHttpClient.builder()
                    .apiKey(grokApiKey)
                    .baseUrl("https://api.x.ai/v1")
                    .build();
            default -> throw new IllegalArgumentException("Unsupported AI provider: " + provider);
        };
    }

    private ChatModel selectModel(AiProvider provider) {
        return switch (provider) {
            case OPENAI -> ChatModel.GPT_4O;
            case GROQ -> ChatModel.of("meta-llama/llama-4-scout-17b-16e-instruct");
            case GROK -> ChatModel.of("grok-4-fast-non-reasoning");
            default -> throw new IllegalArgumentException("Unsupported AI provider: " + provider);
        };
    }

    public AccountingSuggestion analyzeReceipt(MultipartFile image, String accountPlan, String customPrompt, AiProvider provider) {
        try {
            OpenAIClient client = buildClient(provider);
            ChatModel model = selectModel(provider);

            String base64Image = Base64.getEncoder().encodeToString(image.getBytes());
            String mediaType = image.getContentType() != null ? image.getContentType() : "image/jpeg";
            String fullPrompt = buildPrompt(accountPlan, customPrompt);

            ChatCompletionCreateParams params = ChatCompletionCreateParams.builder()
                    .model(model)
                    .addMessage(ChatCompletionMessageParam.ofSystem(
                            ChatCompletionSystemMessageParam.builder()
                                    .content(fullPrompt)
                                    .build()
                    ))
                    .addMessage(ChatCompletionMessageParam.ofUser(
                            ChatCompletionUserMessageParam.builder()
                                    .content(ChatCompletionUserMessageParam.Content.ofArrayOfContentParts(List.of(
                                            ChatCompletionContentPart.ofImageUrl(
                                                    ChatCompletionContentPartImage.builder()
                                                            .imageUrl(ChatCompletionContentPartImage.ImageUrl.builder()
                                                                    .url("data:" + mediaType + ";base64," + base64Image)
                                                                    .build())
                                                            .build()
                                            )
                                    )))
                                    .build()
                    ))
                    .build();

            ChatCompletion completion = client.chat().completions().create(params);
            String json = completion.choices().get(0).message().content().orElseThrow();

            json = json.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();

            return objectMapper.readValue(json, AccountingSuggestion.class);

        } catch (Exception e) {
            throw new RuntimeException("Failed to analyze receipt", e);
        }
    }
}