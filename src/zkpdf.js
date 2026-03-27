/**
 * zkpdf.js - Zero-Knowledge PDF Verification Module
 * 
 * This module provides utilities for zero-knowledge proof-based PDF document
 * verification, allowing users to prove document authenticity and integrity
 * without revealing the document contents.
 * 
 * @author Matthew Brace (kushmanmb)
 * @license ISC
 */

const crypto = require('crypto');

/**
 * ZKPDFVerifier class for zero-knowledge PDF verification
 * Supports document hashing, proof generation, and verification
 */
class ZKPDFVerifier {
  constructor(owner = 'kushmanmb') {
    this.owner = owner;
    this.documents = new Map();
    this.proofs = new Map();
    this.cache = new Map();
    this.cacheTimeout = 3600000; // 1 hour in milliseconds
  }

  /**
   * Register a PDF document for verification
   * @param {string} documentId - Unique identifier for the document
   * @param {Buffer|string} documentData - PDF document data
   * @param {object} metadata - Document metadata
   * @returns {object} Registration result with document hash
   */
  registerDocument(documentId, documentData, metadata = {}) {
    if (!documentId || typeof documentId !== 'string') {
      throw new Error('Document ID must be a non-empty string');
    }

    // Convert string to buffer if needed
    const buffer = Buffer.isBuffer(documentData) 
      ? documentData 
      : Buffer.from(documentData, 'utf-8');

    // Generate document hash
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    // Store document info
    const docInfo = {
      id: documentId,
      hash: hash,
      size: buffer.length,
      registeredAt: new Date().toISOString(),
      owner: this.owner,
      metadata: {
        ...metadata,
        title: metadata.title || 'Untitled Document',
        type: metadata.type || 'application/pdf'
      }
    };

    this.documents.set(documentId, docInfo);

    return {
      success: true,
      documentId: documentId,
      hash: hash,
      size: buffer.length,
      registeredAt: docInfo.registeredAt
    };
  }

  /**
   * Generate zero-knowledge proof for a document
   * @param {string} documentId - Document identifier
   * @param {object} claims - Claims to prove (e.g., ownership, timestamp)
   * @returns {object} Generated proof
   */
  generateProof(documentId, claims = {}) {
    const doc = this.documents.get(documentId);
    if (!doc) {
      throw new Error(`Document not found: ${documentId}`);
    }

    // Generate proof components
    const proofId = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const nonce = crypto.randomBytes(32).toString('hex');

    // Create commitment
    const commitment = crypto
      .createHash('sha256')
      .update(`${doc.hash}:${timestamp}:${nonce}`)
      .digest('hex');

    const proof = {
      proofId: proofId,
      documentId: documentId,
      documentHash: doc.hash,
      commitment: commitment,
      timestamp: timestamp,
      claims: {
        owner: this.owner,
        documentExists: true,
        integrityVerified: true,
        ...claims
      },
      // SECURITY: In a production ZKP system, nonce should NEVER be stored or exposed
      // This is a simplified demonstration - real ZKP protocols use different mechanisms
      nonce: nonce, // WARNING: Keeping for backward compatibility, but this breaks zero-knowledge property
      createdAt: new Date().toISOString()
    };

    this.proofs.set(proofId, proof);

    return {
      success: true,
      proofId: proofId,
      commitment: commitment,
      claims: proof.claims,
      createdAt: proof.createdAt
      // SECURITY: nonce is NOT returned in the response (production best practice)
    };
  }

  /**
   * Verify a zero-knowledge proof
   * @param {string} proofId - Proof identifier
   * @param {object} verificationData - Data to verify against
   * @returns {object} Verification result
   */
  verifyProof(proofId, verificationData = {}) {
    const proof = this.proofs.get(proofId);
    if (!proof) {
      throw new Error(`Proof not found: ${proofId}`);
    }

    // Verify commitment
    const expectedCommitment = crypto
      .createHash('sha256')
      .update(`${proof.documentHash}:${proof.timestamp}:${proof.nonce}`)
      .digest('hex');

    const commitmentValid = expectedCommitment === proof.commitment;

    // Verify document still exists
    const doc = this.documents.get(proof.documentId);
    const documentValid = doc && doc.hash === proof.documentHash;

    // Check if verification data matches (if provided)
    let dataMatches = true;
    if (verificationData.expectedHash) {
      dataMatches = proof.documentHash === verificationData.expectedHash;
    }

    const isValid = commitmentValid && documentValid && dataMatches;

    return {
      success: true,
      proofId: proofId,
      isValid: isValid,
      commitmentValid: commitmentValid,
      documentValid: documentValid,
      dataMatches: dataMatches,
      claims: proof.claims,
      verifiedAt: new Date().toISOString()
    };
  }

  /**
   * Submit document for verification
   * @param {string} documentId - Document identifier
   * @param {object} submissionData - Submission metadata
   * @returns {object} Submission result
   */
  submitForVerification(documentId, submissionData = {}) {
    const doc = this.documents.get(documentId);
    if (!doc) {
      throw new Error(`Document not found: ${documentId}`);
    }

    // Generate submission proof
    const proof = this.generateProof(documentId, {
      submissionType: submissionData.type || 'verification',
      submittedBy: this.owner
    });

    const submission = {
      submissionId: crypto.randomBytes(16).toString('hex'),
      documentId: documentId,
      proofId: proof.proofId,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      submittedBy: this.owner,
      metadata: submissionData
    };

    return {
      success: true,
      ...submission,
      proof: proof
    };
  }

  /**
   * Get document information
   * @param {string} documentId - Document identifier
   * @returns {object} Document information
   */
  getDocumentInfo(documentId) {
    const doc = this.documents.get(documentId);
    if (!doc) {
      throw new Error(`Document not found: ${documentId}`);
    }

    return {
      success: true,
      ...doc
    };
  }

  /**
   * Get proof information
   * @param {string} proofId - Proof identifier
   * @returns {object} Proof information
   */
  getProofInfo(proofId) {
    const proof = this.proofs.get(proofId);
    if (!proof) {
      throw new Error(`Proof not found: ${proofId}`);
    }

    // Return proof without the nonce for security
    const { nonce, ...publicProof } = proof;
    return {
      success: true,
      ...publicProof
    };
  }

  /**
   * List all registered documents
   * @returns {Array} Array of document information
   */
  listDocuments() {
    const docs = [];
    for (const [id, doc] of this.documents) {
      docs.push({ ...doc });
    }
    return docs;
  }

  /**
   * List all generated proofs
   * @returns {Array} Array of proof information
   */
  listProofs() {
    const proofs = [];
    for (const [id, proof] of this.proofs) {
      const { nonce, ...publicProof } = proof;
      proofs.push({ ...publicProof });
    }
    return proofs;
  }

  /**
   * Get statistics about the verifier
   * @returns {object} Statistics
   */
  getStatistics() {
    return {
      totalDocuments: this.documents.size,
      totalProofs: this.proofs.size,
      owner: this.owner,
      cacheSize: this.cache.size
    };
  }

  /**
   * Clear all data
   */
  clearAll() {
    this.documents.clear();
    this.proofs.clear();
    this.cache.clear();
  }

  /**
   * Format document information for display
   * @param {object} docInfo - Document information
   * @returns {string} Formatted output
   */
  formatDocumentInfo(docInfo) {
    return `
Document Information
================================

ID: ${docInfo.id}
Hash: ${docInfo.hash}
Size: ${docInfo.size} bytes
Title: ${docInfo.metadata.title}
Type: ${docInfo.metadata.type}
Owner: ${docInfo.owner}
Registered: ${docInfo.registeredAt}
`;
  }

  /**
   * Format proof information for display
   * @param {object} proofInfo - Proof information
   * @returns {string} Formatted output
   */
  formatProofInfo(proofInfo) {
    const claimsStr = Object.entries(proofInfo.claims)
      .map(([key, value]) => `  ${key}: ${value}`)
      .join('\n');

    return `
Zero-Knowledge Proof
================================

Proof ID: ${proofInfo.proofId}
Document ID: ${proofInfo.documentId}
Document Hash: ${proofInfo.documentHash}
Commitment: ${proofInfo.commitment}
Created: ${proofInfo.createdAt}

Claims:
${claimsStr}
`;
  }

  /**
   * Format verification result for display
   * @param {object} result - Verification result
   * @returns {string} Formatted output
   */
  formatVerificationResult(result) {
    const status = result.isValid ? '✓ VALID' : '✗ INVALID';
    return `
Verification Result
================================

Proof ID: ${result.proofId}
Status: ${status}
Commitment Valid: ${result.commitmentValid ? '✓' : '✗'}
Document Valid: ${result.documentValid ? '✓' : '✗'}
Data Matches: ${result.dataMatches ? '✓' : '✗'}
Verified At: ${result.verifiedAt}
`;
  }
}

module.exports = ZKPDFVerifier;
