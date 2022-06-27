import { SubsetProvider } from "../providers/base";
import { SubsetOptions } from "./SubsetOptions";
import { MakeFontResult } from "../process/types/MakeFontResult";

export type IconfontSubset = (
  providerObjects: SubsetProvider[],
  outputDir: string,
  options?: SubsetOptions
) => Promise<MakeFontResult>;
