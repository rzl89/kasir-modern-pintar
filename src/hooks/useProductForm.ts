
import { useParams } from 'react-router-dom';
import { useProductFormState } from './product/useProductFormState';
import { useProductData } from './product/useProductData';
import { useProductSubmit } from './product/useProductSubmit';

export { type ProductFormData } from './product/useProductFormState';

export const useProductForm = () => {
  const { productId } = useParams();
  const form = useProductFormState();
  const { loading: loadingData, loadProductData } = useProductData(form);
  const { loading: submitting, submitProduct } = useProductSubmit();

  const onSubmit = form.handleSubmit((data) => submitProduct(data, productId));

  return {
    form,
    loading: loadingData || submitting,
    productId,
    loadProductData,
    onSubmit,
  };
};
