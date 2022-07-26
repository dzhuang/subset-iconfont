import { Style } from '../types/Metadata';
import { WriteOutFiles } from '../process/types/RenderContext';
import { Formats } from '../process/types/SubsetFunc';
import { CssChoice } from '../process/types/CssChoices';

export const DEFAULT_COMBINE_FILE_NAME = 'subset-iconfont';
export const DEFAULT_COMBINE_FONT_NAME = 'Subset Iconfont';
export const DEFAULT_COMBINE_PREFIX = 'si';

export const PACKAGES_OUTPUT_DIR = 'packages';
export const WEBFONTS_DIR_NAME = 'webfonts';
export const LICENSE_FILE_NAME = 'LICENSE';
export const CSS_FOLDER_NAME = 'css';
export const SCSS_FOLDER_NAME = 'scss';
export const COMBINED_CSS_NAME = 'all';
export const COMBINED_FONT_LICENSE_FOLDER = 'font_licenses';
export const FONT_WEB_PAGE_FILE_NAME = 'index.html';

export const MDI_FONT_PACKAGE_NAME = '@mdi/font';
export const MDI_SVG_PACKAGE_NAME = '@mdi/svg';
export const MDI_DEFAULT_CSS_PREFIX = 'mdi';
export const MDI_DEFAULT_FONT_NAME = 'Material Design Icons';
export const MDI_DEFAULT_FONT_FILE_NAME = 'material-design-icons';

export const MI_FONT_PACKAGE_NAME = 'material-icons';
export const MI_SVG_PACKAGE_NAME = '@material-design-icons/svg';
export const MI_DEFAULT_CSS_PREFIX = 'mi';
export const MI_DEFAULT_FONT_NAME = 'Material Icons';
export const MI_DEFAULT_FONT_FILE_NAME = 'material-icons';
export const MI_STYLES: Style[] = [
  'filled',
  'outlined',
  'round',
  'sharp',
  'two-tone',
];

export const FONT_AWESOME4_PACKAGE_NAME = 'font-awesome';
export const FONT_AWESOME4_DEFAULT_CSS_PREFIX = 'fa';
export const FONT_AWESOME4_DEFAULT_FONT_NAME = 'FontAwesome 4';
export const FONT_AWESOME4_DEFAULT_FONT_FILE_NAME = 'font-awesome-4';

export const FONT_AWESOME_FREE_PACKAGE_NAME = '@fortawesome/fontawesome-free';
export const FONT_AWESOME_FREE_DEFAULT_CSS_PREFIX = 'fa';
export const FONT_AWESOME_FREE_DEFAULT_FONT_NAME = 'FontAwesome Free';
export const FONT_AWESOME_FREE_DEFAULT_FONT_FILE_NAME = 'fontawesome-free';

export const BOOTSTRAP_ICON_PACKAGE_NAME = 'bootstrap-icons';
export const BOOTSTRAP_ICON_CSS_PREFIX = 'bi';
export const BOOTSTRAP_ICON_FONT_NAME = 'Bootstrap Icons';
export const BOOTSTRAP_ICONS_FONT_FILE_NAME = 'bootstrap-icons';

export const DEFAULT_LOGGER_LEVEL = 'warn';

export const DEFAULT_WRITE_OUT_FILES: WriteOutFiles = [
  'webfonts',
  'scss',
  'css',
  'metadata',
  'licenses',
  'web',
];
export const DEFAULT_OUTPUT_FORMATS: Formats = ['woff2', 'ttf'];
export const METADATA_FILE_NAME = 'metadata.json';
export const AVAILABLE_OUTPUT_FORMATS: Formats = [
  'eot',
  'woff',
  'woff2',
  'ttf',
];

export const DEFAULT_CSS_CHOICES: CssChoice[] = [
  'sizing',
  'fixed-width',
  'list',
  'bordered',
  'pulled',
  'animated',
  'rotated',
  'flipped',
  'stacked',
  'inverse',
  'screen-reader',
];

export const STYLE_FONT_WEIGHT_MAP: Record<Style, number | string> = {
  thin: 100,
  light: 300,
  regular: 400,
  solid: 900,
  brands: 400,
  normal: 400,
  filled: 400,
  outlined: 400,
  round: 400,
  sharp: 400,
  'two-tone': 400,
};

export const DEFAULT_STYLE: Style = 'normal';
