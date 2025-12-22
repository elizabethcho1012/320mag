import { ReactNode } from 'react';

interface DeviceMockupProps {
  type: 'iphone' | 'macbook';
  screenshot?: string;
  children?: ReactNode;
  className?: string;
}

export function DeviceMockup({
  type,
  screenshot,
  children,
  className = ''
}: DeviceMockupProps) {
  if (type === 'iphone') {
    return (
      <div className={`relative ${className}`}>
        {/* iPhone Vector Mockup with Transparent PNG */}
        <div className="relative mx-auto w-[338px] h-[697px]">
          {/* Phone frame image */}
          <img
            src="/iphone17promax.png"
            alt="iPhone mockup"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
          />

          {/* Screenshot inside the phone - positioned to match screen area */}
          <div
            className="absolute top-[2%] left-[2.5%] right-[2.5%] bottom-[2%] overflow-hidden rounded-[32px]"
          >
            {screenshot ? (
              <img
                src={screenshot}
                alt="App screenshot"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                {children}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // MacBook mockup
  return (
    <div className={`relative ${className}`}>
      {/* MacBook Screen */}
      <div className="relative mx-auto border-[8px] border-gray-800 rounded-t-xl h-[400px] w-[640px] shadow-2xl bg-black">
        {/* Bezel */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[6px] w-[15%] bg-gray-700 rounded-b-md z-10"></div>

        {/* Screen */}
        <div className="w-full h-full rounded-t-lg overflow-hidden bg-black relative">
          {screenshot ? (
            <img
              src={screenshot}
              alt="App screenshot"
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
              {children}
            </div>
          )}
        </div>
      </div>

      {/* MacBook Base */}
      <div className="relative mx-auto h-[25px] w-[680px] bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-xl shadow-lg">
        {/* Trackpad area indicator */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 h-[2px] w-[120px] bg-gray-600 rounded-full"></div>
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 -z-10 bg-primary-500/10 blur-3xl rounded-full scale-75"></div>
    </div>
  );
}
