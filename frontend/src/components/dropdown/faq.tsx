import { useState, useRef, useEffect } from 'react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  const questions = [
    "What is Zona?",
    "What cities does Zona support?",
    "Can I trade districts within a city?",
    "How often will Zona's city indexes be updated?",
    "Why is trading real estate perpetuals better than buying fractional real estate?",
    "What are the fees for trading on Zona?"
  ];

  const answers = [
    "Zona is a perpetual exchange built on Plume that allows users to long or short the median price per square foot of major cities around the world, completely onchain.",
    "We currently support the trading of Hong Kong, Singapore, Dubai, and Taipei. We aim to support Tokyo, Seoul, Beijing, Shanghai, and Sydney in the near future, and will integrate additional markets based on user demand and data availability.",
    "Yes, supporting districts (or sub-markets) is on our roadmap. This would allow users to, for example, long Shibuya / short Adachi within Tokyo. Sub-markets will be integrated based on user demand.",
    "Zona indexes will be updated once an hour, but be temporarily halted during weekends.",
    "Perpetuals allow traders to access higher leverage and go both long or short. Additionally, fractional real estate requires a centralized party to seek out and purchase a piece of physical real estate. If that single flat/building/district performs poorly while the rest of the city performs well, users still lose money.",
    "Traders pay between 0.05% - 0.15% of the total notional position size as a trading fee whenever a position is opened, closed, or liquidated. The fee changes depending whether the trader is adding to or minimizing open interest skew. 70% of all fees are accrued by Zona Liquidity Providers."
  ];

  useEffect(() => {
    contentRefs.current = contentRefs.current.slice(0, questions.length);
  }, [questions]);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mx-auto w-full max-w-7xl my-[100px] px-4">
      <h2 className="text-center text-[52px] font-light mt-60 mb-5 text-[#FFFFFF]">Frequently Asked Questions</h2>
      
      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={index} className="bg-[#04090D] overflow-hidden relative">
            <div className="absolute top-0 left-1/2 w-0 h-[2px] bg-[#23F98A] transition-all duration-300 ease-out" 
                 style={{
                   width: openIndex === index ? '100%' : '0',
                   left: openIndex === index ? '0' : '50%'
                 }}>
            </div>
            <div 
              className="flex justify-between items-center p-4 cursor-pointer"
              onClick={() => toggleQuestion(index)}
            >
              <span className="text-[24px] text-[#FFFFFF] font-medium mt-5 mb-5 ml-5">{question}</span>
              <div className={`w-6 h-6 mr-6 relative transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                <div className="absolute top-1/2 left-0 w-full h-1 bg-[#FFFFFF] transform -translate-y-1/2"></div>
                <div className={`absolute top-1/2 left-1/2 w-1 h-full bg-[#FFFFFF] transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${openIndex === index ? 'opacity-0' : 'opacity-100'}`}></div>
              </div>
            </div>
            <div 
              ref={(el: HTMLDivElement | null) => {
                if (el) {
                  contentRefs.current[index] = el;
                }
              }}
              className="overflow-hidden transition-max-height duration-300 ease-in-out"
              style={{ maxHeight: openIndex === index ? `${contentRefs.current[index]?.scrollHeight}px` : '0px' }}
            >
              <div className="p-4 text-[20px] bg-[#04090D] mb-10 ml-5">
                <p className="font-light text-[#D9D9D9]">{answers[index]}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
