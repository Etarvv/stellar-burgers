import { FC } from 'react';
import { FeedInfoUI } from '../ui/feed-info';
import { useSelector } from '../../services/store';

export const FeedInfo: FC = () => {
  const { orders, total, totalToday } = useSelector((state) => state.feed);
  const readyOrders = orders
    .filter((o) => o.status === 'done')
    .map((o) => o.number)
    .slice(0, 20);
  const pendingOrders = orders
    .filter((o) => o.status === 'pending')
    .map((o) => o.number)
    .slice(0, 20);

  return (
    <FeedInfoUI
      readyOrders={readyOrders}
      pendingOrders={pendingOrders}
      feed={{ total, totalToday }}
    />
  );
};
