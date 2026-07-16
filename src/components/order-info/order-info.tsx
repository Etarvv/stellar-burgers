import { FC, useEffect } from 'react';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { useDispatch, useSelector } from '../../services/store';
import {
  fetchOrderByNumber,
  clearOrderInfo
} from '../../services/slices/orderInfoSlice';
import { useParams } from 'react-router-dom';

export const OrderInfo: FC = () => {
  const { number } = useParams<{ number: string }>();
  const dispatch = useDispatch();
  const { order, loading } = useSelector((state) => state.orderInfo);
  const { items: ingredients } = useSelector((state) => state.ingredients);

  useEffect(() => {
    if (number) {
      dispatch(fetchOrderByNumber(Number(number)));
    }
    return () => {
      dispatch(clearOrderInfo());
    };
  }, [dispatch, number]);

  if (loading || !order) {
    return <Preloader />;
  }

  const orderInfo = {
    ...order,
    ingredientsInfo: order.ingredients.reduce((acc: any, itemId: string) => {
      const ingredient = ingredients.find((ing) => ing._id === itemId);
      if (!ingredient) return acc;
      if (!acc[itemId]) {
        acc[itemId] = { ...ingredient, count: 1 };
      } else {
        acc[itemId].count++;
      }
      return acc;
    }, {}),
    date: new Date(order.createdAt),
    total: order.ingredients.reduce((sum, itemId) => {
      const ing = ingredients.find((i) => i._id === itemId);
      return sum + (ing ? ing.price : 0);
    }, 0)
  };

  return <OrderInfoUI orderInfo={orderInfo} />;
};
