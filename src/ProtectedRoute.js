import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const ProtectedRoute = ({ element: Component, ...rest }) => {
  const isAuthenticated = !!Cookies.get('session'); // Check if session cookie exists

  return isAuthenticated ? Component : <Navigate to="/" />;
};

export default ProtectedRoute;
