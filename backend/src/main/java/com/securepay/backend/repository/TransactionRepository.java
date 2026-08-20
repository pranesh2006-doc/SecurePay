package com.securepay.backend.repository;

import com.securepay.backend.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository
        extends JpaRepository<Transaction, Long> {

    List<Transaction> findBySenderOrderByTimestampDesc(
            String sender
    );

    Optional<Transaction> findByTransactionId(
            String transactionId
    );
}