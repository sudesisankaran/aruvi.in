import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const AUTHORIZED_ADMIN_EMAIL = 'aruvicollections.25@gmail.com';

export default function AdminRoute({ children }) {
  const { user, isAdmin, addToast } = useStore();
  const location = useLocation();

  const isStrictlyAuthorized = 
    Boolean(isAdmin) && 
    (user?.email || '').trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL;

  useEffect(() => {
    if (!isStrictlyAuthorized) {
      addToast('Access Denied: Only aruvicollections.25@gmail.com is authorized to access the Admin Dashboard.', 'error');
    }
  }, [isStrictlyAuthorized, addToast]);

  if (!isStrictlyAuthorized) {
    // Redirect unauthorized customer or guest visitor directly to customer Home page
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}
