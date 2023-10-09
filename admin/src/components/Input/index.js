import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { ComboboxOption, CreatableCombobox } from '@strapi/design-system';
import { useCMEditViewDataManager } from '@strapi/helper-plugin';

import useEnumerationData from '../../hooks/use-enumeration-data'
import useFieldIdentifier from '../../hooks/use-field-identifier';

const Input = ({ 
  attribute, 
  error, 
  intlLabel, 
  type, 
  name, 
  onChange, 
  value, 
  contentTypeUID 
}, ref) => {
  const { allLayoutData, modifiedData } = useCMEditViewDataManager();
  const { formatMessage } = useIntl();

  const currentField = useFieldIdentifier({
    contentType: allLayoutData.contentType, 
    currentData: modifiedData, 
    apiUid: contentTypeUID, 
    name, 
    options: attribute.options,
  })
  const { values, addValue } = useEnumerationData(currentField)

  const errorMessage = error ? formatMessage({ id: error, defaultMessage: error }) : '';
  const label = formatMessage(intlLabel);

  const handleChange = (value) => {
    onChange({ target: { name, value, type } });
  };

  const handleCreateOption = (value) => {
    handleChange(value);
    addValue(value)
  };

  useEffect(() => {
    const element = document.getElementById(name)
    if (element) {
      element.autocomplete = 'off'
    }
  }, [])
  
  return (
    <CreatableCombobox
      error={errorMessage}
      label={label}
      id={name}
      name={name}
      onChange={handleChange}
      onCreateOption={handleCreateOption}
      value={value}
    >
      {values.map((value) => (
        <ComboboxOption key={value} value={value}>
          {value}
        </ComboboxOption>
      ))}
    </CreatableCombobox>
  );
}


export default React.forwardRef(Input);