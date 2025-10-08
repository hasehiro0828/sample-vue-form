export const satisfiesErrorDisplayCondition = (submitCount: number, meta: { touched: boolean; dirty: boolean }) => {
  return submitCount > 0 || (meta.touched && meta.dirty);
};
