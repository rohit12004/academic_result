# Academic Storage - Frontend Documentation

This document provides an overview of the frontend architecture, routes, and technical implementation for the **Academic Storage** blockchain project.

## 🏗️ Technical Architecture
The frontend is built with **Next.js 15+ (App Router)** and uses **JavaScript** for logic and **Tailwind CSS** for premium styling.

### Core Technologies
- **Ethers.js (v5.7.2)**: Handles communication with the Ethereum blockchain via MetaMask.
- **Framer Motion**: Enables smooth micro-animations and page transitions.
- **Lucide React**: Provides the icon set.
- **Context API (`Web3Context`)**: Manages the global state for wallet connection, account switching, and network detection.

---

## 🛣️ Application Routes

| Route | Name | Description | Access |
| :--- | :--- | :--- | :--- |
| `/` | **Home** | The landing page featuring the value proposition, hero section, and quick links. | Public |
| `/verify` | **Verify** | A tool where users input result data to check its authenticity. It regenerates the hash and compares it with the blockchain. | Public |
| `/records` | **Browse Records** | Allows users to search for any roll number to fetch the student's name, department, and all semester results. | Public |
| `/admin` | **Admin Dashboard** | A secure portal for authorized administrators to register students and publish new results. | Admin Only |

---

## 🔐 Key Components & Hooks

### `Web3Context.js`
The heart of the blockchain integration. It exposes:
- `account`: Current connected wallet address.
- `connectWallet()`: Prompts MetaMask to connect.
- `switchToSepolia()`: Automatically prompts the user to switch their network to the Sepolia Testnet.

### `useContract.js`
A custom hook that returns an instance of the `StudentRecord` or `ResultVerification` contract, pre-configured with the current user's signer.

### `Navbar.js`
Handles navigation and displays the current connection status. It includes a "Short Address" display for connected users.

---

## 🌐 Blockchain Integration (Sepolia)
The application is pre-configured for the **Sepolia Testnet**. 
- **ABIs**: Located in `lib/contracts/`.
- **Environment Variables**: Managed via `.env.local` for easy deployment updates.
- **Hash Matching**: The `/verify` logic mirrors the Solidity `keccak256(abi.encodePacked(...))` logic to ensure 100% accurate validation.

---

## 🎨 Design System
- **Theme**: Dark Mode (`#0a0a0c`).
- **Cards**: Glassmorphism effect (`glass-card` utility).
- **Typography**: `Outfit` (Headings) and `Inter` (Body).
- **Animations**: Floating hero elements and slide-in form transitions.
