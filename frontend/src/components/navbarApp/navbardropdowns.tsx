import React, { useState } from 'react';
import TradeDropdown from './tradedropdown';
import styles from './Navbar.module.css';
import { useRouter } from 'next/router';

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

const NavbarDropdowns = () => {
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const router = useRouter();

  const isActive = (href: string) => {
    return router.pathname === href || router.pathname.startsWith(`${href}/`);
  };

  return (
    <TradeDropdown
      isOpen={isTradeOpen}
      onToggle={() => setIsTradeOpen(!isTradeOpen)}
      onClose={() => setIsTradeOpen(false)}
      className={classNames(
        styles.navItem,
        isActive('/trade') ? styles.active : '',
      )}
    />
  );
};

export default NavbarDropdowns;