import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { frameConnector } from "./frameConnector";

export const config = createConfig({
  chains: [base],
  connectors: [
    frameConnector(), // Farcaster in-app wallet (mobile)
    injected(),       // MetaMask/Rabby/etc (normal browsers)
  ],
  transports: {
    [base.id]: http(),
  },
});
