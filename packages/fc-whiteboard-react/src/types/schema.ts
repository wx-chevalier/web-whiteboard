import { JSONSchema6 } from 'json-schema';
import { UiSchema } from 'react-jsonschema-form';

/** 自定义的 JsonSchema */
export interface VCJsonSchema extends JSONSchema6 {}

export interface VCUiSchema extends UiSchema {
  'ui:disabled'?: boolean;
  'ui:readonly'?: boolean;
  'ui:hidden'?: boolean;

  // 传入的样式类名
  classNames?: string[];
  items?: VCUiSchema[];
}

export interface VCSchema {
  formCode?: string;
  jsonSchema: VCJsonSchema;
  uiSchame: UiSchema;
}
