export declare type Style =
  | "thin"
  | "light"
  | "regular"
  | "solid"
  | "brands"
  | "normal"
  | "outline"
  | "filled"
  | "outlined"
  | "round"
  | "sharp"
  | "two-tone";
export declare type Styles = Array<Style>;
export type SVGData = string | undefined;
export declare type SVGDataObj = {
  style: Style;
  svgData: SVGData;
};
export declare type MetaData = {
  unicode?: string;
  svgDataObjects: SVGDataObj[];
  styles?: Styles;
  packageInfo?: string;
  originalName?: string;
  metaFromPackage?: { [key: string]: any };
};
export declare type MetaDataset = Record<string, MetaData>;
