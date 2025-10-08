export const shouldShowError = (
  submitCount: number,
  meta: { touched: boolean; dirty: boolean; valid: boolean },
  errorMessage: string | undefined
) => {
  return (submitCount > 0 || (meta.touched && meta.dirty)) && !!errorMessage;
};
