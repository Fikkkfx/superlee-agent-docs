/**
 * Story Protocol Documentation Data
 * This file contains structured information about Story Protocol
 * for the AI agent to reference when answering questions.
 */

export interface DocSection {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  category: string;
}

export const storyProtocolDocs: DocSection[] = [
  {
    id: 'what-is-story',
    title: 'What is Story Protocol?',
    content: `Story Protocol is the world's IP blockchain that enables creators to register, license, and monetize their intellectual property. It provides a decentralized infrastructure for managing IP assets, licensing agreements, and royalty distributions.

Key features:
- IP Asset Registration: Register any creative work as an IP Asset on-chain
- Programmable IP Licensing (PIL): Flexible licensing framework
- Automated Royalty Distribution: Smart contract-based royalty payments
- Derivative Work Management: Track and manage derivative creations
- Cross-platform Compatibility: Works with existing NFT collections`,
    keywords: ['story protocol', 'ip blockchain', 'intellectual property', 'licensing', 'royalty'],
    category: 'overview'
  },
  
  {
    id: 'ip-assets',
    title: 'IP Assets',
    content: `IP Assets are the core building blocks of Story Protocol. They represent intellectual property rights on-chain and can be any creative work including:

- Images, artwork, and graphics
- Music and audio content
- Videos and animations
- Written content and stories
- Game assets and characters
- Brand elements and logos

Each IP Asset has:
- Unique IP ID for identification
- Metadata describing the work
- Licensing terms (PIL Terms)
- Ownership information
- Derivative relationship tracking`,
    keywords: ['ip asset', 'intellectual property', 'creative work', 'metadata', 'ownership'],
    category: 'core-concepts'
  },

  {
    id: 'pil-terms',
    title: 'PIL Terms (Programmable IP Licensing)',
    content: `PIL Terms define how IP Assets can be used, remixed, and commercialized. Story Protocol offers several pre-built PIL flavors:

**Non-Commercial Social Remixing (by-nc)**
- Free to use for non-commercial purposes
- Attribution required
- Derivatives must use same license
- No commercial use allowed

**Commercial Use (by-c)**
- Allows commercial usage
- Requires minting fee payment
- Revenue sharing with original creator
- Attribution required

**Commercial Remix (by-c-remix)**
- Commercial use permitted
- Derivatives allowed
- Revenue sharing applies
- Most flexible terms

Custom PIL Terms can also be created for specific use cases.`,
    keywords: ['pil terms', 'licensing', 'commercial', 'non-commercial', 'remix', 'attribution'],
    category: 'licensing'
  },

  {
    id: 'registration-process',
    title: 'How to Register an IP Asset',
    content: `Registering an IP Asset on Story Protocol involves several steps:

1. **Prepare Your Content**
   - Ensure you own the rights to the content
   - Prepare high-quality files
   - Gather metadata information

2. **Choose Licensing Terms**
   - Select appropriate PIL Terms
   - Consider commercial vs non-commercial use
   - Set any required fees or royalties

3. **Upload to IPFS**
   - Content is stored on IPFS for decentralization
   - Metadata is also stored on IPFS
   - Hash references are stored on-chain

4. **Mint and Register**
   - Use Story Protocol SDK or interface
   - Pay gas fees for transaction
   - Receive unique IP ID

5. **Verification**
   - Confirm registration on blockchain
   - IP Asset is now discoverable
   - Ready for licensing and derivatives`,
    keywords: ['register', 'registration', 'mint', 'ipfs', 'sdk', 'ip id'],
    category: 'how-to'
  },

  {
    id: 'royalties',
    title: 'Royalty System',
    content: `Story Protocol features an automated royalty distribution system:

**How Royalties Work:**
- Set percentage when creating PIL Terms
- Automatically collected from derivative works
- Distributed to original creators
- Transparent on-chain tracking

**Royalty Types:**
- Minting fees: One-time payment for derivatives
- Revenue sharing: Percentage of ongoing revenue
- Attribution fees: Payment for attribution rights

**Distribution:**
- Smart contracts handle automatic distribution
- No manual intervention required
- Real-time settlement
- Multi-level royalty chains supported

**Benefits:**
- Creators earn from derivative works
- Transparent and trustless system
- Reduces friction in licensing
- Encourages creative collaboration`,
    keywords: ['royalty', 'revenue sharing', 'distribution', 'minting fee', 'derivative'],
    category: 'monetization'
  },

  {
    id: 'sdk-usage',
    title: 'Using the TypeScript SDK',
    content: `The Story Protocol TypeScript SDK provides easy integration:

**Installation:**
\`\`\`bash
npm install @story-protocol/core-sdk
\`\`\`

**Basic Setup:**
\`\`\`typescript
import { StoryClient, StoryConfig } from '@story-protocol/core-sdk';

const config: StoryConfig = {
  account: account, // Your wallet account
  transport: http(process.env.RPC_PROVIDER_URL),
  chainId: 'aeneid', // Story testnet
};

const client = StoryClient.newClient(config);
\`\`\`

**Register IP Asset:**
\`\`\`typescript
const response = await client.ipAsset.mintAndRegisterIp({
  spgNftContract: '0x...', // SPG collection address
  recipient: '0x...', // Recipient address
  ipMetadata: {
    ipMetadataURI: 'ipfs://...',
    ipMetadataHash: '0x...',
    nftMetadataURI: 'ipfs://...',
    nftMetadataHash: '0x...'
  }
});
\`\`\``,
    keywords: ['sdk', 'typescript', 'integration', 'api', 'development'],
    category: 'development'
  },

  {
    id: 'smart-contracts',
    title: 'Smart Contracts',
    content: `Story Protocol consists of several key smart contracts:

**Core Contracts:**
- **IP Asset Registry**: Central registry for all IP Assets
- **Licensing Module**: Handles PIL Terms and licensing
- **Royalty Module**: Manages royalty distribution
- **SPG (Story Protocol Gateway)**: Simplified interface for common operations

**Deployed Addresses (Aeneid Testnet):**
- IP Asset Registry: 0x...
- Licensing Module: 0x...
- Royalty Module: 0x...
- Default SPG Collection: 0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc

**Key Functions:**
- registerIpAsset(): Register new IP Asset
- attachLicenseTerms(): Attach licensing terms
- mintLicenseTokens(): Create license tokens
- collectRoyalties(): Claim earned royalties`,
    keywords: ['smart contracts', 'registry', 'licensing module', 'royalty module', 'spg'],
    category: 'technical'
  },

  {
    id: 'derivatives',
    title: 'Derivative Works',
    content: `Story Protocol enables tracking and management of derivative works:

**What are Derivatives:**
- Works based on or derived from existing IP Assets
- Remixes, adaptations, or transformations
- Must respect original licensing terms
- Create new IP Assets with parent relationships

**Creating Derivatives:**
1. Find parent IP Asset with compatible license
2. Ensure compliance with PIL Terms
3. Pay any required minting fees
4. Register derivative as new IP Asset
5. Parent-child relationship is recorded

**Benefits:**
- Clear provenance tracking
- Automated royalty flow to parents
- Legal framework for remixing
- Encourages creative collaboration

**Use Cases:**
- Music remixes and covers
- Art variations and adaptations
- Story continuations and spin-offs
- Game mods and extensions`,
    keywords: ['derivative', 'remix', 'parent', 'child', 'provenance', 'collaboration'],
    category: 'core-concepts'
  },

  {
    id: 'troubleshooting',
    title: 'Common Issues and Solutions',
    content: `Common problems and their solutions:

**Registration Issues:**
- "MINTER_ROLE not granted": SPG collection needs to grant MINTER_ROLE to IP Asset contract
- "Insufficient gas": Increase gas limit for complex transactions
- "Invalid metadata": Ensure IPFS URLs are accessible and properly formatted

**Licensing Problems:**
- "License not compatible": Check PIL Terms compatibility between parent and derivative
- "Fee not paid": Ensure minting fees are paid when creating derivatives
- "Attribution missing": Include proper attribution in derivative metadata

**SDK Errors:**
- "Network mismatch": Ensure using correct chain ID (1315 for Aeneid)
- "Account not connected": Verify wallet connection and account setup
- "RPC errors": Check RPC endpoint and network connectivity

**Best Practices:**
- Always test on testnet first
- Keep private keys secure
- Verify transactions on block explorer
- Use proper error handling in applications`,
    keywords: ['troubleshooting', 'errors', 'minter role', 'gas', 'network', 'best practices'],
    category: 'support'
  }
];

// Helper functions for searching documentation
export function searchDocs(query: string): DocSection[] {
  const searchTerms = query.toLowerCase().split(' ');
  
  return storyProtocolDocs.filter(doc => {
    const searchableText = `${doc.title} ${doc.content} ${doc.keywords.join(' ')}`.toLowerCase();
    return searchTerms.some(term => searchableText.includes(term));
  }).sort((a, b) => {
    // Sort by relevance (number of matching terms)
    const aMatches = searchTerms.filter(term => 
      `${a.title} ${a.content} ${a.keywords.join(' ')}`.toLowerCase().includes(term)
    ).length;
    const bMatches = searchTerms.filter(term => 
      `${b.title} ${b.content} ${b.keywords.join(' ')}`.toLowerCase().includes(term)
    ).length;
    return bMatches - aMatches;
  });
}

export function getDocsByCategory(category: string): DocSection[] {
  return storyProtocolDocs.filter(doc => doc.category === category);
}

export function getDocById(id: string): DocSection | undefined {
  return storyProtocolDocs.find(doc => doc.id === id);
}

export function getAllCategories(): string[] {
  return [...new Set(storyProtocolDocs.map(doc => doc.category))];
}

// Quick answers for common questions
export const quickAnswers = {
  'what is story protocol': 'Story Protocol is the world\'s IP blockchain that enables creators to register, license, and monetize their intellectual property.',
  'how to register ip': 'To register an IP Asset, prepare your content, choose licensing terms, upload to IPFS, then use the SDK or interface to mint and register.',
  'what are pil terms': 'PIL Terms (Programmable IP Licensing) define how IP Assets can be used, including commercial rights, attribution requirements, and derivative permissions.',
  'how do royalties work': 'Royalties are automatically distributed through smart contracts when derivatives are created or revenue is generated from licensed IP.',
  'what is spg': 'SPG (Story Protocol Gateway) is a simplified interface that combines multiple operations into single transactions for easier IP Asset management.'
};