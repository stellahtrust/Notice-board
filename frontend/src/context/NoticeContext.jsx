import React, { createContext, useState } from 'react';

export const NoticeContext = createContext();

export const NoticeProvider = ({ children }) => {
  const [filters, setFilters] = useState({
    category: '',
    priority: '',
    searchTerm: '',
    audience: '',
    tags: []
  });

  const [noticeRefreshTrigger, setNoticeRefreshTrigger] = useState(0);

  const triggerNoticeRefresh = () => {
    setNoticeRefreshTrigger(prev => prev + 1);
  };

  return (
    <NoticeContext.Provider 
      value={{ 
        filters, 
        setFilters, 
        noticeRefreshTrigger, 
        triggerNoticeRefresh 
      }}
    >
      {children}
    </NoticeContext.Provider>
  );
};