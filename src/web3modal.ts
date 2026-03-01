// src/web3modal.ts
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { wagmiConfig } from './wagmi'
import { base } from 'wagmi/chains'

const projectId = import.meta.env.VITE_WC_PROJECT_ID as string

if (!projectId) {
  console.warn('⚠️ Missing VITE_WC_PROJECT_ID in .env')
}

createWeb3Modal({
  wagmiConfig,
  projectId,
  chains: [base],
  // optional nice defaults:
  enableAnalytics: true
})
