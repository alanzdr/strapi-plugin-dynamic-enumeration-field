import { useQueryParams } from '@strapi/helper-plugin';
import { useMemo } from 'react';

function useLocale () {
  const [{ query }] = useQueryParams();
  const locale = useMemo(() => 
    query?.plugins?.i18n?.locale || null, 
    [query]
  )
  return locale;
}

export default useLocale;