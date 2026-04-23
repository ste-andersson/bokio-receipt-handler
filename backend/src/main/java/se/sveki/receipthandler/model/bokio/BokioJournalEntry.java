package se.sveki.receipthandler.model.bokio;

import java.util.List;

public class BokioJournalEntry {

    private String title;
    private String date;
    private List<JournalItem> items;

    public static class JournalItem {
        private int account;
        private double debit;
        private double credit;

        public int getAccount() { return account; }
        public void setAccount(int account) { this.account = account; }
        public double getDebit() { return debit; }
        public void setDebit(double debit) { this.debit = debit; }
        public double getCredit() { return credit; }
        public void setCredit(double credit) { this.credit = credit; }
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public List<JournalItem> getItems() { return items; }
    public void setItems(List<JournalItem> items) { this.items = items; }
}