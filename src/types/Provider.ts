import { MetaDataset, Style } from './Metadata';
import { MakeFontResult } from '../process/types/MakeFontResult';

export type Style2FontFileMap = { [key in Style]?: string };

export declare interface ProviderInterface {
  subsetMeta: MetaDataset;
  renameIcon: string | unknown;
  makeFonts: Promise<MakeFontResult> | unknown;
}
