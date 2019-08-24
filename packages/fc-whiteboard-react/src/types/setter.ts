import { VCJsonSchema, VCUiSchema } from './schema';

/** 设置 UiSchema 中所有元素的某个属性 */
export function setUiSchemaFieldsProperty(
  { jsonSchema, uiSchema }: { jsonSchema: VCJsonSchema; uiSchema: VCUiSchema },
  { fieldProperty, value }: { fieldProperty: string; value: boolean | number | string }
) {
  // 因为某个域不需要 uiSchema，因此要用 jsonSchema 来遍历
  const properties = jsonSchema.properties || {};

  const propertyNames = Object.keys(properties) || [];

  propertyNames.forEach(propertyName => {
    const property = properties[propertyName] as VCJsonSchema;
    let propertyUiSchema: VCUiSchema | VCUiSchema[];

    // 根据是否为数组进行提取
    if (property.type === 'array') {
      propertyUiSchema = uiSchema[propertyName].items!;
    } else {
      propertyUiSchema = uiSchema[propertyName];
    }

    if (typeof propertyUiSchema !== 'undefined') {
      propertyUiSchema[fieldProperty] = value;
    } else {
      propertyUiSchema = { [fieldProperty]: value };
    }

    // 使用新值复写到老的数值中
    if (property.type === 'array') {
      uiSchema[propertyName].items = propertyUiSchema;
    } else {
      uiSchema[propertyName] = propertyUiSchema;
    }
  });
}
