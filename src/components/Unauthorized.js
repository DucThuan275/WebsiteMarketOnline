import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Unauthorized = () => {
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setIsAnimated(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 overflow-hidden">
      {/* Main container with torn paper effect */}
      <div className="relative w-full max-w-3xl mx-auto">
        {/* Top torn paper */}
        <div className="bg-amber-100 h-40 md:h-48 rounded-t-lg relative shadow-md">
          <div
            className="absolute bottom-0 left-0 right-0 h-16"
            style={{
              backgroundImage:
                'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 50"><path d="M0,0 Q80,25 160,5 Q240,35 320,15 Q400,40 480,20 Q560,45 640,25 Q720,50 800,30 Q880,45 960,25 Q1000,40 1000,50 L1000,50 L0,50 Z" fill="%23f8fafc"/></svg>\')',
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "bottom",
            }}
          ></div>
        </div>

        {/* Content area */}
        <div className="bg-slate-50 px-6 py-8 md:px-10 md:py-12 rounded-b-lg shadow-md relative">
          <div className="flex flex-col items-center text-center">
            {/* Character */}
            <div
              className={`relative mb-6 transition-all duration-1000 ${
                isAnimated
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <div className="w-40 h-40 md:w-48 md:h-48 relative">
                {/* Character body */}
                <div className="absolute inset-0 bg-amber-400 rounded-full overflow-hidden border-4 border-amber-500">
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-amber-300"></div>
                </div>

                {/* Eyes */}
                <div className="absolute top-[30%] left-1/2 transform -translate-x-1/2 flex gap-4">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-slate-900 rounded-full"></div>
                  </div>
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-slate-900 rounded-full"></div>
                  </div>
                </div>

                {/* Mouth */}
                <div className="absolute top-[55%] left-1/2 transform -translate-x-1/2 w-8 h-4 bg-slate-800 rounded-b-full"></div>

                {/* Police hat */}
                <div className="absolute top-[-15%] left-1/2 transform -translate-x-1/2 w-32 h-12 bg-slate-700 rounded-t-lg overflow-hidden">
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-slate-600"></div>
                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-slate-400 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-slate-300 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Stop sign */}
                <div
                  className={`absolute top-[40%] -left-10 transition-all duration-1000 ${
                    isAnimated
                      ? "translate-x-0 rotate-0"
                      : "-translate-x-20 rotate-45"
                  }`}
                >
                  <div className="w-10 h-24 bg-slate-700 rounded-full"></div>
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-red-500 rounded-lg rotate-45 flex items-center justify-center">
                    <div className="w-16 h-16 border-2 border-white rounded-lg rotate-45 flex items-center justify-center">
                      <span className="text-white font-bold text-sm -rotate-45">
                        STOP
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Torn paper effect with text */}
            <div
              className={`relative w-full max-w-md mx-auto mb-8 transition-all duration-1000 delay-300 ${
                isAnimated ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="bg-amber-100 p-4 rounded">
                <div
                  className="absolute left-0 right-0 top-0 h-4"
                  style={{
                    backgroundImage:
                      'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 20"><path d="M0,20 Q40,5 80,15 Q120,0 160,10 Q200,5 240,15 Q280,0 320,10 Q360,5 400,15 Q440,0 480,10 Q520,5 560,15 Q600,0 640,10 Q680,5 720,15 Q760,0 800,10 Q840,5 880,15 Q920,0 960,10 Q1000,5 1000,0 L1000,0 L0,0 Z" fill="%23f8fafc"/></svg>\')',
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    backgroundPosition: "top",
                  }}
                ></div>
                <div className="pt-6 pb-2 px-2">
                  <h2 className="font-mono text-center text-xl md:text-2xl font-bold tracking-wider text-slate-900 uppercase">
                    Không có quyền truy cập
                  </h2>
                </div>
                <div
                  className="absolute left-0 right-0 bottom-0 h-4"
                  style={{
                    backgroundImage:
                      'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 20"><path d="M0,0 Q40,15 80,5 Q120,20 160,10 Q200,15 240,5 Q280,20 320,10 Q360,15 400,5 Q440,20 480,10 Q520,15 560,5 Q600,20 640,10 Q680,15 720,5 Q760,20 800,10 Q840,15 880,5 Q920,20 960,10 Q1000,15 1000,20 L1000,20 L0,20 Z" fill="%23f8fafc"/></svg>\')',
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    backgroundPosition: "bottom",
                  }}
                ></div>
              </div>
            </div>

            {/* Error Description */}
            <p
              className={`mb-8 text-slate-600 max-w-md transition-all duration-1000 delay-500 ${
                isAnimated
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              Bạn không có quyền truy cập vào khu vực quản trị. Vui lòng đăng
              nhập với tài khoản có quyền quản trị.
            </p>

            {/* Action Buttons */}
            <div
              className={`flex flex-col sm:flex-row w-full max-w-md gap-3 transition-all duration-1000 delay-700 ${
                isAnimated
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <Link
                to="/admin/login"
                className="flex-1 px-6 py-3 text-white transition-all rounded-lg bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none text-center font-medium"
              >
                Đăng nhập quản trị
              </Link>
              <Link
                to="/"
                className="flex-1 px-6 py-3 transition-all border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-100 focus:ring-2 focus:ring-slate-300 focus:outline-none text-center font-medium"
              >
                Quay về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
