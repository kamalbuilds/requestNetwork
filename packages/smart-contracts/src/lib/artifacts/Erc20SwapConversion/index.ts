import { ContractArtifact } from '../../ContractArtifact';

import { abi as ABI_0_1_0 } from './0.1.0.json';
// @ts-ignore Cannot find module
import type { ERC20SwapToConversion } from '../../../types/ERC20SwapToConversion';

export const erc20SwapConversionArtifact = new ContractArtifact<ERC20SwapToConversion>(
  {
    '0.1.0': {
      abi: ABI_0_1_0,
      deployment: {
        private: {
          address: '0xd54b47F8e6A1b97F3A84f63c867286272b273b7C',
          creationBlockNumber: 0,
        },
        rinkeby: {
          address: '0x1d6B06C6f7adFd9314BD4C58a6D306261113a1D4',
          creationBlockNumber: 9447192,
        },
        bsctest: {
          address: '0x1d6B06C6f7adFd9314BD4C58a6D306261113a1D4',
          creationBlockNumber: 12759710,
        },
        fantom: {
          address: '0x1d6B06C6f7adFd9314BD4C58a6D306261113a1D4',
          creationBlockNumber: 20066424,
        },
        matic: {
          address: '0x1d6B06C6f7adFd9314BD4C58a6D306261113a1D4',
          creationBlockNumber: 20670431,
        },
        celo: {
          address: '0x1d6B06C6f7adFd9314BD4C58a6D306261113a1D4',
          creationBlockNumber: 10141036,
        },
        mainnet: {
          address: '0x1d6B06C6f7adFd9314BD4C58a6D306261113a1D4',
          creationBlockNumber: 13764156,
        },
        'arbitrum-one': {
          address: '0x1d6B06C6f7adFd9314BD4C58a6D306261113a1D4',
          creationBlockNumber: 5317947,
        },
        avalanche: {
          address: '0x1d6B06C6f7adFd9314BD4C58a6D306261113a1D4',
          creationBlockNumber: 11671649,
        },
      },
    },
  },
  '0.1.0',
);
