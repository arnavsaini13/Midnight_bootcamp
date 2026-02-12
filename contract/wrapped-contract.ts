import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { Contract as CompiledContractClass } from './build_working/contract/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create the wrapped contract using CompiledContract.make()
const WrappedContract = CompiledContract.make(
  'PrivateDAOTreasury',
  CompiledContractClass
);

// Add compiled assets path
const zkConfigPath = path.join(__dirname, 'build_working', 'contract');
const ContractWithAssets = WrappedContract.pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets(zkConfigPath)
);

export const contract = ContractWithAssets;
export { CompiledContractClass as ContractClass };
