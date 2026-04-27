package se.sveki.receipthandler.model.response;

public class CompanyInfoResponse {
    private final String name;

    public CompanyInfoResponse(String name) {
        this.name = name;
    }

    public String getName() { return name; }
}
