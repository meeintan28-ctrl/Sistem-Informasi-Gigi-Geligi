# Security Specification: DentaCare Pro

## Data Invariants
1. **Relational Integrity**: A `MedicalRecord` must reference a valid `patientId` that exists in the `/patients/` collection.
2. **Identity Ownership**: `operatorId` in `MedicalRecord` must match the `auth.uid` of the creator.
3. **Immutability**: `createdAt` and `patientId` in a `MedicalRecord` cannot be changed after creation.
4. **Role-Based Access**: Only users with roles `admin`, `dokter`, or `terapis` can write medical records. `staff` can only manage appointments and patient demographics.
5. **Verified Access**: All write operations require `auth.token.email_verified == true`.

## The Dirty Dozen Payloads (Rejection Targets)

1. **Identity Spoofing**: Attempt to create a patient record with a different `createdBy` UID.
2. **Privilege Escalation**: A `staff` role user attempting to write a `MedicalRecord`.
3. **ID Poisoning**: Using a 2KB string as a `patientId`.
4. **Orphaned Record**: Creating a `MedicalRecord` with a `patientId` that does not exist.
5. **State Shortcut**: Updating a `MedicalRecord` status directly from `draft` to `final` without valid operator signature (if implemented) or by an unauthorized role.
6. **Immutable Field Tampering**: Changing the `patientId` of an existing `MedicalRecord`.
7. **Shadow Update**: Adding an `isAdmin: true` field to a user profile during a standard update.
8. **PII Leak**: Unauthenticated user attempting to `get` a document from the `patients` collection.
9. **Unverified Email**: A user with `email_verified: false` attempting to create a record.
10. **Data Type Mismatch**: Sending a string for the `dmft.d` integer field.
11. **Resource Exhaustion**: Sending a 2MB string in the `anamnesis.keluhan` field.
12. **System Field Injection**: Attempting to set `updatedAt` to a client-side timestamp instead of `serverTimestamp()`.

## Test Runner (firestore.rules.test.ts)
*(To be implemented in the testing phase)*
