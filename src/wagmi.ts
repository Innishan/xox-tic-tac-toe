import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { frameConnector } from "./frameConnector";
import { Attribution } from "ox/erc8021";

const projectId = import.meta.env.VITE_WC_PROJECT_ID as string;

/* Base Builder Code */
const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: ["bc_pjofj71m"],
});

export const wagmiConfig = createConfig({
  chains: [base],

  connectors: [
    frameConnector(), // Farcaster miniapp wallet

    walletConnect({
      projectId,
      showQrModal: false, // Web3Modal handles UI
    }),

    injected(), // MetaMask / Rabby
  ],

  transports: {
    [base.id]: http(),
  },

  /* Builder Code Attribution */
  dataSuffix: DATA_SUFFIX,
});
