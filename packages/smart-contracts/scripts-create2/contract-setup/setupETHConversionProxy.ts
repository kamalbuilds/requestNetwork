import { CurrencyManager, EvmChains } from '@requestnetwork/currency';
import { RequestLogicTypes } from '@requestnetwork/types';
import { ethConversionArtifact } from '../../src/lib';
import { HardhatRuntimeEnvironmentExtended } from '../types';
import {
  getSignerAndGasFees,
  updateChainlinkConversionPath,
  updateNativeTokenHash,
  updatePaymentFeeProxyAddress,
} from './adminTasks';

/**
 * Updates the values of the chainlinkConversionPath and EthFeeProxy addresses if needed
 * @param contractAddress address of the ETHConversion contract
 *                        If not provided fallback to the latest deployment address
 * @param hre Hardhat runtime environment
 * @param signWithEoa Are transactions to be signed by an EAO
 */
export const setupETHConversionProxy = async ({
  contractAddress,
  hre,
  signWithEoa,
}: {
  contractAddress?: string;
  hre: HardhatRuntimeEnvironmentExtended;
  signWithEoa: boolean;
}): Promise<void> => {
  await Promise.all(
    hre.config.xdeploy.networks.map(async (network: string) => {
      try {
        EvmChains.assertChainSupported(network);
        if (!contractAddress) {
          contractAddress = ethConversionArtifact.getAddress(network);
        }
        const EthConversionProxyContract = new hre.ethers.Contract(
          contractAddress,
          ethConversionArtifact.getContractAbi(),
        );
        const { signer, txOverrides } = await getSignerAndGasFees(network, hre);
        const nativeTokenHash = CurrencyManager.getDefault().getNativeCurrency(
          RequestLogicTypes.CURRENCY.ETH,
          network,
        )?.hash;
        if (!nativeTokenHash) {
          throw new Error(`Could not guess native token hash for network ${network}`);
        }
        const EthConversionProxyConnected = EthConversionProxyContract.connect(signer);
        await updatePaymentFeeProxyAddress(
          EthConversionProxyConnected,
          network,
          txOverrides,
          'native',
          signer,
          signWithEoa,
        );
        await updateChainlinkConversionPath(
          EthConversionProxyConnected,
          network,
          txOverrides,
          signer,
          signWithEoa,
        );
        await updateNativeTokenHash(
          'EthConversionProxy',
          EthConversionProxyConnected,
          network,
          nativeTokenHash,
          txOverrides,
          signer,
          signWithEoa,
        );
        console.log(`Setup of EthConversionProxy successful on ${network}`);
      } catch (err) {
        console.warn(`An error occurred during the setup of EthConversionProxy on ${network}`);
        console.warn(err);
      }
    }),
  );
};
