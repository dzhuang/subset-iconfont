import { SubsetProvider } from "../providers/base";
import { SubsetOptions } from "./SubsetOptions";
import { MakeFontResult } from "../process/types/MakeFontResult";

export type SubsetIconfont = (
  providerInstances: SubsetProvider[],
  outputDir: string,
  options?: SubsetOptions
) => Promise<MakeFontResult>;
