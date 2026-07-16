// components/Sidebar.jsx
"use client";
import { useEffect } from "react";
import { MdClose } from "react-icons/md";

const Sidebar = ({ isOpen, onClose, title, content }) => {
  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-500 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div 
        className={`fixed right-0 top-0 h-full w-full sm:w-96 md:w-1/3 lg:w-1/3 bg-white z-50 shadow-lg transition-transform duration-500 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-md font-bold">{title}</h2>
            <button 
              onClick={onClose}
              className="cursor-pointer"
            >
              <MdClose size={24} />
            </button>
          </div>
          
          {/* Content */}
          <div className="mt-2">
            {content}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;