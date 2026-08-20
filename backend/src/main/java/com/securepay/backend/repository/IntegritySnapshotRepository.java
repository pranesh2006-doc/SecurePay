package com.securepay.backend.repository;

import com.securepay.backend.entity.IntegritySnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IntegritySnapshotRepository
        extends JpaRepository<IntegritySnapshot, Long> {

    Optional<IntegritySnapshot> findByTransactionId(
            String transactionId
    );
}