import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { frameConnector } from "./frameConnector";

const projectId = import.meta.env.VITE_WC_PROJECT_ID as string;

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    frameConnector(), // Farcaster miniapp wallet
    walletConnect({
      projectId,
      showQrModal: false, // IMPORTANT: Web3Modal handles UI
    }),
    injected(), // MetaMask/Rabby/etc
  ],
  transports: {
    [base.id]: http(),
  },
});
