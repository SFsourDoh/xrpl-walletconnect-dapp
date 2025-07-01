# XRPL WalletConnect Integration Demo

A complete demonstration of integrating WalletConnect v2 with the XRP Ledger (XRPL) using React and Next.js. This project shows how to connect to XRPL wallets, sign transactions, and submit them to the ledger.

## 🚀 Features

- **Multi-Network Support**: Connect to XRPL Mainnet, Testnet, and Devnet
- **WalletConnect v2 Integration**: Modern wallet connection using WalletConnect protocol
- **Transaction Signing**: Sign XRPL transactions with connected wallets
- **Transaction Submission**: Submit signed transactions directly to XRPL
- **Dynamic Account Detection**: Automatically use connected wallet's account address
- **Real-time Status**: Live feedback on connection, signing, and submission status
- **Educational Code**: Well-commented code for learning WalletConnect + XRPL integration

## 📋 Prerequisites

- Node.js 18+ and npm/pnpm
- A WalletConnect Project ID (free from WalletConnect Cloud)
- An XRPL wallet (e.g., XUMM, Bifrost, or any WalletConnect-compatible wallet)

## 🔧 Setup Instructions

### 1. Get a WalletConnect Project ID

1. **Visit WalletConnect Cloud**: Go to [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. **Sign Up/Login**: Create an account or log in to your existing account
3. **Create a New Project**:
   - Click "Create New Project"
   - Give your project a name (e.g., "XRPL WalletConnect Demo")
   - Select "Web App" as the project type
   - Click "Create"
4. **Copy Your Project ID**: 
   - In your project dashboard, you'll see a Project ID (looks like: `1234567890abcdef1234567890abcdef`)
   - Copy this ID - you'll need it for the next step

### 2. Clone and Setup the Project

```bash
# Clone the repository
git clone <repository-url>
cd xrpl-walletconnect-angel

# Install dependencies
pnpm install

# Navigate to the Next.js example
cd example/nextjs
```

### 3. Configure Environment Variables

1. **Create Environment File**:
   ```bash
   cp .env.local.example .env.local
   ```

2. **Add Your Project ID**:
   ```bash
   # Edit .env.local and add your WalletConnect Project ID
   NEXT_PUBLIC_PROJECT_ID=your_project_id_here
   ```

   Example `.env.local`:
   ```env
   NEXT_PUBLIC_PROJECT_ID=1234567890abcdef1234567890abcdef
   ```

### 4. Start the Development Server

```bash
# From the example/nextjs directory
npm run dev
```

You should see:
```bash
> dev
> next dev

- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- info Loaded env from /path/to/.env.local
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🎯 How to Use

### 1. Connect Your Wallet

1. **Select Network**: Choose between Mainnet, Testnet, or Devnet using the toggles
2. **Click Connect**: Press the "Connect" button
3. **Copy URI**: The WalletConnect URI will appear on the page
4. **Open Your Wallet**: 
   - **XUMM**: Go to Settings → WalletConnect → Scan QR Code or paste URI
   - **Bifrost**: Go to Settings → WalletConnect → Scan QR Code or paste URI
   - **Other Wallets**: Look for WalletConnect option in settings
5. **Approve Connection**: In your wallet, approve the connection request

### 2. Sign and Submit Transactions

1. **Load Sample Transaction**: Click "Load Sample Transaction" to prefill with an AccountSet transaction
2. **Customize Transaction**: Modify the JSON transaction data as needed
3. **Sign Transaction**: Click "Sign Transaction" to send to your wallet for signing
4. **Approve in Wallet**: Approve the transaction in your wallet app
5. **Submit to XRPL**: Click "Submit to XRPL" to broadcast the signed transaction
6. **View Results**: Check the transaction results and status

### 3. Supported Transaction Types

The demo supports all XRPL transaction types. Common examples:

**AccountSet** (modify account properties):
```json
{
  "TransactionType": "AccountSet",
  "Account": "rYourAccountAddressHere"
}
```

**Payment** (send XRP):
```json
{
  "TransactionType": "Payment",
  "Account": "rYourAccountAddressHere",
  "Destination": "rDestinationAddressHere",
  "Amount": "1000000"
}
```

**TrustSet** (set trust lines):
```json
{
  "TransactionType": "TrustSet",
  "Account": "rYourAccountAddressHere",
  "LimitAmount": {
    "currency": "USD",
    "issuer": "rIssuerAddressHere",
    "value": "100"
  }
}
```

## 🔗 Network Endpoints

The application automatically connects to the appropriate XRPL server based on your network selection:

- **Mainnet**: `wss://xrplcluster.com`
- **Testnet**: `wss://s.altnet.rippletest.net:51233`
- **Devnet**: `wss://s.devnet.rippletest.net:51233`

## 🛠️ Project Structure

```
xrpl-walletconnect-angel/
├── packages/
│   ├── core/           # Core WalletConnect + XRPL integration
│   └── react/          # React hooks and context providers
├── example/
│   └── nextjs/         # Complete Next.js demo application
│       ├── src/app/page.tsx  # Main demo component
│       ├── .env.local        # Environment configuration
│       └── package.json      # Dependencies
└── README.md
```

## 📚 Key Components

### Main Demo Component (`example/nextjs/src/app/page.tsx`)

- **WalletConnect Integration**: Uses `useWalletConnectClient` hook
- **Multi-Network Support**: Dynamic network selection and server connection
- **Transaction Workflow**: Two-step sign → submit process
- **Error Handling**: Comprehensive error states and user feedback
- **Educational Comments**: Detailed explanations of each step

### Core Features

- **Dynamic Account Detection**: Automatically extracts account address from WalletConnect response
- **Transaction Status Tracking**: Real-time updates on signing and submission progress
- **Network Persistence**: Remembers your network selection across connections
- **Clean UI**: Modern interface with proper loading states and feedback

## 🔍 Troubleshooting

### Common Issues

1. **"WalletConnect is not initialized"**
   - Ensure your `.env.local` file has the correct `NEXT_PUBLIC_PROJECT_ID`
   - Restart the development server after changing environment variables

2. **"No transaction blob found"**
   - Check that your wallet supports the transaction type you're trying to sign
   - Ensure the transaction JSON is valid

3. **Connection fails**
   - Verify your WalletConnect Project ID is correct
   - Check that your wallet supports WalletConnect v2
   - Try switching networks (Testnet is recommended for testing)

4. **Transaction submission fails**
   - Ensure you have sufficient XRP for fees
   - Check that the account has the required sequence number
   - Verify the transaction is properly formatted

### Development Warnings

You may see warnings about missing optional dependencies:
```
Module not found: Can't resolve 'bufferutil'
Module not found: Can't resolve 'utf-8-validate'
```

These are optional performance optimizations and don't affect functionality. The app will work fine without them.

## 🧪 Testing

### Recommended Testing Flow

1. **Start with Testnet**: Use Testnet for all testing to avoid real XRP costs
2. **Test Connection**: Verify wallet connection works with your chosen wallet
3. **Test Simple Transaction**: Try the AccountSet transaction first (no XRP cost)
4. **Test Payment**: Try a small payment transaction (requires test XRP)
5. **Test Error Cases**: Try invalid transactions to see error handling

### Getting Test XRP

For Testnet testing, you can get free test XRP from:
- [XRPL Testnet Faucet](https://xrpl.org/xrp-testnet-faucet.html)
- [XRPL Labs Testnet](https://xrpl.ws/testnet-faucet)

## 📖 Documentation

- **WalletConnect v2**: [docs.walletconnect.com](https://docs.walletconnect.com/2.0/)
- **XRPL Documentation**: [xrpl.org/docs](https://xrpl.org/docs/)
- **XRPL Transaction Types**: [xrpl.org/docs/references/protocol/transactions/](https://xrpl.org/docs/references/protocol/transactions/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [WalletConnect](https://walletconnect.com/) for the connection protocol
- [XRPL Foundation](https://xrpl.org/) for the XRP Ledger
- [XUMM](https://xumm.app/) and [Bifrost](https://bifrostwallet.com/) for wallet implementations
