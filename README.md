
### What is Zona?
Zona is a scalable infrastructure for composable RWA tokens designed for users to speculate on real estate prices. Users stake ETH or stablecoins like USDC, RLUSD as collateral to mint real estate tokens, such as Dubai Token. These tokens will be pegged to the median price per sq.ft. of real estate for major cities using a peg stability module. Investors can then speculate on these tokens by going long or short through our lending arm.

### Features
- **Proprietary Real Estate Indexes:** All real estate transactions are scraped and transformed into an index that tracks the median price per square feet of real estate for a city.
- **Real Estate Trading:** We allow users to long or short real estate prices of different cities around the world
- **Aptos Connect:** We allow users to connect directly with their Gmail account seamlessly with Aptos Connect

## Usage
- Make sure you create a `.env` file with the following content in the root directory of the frontend
```
NEXT_PUBLIC_API_BASE_URL='https://api.zona.finance'
NEXT_PUBLIC_PROJECTID=66299b59c166752d10a4fd338dc1c11c
```
- You may directly run the frontend with the below commands
```
npm install
npm run dev
```
- Enjoy!

# Contracts
- We embarked on an ambitious challenge to completely re-write our contracts from Solidity to Aptos Move over the course of 24 hours. You may find the Move contracts in the `backend` folder
- You may check out our currently deployed instance [here](https://explorer.aptoslabs.com/account/0xd157a46accb1dd16122980064f2bfb90046ea134a26354ab5d1d7729a26b5855?network=devnet) (`https://explorer.aptoslabs.com/account/0xd157a46accb1dd16122980064f2bfb90046ea134a26354ab5d1d7729a26b5855?network=devnet`)

### Demo
- [30s Demo](https://www.youtube.com/watch?v=GizKsFlJxIk)
- [Detailed Demo](https://www.youtube.com/watch?v=ChY4ZfY_8po)

### Images
<img width="1512" alt="img1" src="https://github.com/zona-hk/ripple-zona/blob/main/readme_assets/Screenshot%202025-02-19%20at%206.12.57%E2%80%AFPM.png?raw=true">
<img width="1512" alt="img2" src="https://github.com/zona-hk/ripple-zona/blob/main/readme_assets/Screenshot%202025-02-19%20at%206.14.01%E2%80%AFPM.png?raw=true">
<img width="1512" alt="img3" src="https://github.com/zona-hk/ripple-zona/blob/main/readme_assets/Screenshot%202025-02-19%20at%206.14.41%E2%80%AFPM.png?raw=true">
<img width="1512" alt="img7" src="https://github.com/zona-hk/ripple-zona/blob/main/readme_assets/Screenshot%202025-02-20%20000722.png?raw=true">
<img width="1512" alt="img4" src="https://github.com/zona-hk/ripple-zona/blob/main/readme_assets/Screenshot%202025-02-20%20000606.png?raw=true">
<img width="1512" alt="img5" src="https://github.com/zona-hk/ripple-zona/blob/main/readme_assets/Screenshot%202025-02-20%20000542.png?raw=true">
<img width="1512" alt="img6" src="https://github.com/zona-hk/ripple-zona/blob/main/readme_assets/Screenshot%202025-02-20%20000654.png?raw=true">
