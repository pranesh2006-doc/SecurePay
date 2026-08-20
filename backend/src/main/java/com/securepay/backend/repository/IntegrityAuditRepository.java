package com.securepay.backend.repository;

import com.securepay.backend.entity.IntegrityAudit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IntegrityAuditRepository
        extends JpaRepository<IntegrityAudit, Long> {

    List<IntegrityAudit> findByTransactionIdOrderByVerificationTimeDesc(
            String transactionId
    );
}