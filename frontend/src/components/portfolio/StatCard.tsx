import React from 'react';
import Link from 'next/link';

interface StatCardProps {
  title: string;
  value: string;
  buttonText: string;
  valueColor: string;
  href: string;
  hoverEffect?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, buttonText, valueColor, href, hoverEffect }) => {
  return (
    <div className={`bg-[#0F1216] border border-[#222226] rounded-lg p-4 md:p-5 flex justify-between items-center ${hoverEffect} group`}>
      <div>
        <h3 className="text-[#AFAFAF] text-lg md:text-xl mb-1">{title}</h3>
        <span className={`${valueColor} text-xl md:text-3xl font-bold`}>{value}</span>
      </div>
      <Link href={href} passHref>
        <button className="bg-[#0F1216] text-white px-3 md:px-4 py-1 md:py-2 rounded text-sm md:text-xl transition-all duration-300 group-hover:bg-[#1A1D21] group">
          <span className="hover:font-bold transition-all duration-300">
            {buttonText}
          </span>
          <span className="ml-1">↗</span>
        </button>
      </Link>
    </div>
  );
};

export default StatCard;