/** 全局的获取规范 */

import { VCJsonSchema } from './../../dist/types/types/schema.d';

/** 将用户填入的表单数据与 JsonSchema 中的默认数据合并 */
export function mergeFormDataWithDefault(jsonSchema: VCJsonSchema, formData = {}) {
  // 因为某个域不需要 uiSchema，因此要用 jsonSchema 来遍历
  const properties = jsonSchema.properties || {};

  const propertyNames = Object.keys(properties) || [];

  const finalFormData = { ...formData };

  propertyNames.forEach(propertyName => {
    const property = properties[propertyName] as VCJsonSchema;

    // 根据是否为数组进行提取
    if (
      property.type !== 'array' &&
      !finalFormData[propertyName] &&
      typeof property.default !== 'undefined'
    ) {
      finalFormData[propertyName] = property.default;
    }
  });

  return finalFormData;
}
