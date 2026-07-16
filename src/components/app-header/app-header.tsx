import React, { FC } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  BurgerIcon,
  ListIcon,
  Logo,
  ProfileIcon
} from '@zlden/react-developer-burger-ui-components';
import styles from '../ui/app-header/app-header.module.css';
import { useSelector } from '../../services/store';

export const AppHeader: FC = () => {
  const { user } = useSelector((state) => state.user);
  const userName = user?.name || '';
  const location = useLocation();

  const isConstructor = location.pathname === '/';
  const isFeed = location.pathname.startsWith('/feed');
  const isProfile = location.pathname.startsWith('/profile');

  return (
    <header className={styles.header}>
      <nav className={`${styles.menu} p-4`}>
        <div className={styles.menu_part_left}>
          <NavLink
            to='/'
            className={({ isActive }) =>
              `text text_type_main-default ml-2 mr-10 ${styles.link} ${
                isActive ? styles.link_active : ''
              }`
            }
          >
            <BurgerIcon type={isConstructor ? 'primary' : 'secondary'} />
            <p className='text text_type_main-default ml-2'>Конструктор</p>
          </NavLink>
          <NavLink
            to='/feed'
            className={({ isActive }) =>
              `text text_type_main-default ml-2 ${styles.link} ${
                isActive ? styles.link_active : ''
              }`
            }
          >
            <ListIcon type={isFeed ? 'primary' : 'secondary'} />
            <p className='text text_type_main-default ml-2'>Лента заказов</p>
          </NavLink>
        </div>
        <Link to='/' className={styles.logo}>
          <Logo className='' />
        </Link>
        <div className={styles.link_position_last}>
          <NavLink
            to='/profile'
            className={({ isActive }) =>
              `text text_type_main-default ml-2 ${styles.link} ${
                isActive ? styles.link_active : ''
              }`
            }
          >
            <ProfileIcon type={isProfile ? 'primary' : 'secondary'} />
            <p className='text text_type_main-default ml-2'>
              {userName || 'Личный кабинет'}
            </p>
          </NavLink>
        </div>
      </nav>
    </header>
  );
};
