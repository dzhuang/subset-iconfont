import { MetaDataset } from "./Metadata";
import { MakeFontResult } from "../process/types/MakeFontResult";

export declare interface ProviderInterface {
  subsetMeta: MetaDataset;
  renameIcon: string | unknown;
  makeFonts: Promise<MakeFontResult> | unknown;
}
