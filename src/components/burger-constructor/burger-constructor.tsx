import { FC, useMemo, useEffect } from 'react';
import { TOrder } from '@utils-types';
import { BurgerConstructorUI } from '@ui';
import { useDispatch, useSelector } from '../../services/store';
import { clearConstructor } from '../../services/slices/constructorSlice';
import { createOrder, clearOrder } from '../../services/slices/orderSlice';
import { fetchFeeds } from '../../services/slices/feedSlice';
import { useNavigate } from 'react-router-dom';

export const BurgerConstructor: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bun, ingredients } = useSelector((state) => state.burgerConstructor);
  const { orderNumber, loading: orderRequest } = useSelector(
    (state) => state.order
  );
  const { isAuthenticated } = useSelector((state) => state.user);

  const constructorItems = useMemo(
    () => ({ bun, ingredients }),
    [bun, ingredients]
  );

  const orderModalData = orderNumber
    ? ({ number: orderNumber } as TOrder)
    : null;

  const onOrderClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/' } });
      return;
    }
    if (!bun || ingredients.length === 0) return;
    const ingredientIds = [bun._id, ...ingredients.map((i) => i._id), bun._id];
    dispatch(createOrder(ingredientIds));
  };

  // Очищаем конструктор и обновляем ленту только после успешного создания заказа
  useEffect(() => {
    if (orderNumber) {
      dispatch(clearConstructor());
      dispatch(fetchFeeds());
    }
  }, [orderNumber, dispatch]);

  const closeOrderModal = () => {
    dispatch(clearOrder()); // только закрываем модалку, конструктор остаётся
  };

  const price = useMemo(() => {
    const bunPrice = bun ? bun.price * 2 : 0;
    const ingredientsPrice = ingredients.reduce(
      (sum, item) => sum + item.price,
      0
    );
    return bunPrice + ingredientsPrice;
  }, [bun, ingredients]);

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};