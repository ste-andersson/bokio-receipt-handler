package se.sveki.receipthandler;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import se.sveki.receipthandler.model.UserEntity;
import se.sveki.receipthandler.repository.UserRepository;

@SpringBootApplication
public class ReceipthandlerApplication {

	public static void main(String[] args) {
		SpringApplication.run(ReceipthandlerApplication.class, args);
	}

	@Bean
	CommandLineRunner seedUsers(UserRepository repository) {
		return args -> {
			if (repository.count() == 0) {
				repository.save(new UserEntity("123", "stefan.andersson@sveki.se"));
			}
		};

	}

}
