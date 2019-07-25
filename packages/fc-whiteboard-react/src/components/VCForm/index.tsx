import cn from 'classnames';
import * as React from 'react';
import Form, { Widget, Field, IChangeEvent } from 'react-jsonschema-form';

import './index.less';
import { VCJsonSchema, VCUiSchema } from '../../types/schema';
import { compare } from 'lego-form-core/src/types/validator';
import { mergeFormDataWithDefault } from 'lego-form-core/src/types/getter';

export interface VCFormOptions {
  // 对齐位置
  alignType?: 'vertical' | 'inline';
  // 是否禁用
  disabled?: boolean;
  // 标签类型
  labelType?: 'vertical' | 'inline';
  // 标签位置
  labelAlign?: 'left' | 'right';
  // 是否只读
  readOnly?: boolean;
  // 是否不显示标签
  noLabel?: boolean;
}

export interface VCFormRef {
  [key: string]: () => void;
}

export interface VCFormProps extends VCFormOptions {
  className?: string;
  children?: JSX.Element;
  defaultSubmitComp?: JSX.Element;
  formContext?: object;
  formData?: object;
  fields?: { [name: string]: Field };
  jsonSchema: VCJsonSchema;
  ref?: ($ref: any) => void;
  popupContainer?: () => JSX.Element;
  uiSchema: VCUiSchema;
  widgets?: { [name: string]: Widget };

  onChange?: (formData: object) => void;
  onError?: () => void;
  onValidate?: (formData: object) => void;
  onSubmit?: (formData: object) => void;
}

export interface VCFormState {}

const defaultProps = {
  formContext: {},
  formData: {},
  widgets: {}
};

const prefix = 'lego-form';

export function VCForm({
  className,
  children,
  defaultSubmitComp,
  fields,
  formContext = defaultProps.formContext,
  formData = defaultProps.formData,
  jsonSchema,
  popupContainer,
  uiSchema,
  widgets = defaultProps.widgets,

  // Options
  alignType = 'inline',
  disabled = false,
  labelType = 'inline',
  labelAlign = 'left',
  readOnly = false,
  noLabel = false,

  onChange,
  onError,
  onSubmit
}: VCFormProps) {
  const [isDirty, setIsDirty] = React.useState(false);
  const [innerFormData, setInnerFormData] = React.useState(formData);

  const ref = React.useRef<{ focus: () => void }>();

  /** 响应输入数据变化 */
  const handleChange = (e: IChangeEvent<object>) => {
    if (!isDirty) {
      setIsDirty(isDirty);
    }

    const currentFormData = e.formData;
    let changedFieldName = '';

    Object.keys(currentFormData).forEach(fieldName => {
      if (!compare(currentFormData[fieldName], innerFormData[fieldName])) {
        changedFieldName = fieldName;
      }
    });

    if (!changedFieldName) {
      return;
    }

    // 执行表单校验，TODO

    // 重新设置数据
    setInnerFormData(currentFormData);

    // 触发外部变化
    if (onChange) {
      onChange(currentFormData);
    }
  };

  /** 响应提交操作 */
  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(mergeFormDataWithDefault(jsonSchema, innerFormData));
    }
  };

  React.useImperativeHandle(ref, () => ({
    focus: () => {}
  }));

  // 当外部 Props 状态变化后，更新数据
  React.useEffect(() => {
    if (formData) {
      setInnerFormData(formData);
    }
  }, [formData]);

  return (
    <section
      className={cn({
        [className || '']: className,
        [`${prefix}-container`]: true,

        [`${prefix}-disabled`]: disabled,
        [`${prefix}-read-only`]: readOnly,
        [`${prefix}-no-label`]: noLabel
      })}
    >
      <Form
        formContext={{ ...formContext, alignType, labelAlign, labelType, popupContainer }}
        formData={innerFormData}
        fields={fields}
        noValidate={true}
        schema={jsonSchema}
        showErrorList={false}
        uiSchema={uiSchema}
        widgets={widgets}
        onChange={handleChange}
        onSubmit={handleSubmit}
      >
        {children || defaultSubmitComp}
      </Form>
    </section>
  );
}

export default VCForm;
