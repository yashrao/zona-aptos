import React, { useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './Navbar.module.css';

interface VaultsDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose?: () => void;
  className: string;
}

const VaultsDropdown: React.FC<VaultsDropdownProps> = ({ isOpen, onToggle, onClose, className }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleMouseEnter = useCallback(() => {
    onToggle();
  }, [onToggle]);

  const handleMouseLeave = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  const handleClick = useCallback(() => {
    router.push('/lp');
  }, [router]);

  const vaults = [
    { name: 'USDC', icon: '/images/logo/usdc.png', href: '/lp/usdc' },
    { name: 'USDT', icon: '/images/logo/usdt.png', href: '/lp/usdt' },
    { name: 'ZLP', icon: '/images/logo/zlp1.png', href: '/lp/zlp' }
  ];

  const generateRandomTVL = () => {
    return (Math.random() * 9 + 1).toFixed(1);
  };

  const isActive = router.pathname.startsWith('/lp');

  return (
    <div 
      className="relative"
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={`flex items-center rounded-lg px-3 py-2 text-[14px] transition-colors duration-200 ${className}`}
        onClick={handleClick}
      >
        <span>Vaults</span>
        <svg className="w-4 h-4 ml-1 fill-current transition-transform duration-200" viewBox="0 0 20 20" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </button>
      {isOpen && (
        <div 
          className="absolute left-0 w-[300px] rounded-[8px] shadow-lg bg-card-border ring-1 ring-card-border ring-opacity-5 transition-all duration-300 transform origin-top-left z-50 dust-animation"
          style={{
            top: 'calc(100% - 2px)',
          }}
        >
          <div className="p-2">
            <div className="w-full bg-card-bg rounded-[8px] p-2 transition-colors duration-200">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-2 py-2 text-left text-[14px] font-medium text-white tracking-wider">Vault</th>
                    <th className="px-2 py-2 text-right text-[14px] font-medium text-white tracking-wider">TVL</th>
                  </tr>
                </thead>
                <tbody>
                  {vaults.map((vault, index) => (
                    <tr key={index} className="transition-all duration-200 hover:bg-gradient-to-r hover:from-[#2f3039] hover:to-[#383945] rounded-lg group">
                      <td className="px-2 py-3 whitespace-nowrap rounded-l-lg">
                        <Link href={vault.href} className="flex items-center">
                          <img className="h-6 w-6 rounded-full mr-2" src={vault.icon} alt={vault.name} />
                          <div className="text-[14px] font-medium text-text-grey group-hover:text-white group-hover:font-bold transition-colors duration-200">{vault.name}</div>
                        </Link>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap text-[14px] text-right text-text-grey group-hover:text-white group-hover:font-bold rounded-r-lg transition-colors duration-200">
                        ${generateRandomTVL()}M
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaultsDropdown;