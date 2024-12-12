# Userop Simulator

This tool is built to help debug userops! 

Built in a day during our 2024 Hackathon using OnchainKit + Viem!

Shout out to Tenderly for making great simulation software! 
<br />

## Setup

To ensure all components work seamlessly, set the following environment variables in your `.env` file using `.env.local.example` as a reference.

You can find the API key on the [Coinbase Developer Portal's OnchainKit page](https://portal.cdp.coinbase.com/products/onchainkit). If you don't have an account, you will need to create one. 

You can find your Wallet Connector project ID at [Wallet Connect](https://cloud.walletconnect.com).

```sh
# See https://portal.cdp.coinbase.com/products/onchainkit
NEXT_PUBLIC_CDP_API_KEY="GET_FROM_COINBASE_DEVELOPER_PLATFORM"

# See https://cloud.walletconnect.com
NEXT_PUBLIC_WC_PROJECT_ID="GET_FROM_WALLET_CONNECT"
```
<br />

## Locally run

```sh
# Install bun in case you don't have it
curl -fsSL https://bun.sh/install | bash

# Install packages
bun i

# Run Next app
bun run dev
```
<br />

## Resources
- [Coinbase Developer Platform](https://cdp.coinbase.com)
- [Tenderly ](https://tenderly.co/)
- [OnchainKit documentation](https://onchainkit.xyz)

<br />

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
