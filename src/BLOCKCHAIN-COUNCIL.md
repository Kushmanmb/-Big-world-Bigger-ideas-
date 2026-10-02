# Blockchain Council Module

A comprehensive governance and council management module for blockchain projects. Manages council members, proposals, voting, and governance processes with configurable thresholds and quorum requirements.

## Features

- **Member Management**: Add, remove, and manage council members with different roles
- **Proposal System**: Create and manage governance proposals
- **Voting Mechanism**: Democratic voting with configurable thresholds
- **Role-Based Access**: Multiple member roles including Founder, Core Developer, Validator, and more
- **Quorum Support**: Configurable quorum requirements for proposal validity
- **Statistics & Analytics**: Comprehensive tracking of member participation and proposal outcomes
- **JSON Export**: Export council data for persistence and analysis

## Installation

```bash
npm install big-world-bigger-ideas
```

## Usage

### Basic Example

```javascript
const { BlockchainCouncil, MEMBER_ROLES, PROPOSAL_STATUS } = require('big-world-bigger-ideas');

// Create a council with custom thresholds
const council = new BlockchainCouncil('DAO Council', {
  votingThreshold: 0.6,    // 60% approval needed
  quorumPercentage: 0.4    // 40% participation required
});

// Add members
council.addMember(
  '0x1234567890123456789012345678901234567890',
  'Alice Johnson',
  MEMBER_ROLES.FOUNDER
);

council.addMember(
  '0x2222222222222222222222222222222222222222',
  'Bob Smith',
  MEMBER_ROLES.CORE_DEVELOPER
);

// Create a proposal
const proposal = council.createProposal(
  '0x1234567890123456789012345678901234567890',
  'Upgrade Protocol to V2',
  'Proposal to upgrade the protocol with new features'
);

// Vote on the proposal
council.vote(proposal.id, '0x2222222222222222222222222222222222222222', 'for');

// Close voting and check outcome
const result = council.closeVoting(proposal.id);
console.log(result.status); // 'Passed' or 'Rejected'

// Execute passed proposal
if (result.status === PROPOSAL_STATUS.PASSED) {
  council.executeProposal(proposal.id);
}
```

## API Reference

### Constructor

#### `new BlockchainCouncil(councilName, options)`

Creates a new blockchain council instance.

**Parameters:**
- `councilName` (string): Name of the council
- `options` (object, optional):
  - `votingThreshold` (number): Approval percentage required (0-1, default: 0.5)
  - `quorumPercentage` (number): Participation percentage required (0-1, default: 0.3)

**Example:**
```javascript
const council = new BlockchainCouncil('Web3 Council', {
  votingThreshold: 0.66,   // 66% approval required
  quorumPercentage: 0.5    // 50% quorum required
});
```

### Member Management

#### `addMember(address, name, role, metadata)`

Adds a new member to the council.

**Parameters:**
- `address` (string): Member's blockchain address (with or without 0x prefix)
- `name` (string): Member's name
- `role` (string): Member's role (from MEMBER_ROLES)
- `metadata` (object, optional): Additional member data

**Returns:** Member object

**Example:**
```javascript
const member = council.addMember(
  '0x1234567890123456789012345678901234567890',
  'Alice',
  MEMBER_ROLES.FOUNDER,
  { bio: 'Blockchain pioneer', twitter: '@alice' }
);
```

#### `getMember(address)`

Gets a member by their blockchain address.

**Parameters:**
- `address` (string): Member's blockchain address

**Returns:** Member object

**Example:**
```javascript
const member = council.getMember('0x1234567890123456789012345678901234567890');
console.log(member.name); // 'Alice'
```

#### `getAllMembers(filters)`

Gets all council members, optionally filtered.

**Parameters:**
- `filters` (object, optional):
  - `role` (string): Filter by role
  - `active` (boolean): Filter by active status

**Returns:** Array of member objects

**Example:**
```javascript
// Get all members
const allMembers = council.getAllMembers();

// Get only founders
const founders = council.getAllMembers({ role: MEMBER_ROLES.FOUNDER });

// Get only active members
const activeMembers = council.getAllMembers({ active: true });
```

#### `updateMember(address, updates)`

Updates a member's information.

**Parameters:**
- `address` (string): Member's blockchain address
- `updates` (object): Fields to update

**Returns:** Updated member object

**Example:**
```javascript
const updated = council.updateMember('0x1234...', {
  role: MEMBER_ROLES.ADVISOR,
  active: false
});
```

#### `removeMember(address)`

Removes a member from the council.

**Parameters:**
- `address` (string): Member's blockchain address

**Returns:** Boolean (true if removed)

**Example:**
```javascript
council.removeMember('0x1234567890123456789012345678901234567890');
```

### Proposal Management

#### `createProposal(creatorAddress, title, description, options)`

Creates a new governance proposal.

**Parameters:**
- `creatorAddress` (string): Address of the member creating the proposal
- `title` (string): Proposal title
- `description` (string): Proposal description
- `options` (object, optional):
  - `votingDeadline` (string): ISO date string for deadline
  - `metadata` (object): Additional proposal data

**Returns:** Proposal object

**Example:**
```javascript
const proposal = council.createProposal(
  '0x1234567890123456789012345678901234567890',
  'Fund Marketing Campaign',
  'Allocate 10 ETH for Q1 marketing',
  {
    votingDeadline: '2024-12-31T23:59:59Z',
    metadata: { budget: '10 ETH', category: 'marketing' }
  }
);
```

#### `getProposal(proposalId)`

Gets a proposal by ID.

**Parameters:**
- `proposalId` (number): Proposal ID

**Returns:** Proposal object

**Example:**
```javascript
const proposal = council.getProposal(1);
console.log(proposal.title);
```

#### `getAllProposals(filters)`

Gets all proposals, optionally filtered.

**Parameters:**
- `filters` (object, optional):
  - `status` (string): Filter by status
  - `creator` (string): Filter by creator address

**Returns:** Array of proposal objects

**Example:**
```javascript
// Get all proposals
const allProposals = council.getAllProposals();

// Get only active proposals
const activeProposals = council.getAllProposals({ 
  status: PROPOSAL_STATUS.ACTIVE 
});

// Get proposals by creator
const aliceProposals = council.getAllProposals({ 
  creator: '0x1234567890123456789012345678901234567890' 
});
```

### Voting

#### `vote(proposalId, voterAddress, vote)`

Casts a vote on a proposal.

**Parameters:**
- `proposalId` (number): Proposal ID
- `voterAddress` (string): Address of voting member
- `vote` (string): Vote choice: 'for', 'against', or 'abstain'

**Returns:** Updated proposal object

**Example:**
```javascript
council.vote(1, '0x2222222222222222222222222222222222222222', 'for');
council.vote(1, '0x3333333333333333333333333333333333333333', 'against');
council.vote(1, '0x4444444444444444444444444444444444444444', 'abstain');
```

#### `closeVoting(proposalId)`

Closes voting on a proposal and determines the outcome.

**Parameters:**
- `proposalId` (number): Proposal ID

**Returns:** Updated proposal with outcome

**Example:**
```javascript
const result = council.closeVoting(1);
console.log(result.status);  // 'Passed' or 'Rejected'
console.log(result.outcome);  // Detailed outcome message
```

#### `executeProposal(proposalId)`

Executes a passed proposal.

**Parameters:**
- `proposalId` (number): Proposal ID

**Returns:** Executed proposal object

**Example:**
```javascript
if (proposal.status === PROPOSAL_STATUS.PASSED) {
  const executed = council.executeProposal(proposal.id);
  console.log('Executed at:', executed.executedAt);
}
```

### Statistics & Analytics

#### `getStatistics()`

Gets comprehensive council statistics.

**Returns:** Statistics object with member counts, role distribution, and proposal status

**Example:**
```javascript
const stats = council.getStatistics();
console.log(`Total Members: ${stats.totalMembers}`);
console.log(`Active Members: ${stats.activeMembers}`);
console.log(`Total Proposals: ${stats.totalProposals}`);
console.log('Role Distribution:', stats.roleDistribution);
console.log('Proposals by Status:', stats.proposalsByStatus);
```

#### `getMemberParticipation(address)`

Gets participation statistics for a specific member.

**Parameters:**
- `address` (string): Member's blockchain address

**Returns:** Participation statistics object

**Example:**
```javascript
const participation = council.getMemberParticipation('0x1234...');
console.log(`Proposals Created: ${participation.proposalsCreated}`);
console.log(`Votes Participated: ${participation.votesParticipated}`);
console.log(`Participation Rate: ${participation.participationRate}`);
```

#### `getActiveMemberCount()`

Gets the count of active members.

**Returns:** Number of active members

**Example:**
```javascript
const activeCount = council.getActiveMemberCount();
console.log(`Active members: ${activeCount}`);
```

### Data Export

#### `toJSON()`

Exports all council data as JSON string.

**Returns:** JSON string

**Example:**
```javascript
const councilData = council.toJSON();
// Save to file or database
fs.writeFileSync('council-data.json', councilData);
```

## Constants

### MEMBER_ROLES

Available member roles:

```javascript
const MEMBER_ROLES = {
  FOUNDER: 'Founder',
  CORE_DEVELOPER: 'Core Developer',
  VALIDATOR: 'Validator',
  ADVISOR: 'Advisor',
  COMMUNITY_LEAD: 'Community Lead',
  SECURITY_AUDITOR: 'Security Auditor',
  DOCUMENTATION_LEAD: 'Documentation Lead'
};
```

### PROPOSAL_STATUS

Proposal status types:

```javascript
const PROPOSAL_STATUS = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  PASSED: 'Passed',
  REJECTED: 'Rejected',
  EXECUTED: 'Executed',
  CANCELLED: 'Cancelled'
};
```

## Advanced Examples

### Multi-Stage Governance

```javascript
const council = new BlockchainCouncil('DAO', {
  votingThreshold: 0.75,    // 75% for major decisions
  quorumPercentage: 0.5     // 50% participation required
});

// Stage 1: Add council members
const members = [
  ['0x1111...', 'Alice', MEMBER_ROLES.FOUNDER],
  ['0x2222...', 'Bob', MEMBER_ROLES.CORE_DEVELOPER],
  ['0x3333...', 'Carol', MEMBER_ROLES.VALIDATOR],
  ['0x4444...', 'David', MEMBER_ROLES.SECURITY_AUDITOR]
];

members.forEach(([address, name, role]) => {
  council.addMember(address, name, role);
});

// Stage 2: Create multiple proposals
const proposals = [
  ['Protocol Upgrade', 'Upgrade to V2', { priority: 'high' }],
  ['Treasury Allocation', 'Allocate funds', { priority: 'medium' }]
];

proposals.forEach(([title, description, metadata]) => {
  council.createProposal(members[0][0], title, description, { metadata });
});

// Stage 3: Voting round
council.vote(1, members[1][0], 'for');
council.vote(1, members[2][0], 'for');
council.vote(1, members[3][0], 'for');

// Stage 4: Close and execute
const result = council.closeVoting(1);
if (result.status === PROPOSAL_STATUS.PASSED) {
  council.executeProposal(1);
  console.log('Proposal executed successfully!');
}
```

### Monitoring Participation

```javascript
// Track member participation
const members = council.getAllMembers();
members.forEach(member => {
  const participation = council.getMemberParticipation(member.address);
  console.log(`${member.name}: ${participation.participationRate} participation`);
  
  if (parseFloat(participation.participationRate) < 50) {
    console.log(`  ⚠️ Low participation!`);
  }
});
```

### Analytics Dashboard

```javascript
function printDashboard() {
  const stats = council.getStatistics();
  
  console.log('=== Council Dashboard ===');
  console.log(`Council: ${stats.councilName}`);
  console.log(`Members: ${stats.activeMembers}/${stats.totalMembers}`);
  console.log(`Proposals: ${stats.totalProposals}`);
  console.log('\nRole Distribution:');
  Object.entries(stats.roleDistribution).forEach(([role, count]) => {
    console.log(`  ${role}: ${count}`);
  });
  console.log('\nProposal Status:');
  Object.entries(stats.proposalsByStatus).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });
}

printDashboard();
```

## Error Handling

The module throws descriptive errors for invalid operations:

```javascript
try {
  // Invalid address
  council.addMember('invalid', 'Bob', MEMBER_ROLES.VALIDATOR);
} catch (error) {
  console.error(error.message); // 'Invalid blockchain address format'
}

try {
  // Duplicate vote
  council.vote(1, '0x1234...', 'for');
  council.vote(1, '0x1234...', 'against');
} catch (error) {
  console.error(error.message); // 'Member has already voted'
}

try {
  // Non-existent member
  council.getMember('0x9999...');
} catch (error) {
  console.error(error.message); // 'Member not found'
}
```

## Best Practices

1. **Set Appropriate Thresholds**: Choose voting thresholds and quorum requirements that balance security with efficiency
2. **Regular Participation Monitoring**: Track member participation and address low engagement
3. **Clear Proposals**: Write detailed proposal descriptions to ensure all members understand what they're voting on
4. **Export Data Regularly**: Use `toJSON()` to backup council state
5. **Role-Based Permissions**: Assign appropriate roles to members based on their responsibilities
6. **Validate Addresses**: Always ensure blockchain addresses are valid before adding members

## Testing

Run the test suite:

```bash
npm run test:blockchain-council
```

Run the demo:

```bash
npm run blockchain-council:demo
```

## Use Cases

- **DAO Governance**: Decentralized autonomous organization management
- **Protocol Governance**: Blockchain protocol upgrade decisions
- **Treasury Management**: Multi-sig treasury fund allocation
- **Community Voting**: Community-driven project decisions
- **Multi-Stakeholder Coordination**: Coordinating multiple parties with different roles

## License

ISC

## Author

Matthew Brace (mattbrace92@gmail.com)

## Links

- [GitHub Repository](https://github.com/Kushmanmb/-Big-world-Bigger-ideas-)
- [NPM Package](https://www.npmjs.com/package/big-world-bigger-ideas)
- [Documentation](https://github.com/Kushmanmb/-Big-world-Bigger-ideas-#readme)
