import { ProviderConstructor } from '../providers/base';
import { SubsetOptions } from './SubsetOptions';
import { MakeFontResult } from '../process/types/MakeFontResult';

export type SubsetIconfont = (
  providerInstances: ProviderConstructor[],
  outputDir: string,
  options?: SubsetOptions
) => Promise<MakeFontResult>;
