import { Address } from 'viem';
import { base, baseGoerli, optimism, mainnet } from 'viem/chains';

export const ENTRYPOINT_ADDRESS_V06 = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789' as Address;
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as Address;
export const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
export const OVERRIDE_BALANCE = "0xffffffffffffffffffffffff";


export function getChainId(chain: string): number {
    const chainMap = {
      'base': base.id,
      'base-goerli': baseGoerli.id,
      'optimism': optimism.id,
      'ethereum': mainnet.id,
    };
    return chainMap[chain as keyof typeof chainMap];
  }