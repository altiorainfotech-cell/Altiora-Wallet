Altiora Wallet - Feature Analysis & Issues Report
App Overview
This is a cryptocurrency wallet mobile application built with React Native and Expo. It's designed for managing crypto assets, NFTs, and interacting with decentralized applications (dApps).
✨ Key Features
1. Wallet Management
Create New Wallets: Generate Ethereum wallets with HD (Hierarchical Deterministic) wallet support
Import Wallets: Support for importing via Secret Recovery Phrase (SRP)
Multi-Account Support: Create and manage multiple accounts within the same wallet
Biometric Security: Face ID/Fingerprint authentication for accessing wallets
Secure Storage: Encrypted storage using expo-secure-store with AES encryption
2. Asset Management
Token Portfolio: Display and manage multiple cryptocurrencies (ETH, USDC, USDT, BNB, PEPE, WBTC, etc.)
NFT Gallery: View and manage NFT collections with visual thumbnails
Portfolio Tracking: Real-time portfolio value calculation with 24h change percentages
Token Filtering: Filter tokens by "all", "gainers", or "losers"
3. Blockchain Operations
Send Transactions: Transfer crypto assets to other addresses
Receive Assets: Generate QR codes for receiving payments
Token Swaps: Built-in DEX integration (using 0x protocol API)
Staking: Stake tokens for rewards
Buy Crypto: Integrated buy functionality
4. Multi-Network Support
Sepolia (ETH testnet)
Polygon (MATIC)
Base
Uses Alchemy API for blockchain RPC connections
5. dApp Integration
WalletConnect: Connect to decentralized applications
Transaction Confirmation: Review and approve dApp transactions
QR Code Scanner: Scan QR codes for addresses and dApp connections
6. Security Features
Recovery Phrase Management: Secure display and verification of 12-word recovery phrases
Biometric Authentication: Face ID/Touch ID for wallet access
Account Deletion Protection: Requires recovery phrase verification to delete accounts
Account Switching Verification: Requires phrase verification when switching to older accounts
7. User Interface
Tab Navigation: Home, Explore, Chat, Settings
Modal Screens: Send, Receive, Swap, Stake, Buy, Token Details, etc.
Dark/Light Mode Support: Automatic theme switching
Haptic Feedback: Touch feedback throughout the app
Animated Onboarding: Multi-slide introduction flow
8. Chat Feature
AI-powered chat for crypto assistance
Thread-based conversations
Chat history management/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
