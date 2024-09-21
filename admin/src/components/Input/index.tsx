import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import { ComboboxOption, Combobox, Field } from "@strapi/design-system";
import {
  unstable_useContentManagerContext as useContentManagerContext,
  FieldValue,
  InputProps,
} from "@strapi/strapi/admin";

import useEnumerationData from "../../hooks/use-enumeration-data";
import useFieldIdentifier from "../../hooks/use-field-identifier";

type Props = FieldValue &
  InputProps & {
    attribute: {
      options: any;
    };
  };

const Input = React.forwardRef<any, Props>(
  (
    {
      disabled,
      hint,
      label,
      name,
      placeholder,
      required,
      attribute,
      value,
      error,
      onChange,
    },
    ref
  ) => {
    const { contentType, model, form } = useContentManagerContext();

    const { formatMessage } = useIntl();

    const currentField = useFieldIdentifier({
      contentType,
      currentData: form.values,
      apiUid: model,
      name,
      options: attribute.options,
    });
    const { values, addValue } = useEnumerationData(currentField);

    const errorMessage = error
      ? formatMessage({ id: error, defaultMessage: error })
      : "";

    const handleChange = (value: any) => {
      onChange(name, value);
    };

    const handleCreateOption = (value: any) => {
      onChange(name, value);
      addValue(value);
    };

    useEffect(() => {
      const element = document.getElementById(name) as HTMLInputElement;
      if (element) {
        element.autocomplete = "off";
      }
    }, []);

    return (
      <Field.Root
        error={errorMessage}
        hint={hint}
        name={name}
        required={required}
      >
        <Field.Label>{label}</Field.Label>
        <Combobox
          id={name}
          name={name}
          onChange={handleChange}
          onCreateOption={handleCreateOption}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          creatable
        >
          {values.map((value: string) => (
            <ComboboxOption key={value} value={value}>
              {value}
            </ComboboxOption>
          ))}
        </Combobox>
        <Field.Error />
        <Field.Hint />
      </Field.Root>
    );
  }
);

export default Input;
