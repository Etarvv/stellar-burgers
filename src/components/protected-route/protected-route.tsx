import { FC, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from '../../services/store';
import { Preloader } from '@ui';

interface IProtectedRouteProps {
  children: ReactNode;
  onlyUnAuth?: boolean;
}

export const ProtectedRoute: FC<IProtectedRouteProps> = ({
  children,
  onlyUnAuth = false
}) => {
  const { isAuthenticated, loading } = useSelector((state) => state.user);
  const location = useLocation();

  if (loading) {
    return <Preloader />;
  }

  if (onlyUnAuth && isAuthenticated) {
    // Если пользователь авторизован, но маршрут только для неавторизованных
    const from = location.state?.from || '/';
    return <Navigate to={from} replace />;
  }

  if (!onlyUnAuth && !isAuthenticated) {
    // Если маршрут защищён, а пользователь не авторизован
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
