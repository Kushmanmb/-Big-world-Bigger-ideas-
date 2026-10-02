# 🔐 Zero-Knowledge PDF Verification (zkpdf)

## Overview

The zkpdf module provides zero-knowledge proof-based PDF document verification, allowing users to prove document authenticity, integrity, and ownership without revealing the document contents. This is particularly useful for confidential documents, legal contracts, and sensitive information that requires verification without disclosure.

## Features

- 📄 **Document Registration**: Register PDF documents with cryptographic hashing
- 🔑 **Zero-Knowledge Proofs**: Generate proofs that verify document properties without revealing content
- ✅ **Proof Verification**: Verify proofs to confirm document authenticity and integrity
- 📤 **Submission Workflow**: Submit documents for verification with metadata tracking
- 📊 **Multi-Document Support**: Manage and track multiple documents simultaneously
- 💾 **Metadata Management**: Store and retrieve document metadata securely
- 🔒 **Commitment Schemes**: Use cryptographic commitments for proof generation
- 📈 **Statistics & Reporting**: Track verification activity and generate reports

## Installation

The zkpdf module is included in the Big World Bigger Ideas repository. No additional installation is required beyond the base dependencies.

```bash
npm install
```

## Quick Start

```javascript
const ZKPDFVerifier = require('./src/zkpdf.js');

// Create a verifier instance
const verifier = new ZKPDFVerifier('kushmanmb');

// Register a PDF document
const doc = verifier.registerDocument(
  'contract-001',
  pdfContentBuffer,
  { title: 'Service Agreement', type: 'application/pdf' }
);

// Generate a zero-knowledge proof
const proof = verifier.generateProof('contract-001', {
  purpose: 'verification',
  authorized: true
});

// Verify the proof
const verification = verifier.verifyProof(proof.proofId);
console.log(`Proof is ${verification.isValid ? 'VALID' : 'INVALID'}`);
```

## API Reference

### Constructor

#### `new ZKPDFVerifier(owner)`

Creates a new ZKPDFVerifier instance.

**Parameters:**
- `owner` (string, optional): Owner identifier. Defaults to 'kushmanmb'.

**Example:**
```javascript
const verifier = new ZKPDFVerifier('my-organization');
```

### Document Management

#### `registerDocument(documentId, documentData, metadata)`

Registers a PDF document for verification.

**Parameters:**
- `documentId` (string): Unique identifier for the document
- `documentData` (Buffer|string): PDF document data
- `metadata` (object, optional): Document metadata
  - `title` (string): Document title
  - `type` (string): MIME type (default: 'application/pdf')
  - Additional custom fields as needed

**Returns:**
```javascript
{
  success: true,
  documentId: 'doc-001',
  hash: 'abc123...',
  size: 12345,
  registeredAt: '2024-02-21T10:00:00.000Z'
}
```

**Example:**
```javascript
const result = verifier.registerDocument(
  'contract-2024-001',
  fileBuffer,
  {
    title: 'Service Agreement',
    type: 'application/pdf',
    category: 'legal',
    confidential: true
  }
);
```

#### `getDocumentInfo(documentId)`

Retrieves information about a registered document.

**Parameters:**
- `documentId` (string): Document identifier

**Returns:**
```javascript
{
  success: true,
  id: 'doc-001',
  hash: 'abc123...',
  size: 12345,
  registeredAt: '2024-02-21T10:00:00.000Z',
  owner: 'kushmanmb',
  metadata: {
    title: 'Document Title',
    type: 'application/pdf'
  }
}
```

#### `listDocuments()`

Lists all registered documents.

**Returns:** Array of document information objects.

**Example:**
```javascript
const docs = verifier.listDocuments();
docs.forEach(doc => {
  console.log(`${doc.id}: ${doc.metadata.title}`);
});
```

### Zero-Knowledge Proofs

#### `generateProof(documentId, claims)`

Generates a zero-knowledge proof for a document.

**Parameters:**
- `documentId` (string): Document identifier
- `claims` (object, optional): Claims to include in the proof

**Returns:**
```javascript
{
  success: true,
  proofId: 'proof-abc123',
  commitment: 'xyz789...',
  claims: {
    owner: 'kushmanmb',
    documentExists: true,
    integrityVerified: true,
    // ... additional claims
  },
  createdAt: '2024-02-21T10:00:00.000Z'
}
```

**Example:**
```javascript
const proof = verifier.generateProof('contract-001', {
  contractSigned: true,
  signatureValid: true,
  dateVerified: true
});
```

#### `verifyProof(proofId, verificationData)`

Verifies a zero-knowledge proof.

**Parameters:**
- `proofId` (string): Proof identifier
- `verificationData` (object, optional): Data to verify against
  - `expectedHash` (string): Expected document hash

**Returns:**
```javascript
{
  success: true,
  proofId: 'proof-abc123',
  isValid: true,
  commitmentValid: true,
  documentValid: true,
  dataMatches: true,
  claims: { ... },
  verifiedAt: '2024-02-21T10:05:00.000Z'
}
```

**Example:**
```javascript
const result = verifier.verifyProof(proof.proofId, {
  expectedHash: 'abc123...'
});

if (result.isValid) {
  console.log('Proof is valid!');
}
```

#### `getProofInfo(proofId)`

Retrieves information about a generated proof.

**Parameters:**
- `proofId` (string): Proof identifier

**Returns:** Proof information object (without sensitive data like nonce).

#### `listProofs()`

Lists all generated proofs.

**Returns:** Array of proof information objects.

### Submission & Verification

#### `submitForVerification(documentId, submissionData)`

Submits a document for verification.

**Parameters:**
- `documentId` (string): Document identifier
- `submissionData` (object, optional): Submission metadata

**Returns:**
```javascript
{
  success: true,
  submissionId: 'sub-xyz789',
  documentId: 'doc-001',
  proofId: 'proof-abc123',
  status: 'submitted',
  submittedAt: '2024-02-21T10:00:00.000Z',
  submittedBy: 'kushmanmb',
  metadata: { ... },
  proof: { ... }
}
```

**Example:**
```javascript
const submission = verifier.submitForVerification('contract-001', {
  type: 'integrity-check',
  requester: 'legal-department',
  purpose: 'audit-compliance'
});
```

### Utilities

#### `getStatistics()`

Gets statistics about the verifier.

**Returns:**
```javascript
{
  totalDocuments: 5,
  totalProofs: 8,
  owner: 'kushmanmb',
  cacheSize: 0
}
```

#### `clearAll()`

Clears all registered documents, proofs, and cache.

#### `formatDocumentInfo(docInfo)`

Formats document information for display.

**Parameters:**
- `docInfo` (object): Document information object

**Returns:** Formatted string for console output.

#### `formatProofInfo(proofInfo)`

Formats proof information for display.

**Parameters:**
- `proofInfo` (object): Proof information object

**Returns:** Formatted string for console output.

#### `formatVerificationResult(result)`

Formats verification result for display.

**Parameters:**
- `result` (object): Verification result object

**Returns:** Formatted string for console output.

## How Zero-Knowledge Proofs Work

The zkpdf module uses cryptographic techniques to enable verification without disclosure:

1. **Document Hashing**: When a document is registered, a SHA-256 hash is computed
2. **Commitment Generation**: A cryptographic commitment is created using the document hash, timestamp, and a random nonce
3. **Proof Creation**: The proof includes the commitment and claims about the document
4. **Verification**: Anyone can verify the proof without seeing the original document

### Key Concepts

- **Document Hash**: A unique fingerprint of the document content
- **Commitment**: A cryptographic binding to the document that can be verified later
- **Nonce**: A random value used to ensure uniqueness and prevent replay attacks
- **Claims**: Assertions about the document (e.g., "signed", "valid", "authorized")

## Use Cases

### 1. Confidential Contract Verification

Prove that a signed contract exists without revealing its terms:

```javascript
const verifier = new ZKPDFVerifier('company-legal');

// Register confidential contract
const contract = verifier.registerDocument(
  'nda-2024-001',
  contractBuffer,
  { title: 'Non-Disclosure Agreement', confidential: true }
);

// Generate proof of contract existence and validity
const proof = verifier.generateProof('nda-2024-001', {
  contractSigned: true,
  allPartiesAgreed: true,
  legallyBinding: true
});

// Third party can verify without seeing the contract
const verification = verifier.verifyProof(proof.proofId);
// Returns: { isValid: true, ... }
```

### 2. Document Integrity Checking

Verify document hasn't been tampered with:

```javascript
// Register original document
const original = verifier.registerDocument('report-001', reportData);

// Later, verify integrity by checking hash
const proof = verifier.generateProof('report-001');
const verification = verifier.verifyProof(proof.proofId, {
  expectedHash: original.hash
});

if (verification.isValid && verification.dataMatches) {
  console.log('Document integrity verified!');
}
```

### 3. Compliance & Audit Trail

Create verifiable audit trail for compliance:

```javascript
// Register compliance document
const doc = verifier.registerDocument(
  'audit-2024-q1',
  auditReport,
  { category: 'compliance', quarter: 'Q1-2024' }
);

// Submit for verification
const submission = verifier.submitForVerification('audit-2024-q1', {
  type: 'compliance-verification',
  requester: 'auditor',
  deadline: '2024-03-31'
});

// Generate proof for auditor
const proof = verifier.generateProof('audit-2024-q1', {
  compliant: true,
  reviewedBy: 'compliance-officer',
  timestamp: new Date().toISOString()
});
```

### 4. Multi-Party Document Verification

Multiple parties verify document without sharing it:

```javascript
// Party A registers document
const doc = verifier.registerDocument('agreement-001', documentData);

// Party A generates proof
const proof = verifier.generateProof('agreement-001', {
  authorized: true,
  verified: true
});

// Party B can verify the proof
const verification = verifier.verifyProof(proof.proofId);
// Party B knows the document is valid without seeing it
```

## Security Considerations

### Best Practices

1. **Secure Document Storage**: Store original documents securely; the module only stores hashes
2. **Nonce Management**: In production, keep nonces secret and don't expose them in API responses
3. **Hash Verification**: Always verify document hashes match expected values
4. **Access Control**: Implement proper access controls for proof generation and verification
5. **Audit Logging**: Log all verification activities for audit trails

### Limitations

- **Hash Collisions**: While SHA-256 is secure, be aware of theoretical collision possibilities
- **Nonce Exposure**: The current implementation exposes nonces for demonstration; production systems should keep these secret
- **No Blockchain**: This module doesn't use blockchain; consider integrating with blockchain for immutable proof storage
- **Trust Model**: Relies on the verifier being trusted; consider decentralized verification for higher trust

## Testing

Run the zkpdf tests:

```bash
npm run test:zkpdf
```

Run the demo to see zkpdf in action:

```bash
npm run zkpdf:demo
```

## Integration Examples

### With Express.js API

```javascript
const express = require('express');
const ZKPDFVerifier = require('./src/zkpdf.js');

const app = express();
const verifier = new ZKPDFVerifier('api-server');

app.post('/api/documents/register', (req, res) => {
  const { documentId, data, metadata } = req.body;
  const result = verifier.registerDocument(documentId, data, metadata);
  res.json(result);
});

app.post('/api/proofs/generate', (req, res) => {
  const { documentId, claims } = req.body;
  const proof = verifier.generateProof(documentId, claims);
  res.json(proof);
});

app.post('/api/proofs/verify', (req, res) => {
  const { proofId, verificationData } = req.body;
  const result = verifier.verifyProof(proofId, verificationData);
  res.json(result);
});
```

### With Blockchain Smart Contracts

```javascript
// Store proof commitments on-chain for immutability
const proof = verifier.generateProof('contract-001');

// Submit commitment to blockchain
await blockchainContract.storeCommitment(
  proof.proofId,
  proof.commitment,
  proof.documentId
);

// Later, verify both proof and on-chain commitment
const verification = verifier.verifyProof(proof.proofId);
const onChainCommitment = await blockchainContract.getCommitment(proof.proofId);

if (verification.isValid && onChainCommitment === proof.commitment) {
  console.log('Proof verified both locally and on-chain!');
}
```

## Performance Considerations

- **Hashing**: SHA-256 hashing is fast, even for large documents
- **Memory**: Documents are not stored in memory, only their hashes
- **Caching**: Built-in cache system with 1-hour timeout for improved performance
- **Scalability**: Can handle thousands of documents and proofs

## Troubleshooting

### Common Issues

**Error: "Document ID must be a non-empty string"**
- Ensure documentId is provided and is a non-empty string

**Error: "Document not found"**
- Verify the document was registered before attempting operations
- Check for typos in document IDs

**Error: "Proof not found"**
- Ensure proof was generated before verification
- Check for typos in proof IDs

**Proof verification fails**
- Verify the document hasn't been modified
- Ensure the proof hasn't expired (if implementing expiration)
- Check that the expected hash matches the document hash

## Future Enhancements

Potential improvements for the zkpdf module:

- [ ] Blockchain integration for immutable proof storage
- [ ] Advanced cryptographic schemes (zk-SNARKs, zk-STARKs)
- [ ] Proof expiration and renewal mechanisms
- [ ] Multi-signature proofs for multi-party agreements
- [ ] Merkle tree support for batch verification
- [ ] Integration with existing PKI systems
- [ ] Support for encrypted documents
- [ ] Decentralized verification network

## License

ISC License - See repository LICENSE file for details.

## Author

**Matthew Brace (kushmanmb)**
- Email: mattbrace92@gmail.com
- ENS: kushmanmb.base.eth
- Website: kushmanmb.org

## Related Modules

- **wallet.js**: Wallet encryption/decryption utilities
- **erc721.js**: NFT token management
- **token-history.js**: Token ownership tracking
- **consensus-tracker.js**: Blockchain consensus monitoring

## References

- [Zero-Knowledge Proofs](https://en.wikipedia.org/wiki/Zero-knowledge_proof)
- [Cryptographic Commitment Schemes](https://en.wikipedia.org/wiki/Commitment_scheme)
- [SHA-256 Hashing](https://en.wikipedia.org/wiki/SHA-2)
- [EIP-1967: Proxy Storage Slots](https://eips.ethereum.org/EIPS/eip-1967)

---

For questions or support, please contact mattbrace92@gmail.com or open an issue on the repository.
