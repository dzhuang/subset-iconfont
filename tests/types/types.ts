import { SubsetItem } from '../../src/types/SubsetItem';
import { ProviderOptions } from '../../src/types/ProviderOptions';
import { SubsetOptions } from '../../src/types/SubsetOptions';

export type PartValues = string[];

export type StatusName = 'exist' | 'nonExist';

export type FileStatus = Partial<Record<StatusName, PartValues>>;

export type PartName = 'names' | 'extensions';

export type FilePart = Record<PartName, FileStatus>;

export type CombineModeFileCheck = {
  //combine model
  cssFileNames?: FilePart[];
  fontFiles?: FilePart[];
  fontLicenseFiles?: { [key: string]: boolean };
  packageCssFiles?: { [key: string]: FilePart[] };
  packageFontFiles?: { [key: string]: FilePart[] };
  packageMetadataFiles?: { [key: string]: boolean };
  packageLicenseFiles?: { [key: string]: boolean };
  packageWebPageFile?: { [key: string]: boolean };
  metaDataExist?: boolean;
  webPageFileExist?: boolean;
};

export type ProviderFileCheck = {
  providerSubPath: string;
  providerCssFiles?: FilePart[];
  providerFontFiles?: FilePart[];
  metaDataExist?: boolean;
  webPageFileExist?: boolean;
  licenseFilesExist?: boolean;
};

export type CombineHelperParams = {
  subset: any;
  options?: SubsetOptions;
};

export type ProviderHelperParams = {
  subset: SubsetItem[];
  options?: ProviderOptions;
};
