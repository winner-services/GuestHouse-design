import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { MainContext } from './MainContext';
import HeaderPage from '../views/mainPages/partials/HeaderPage';
import SidebarPage from '../views/mainPages/partials/SidebarPage';

const DefaultStructure = ({ children }) => {

  const { loader } = useContext(MainContext)

  return children ? children : <>
    <div id="global-loader" style={{ display: loader ? '' : 'none', zIndex: 1900 }}>
      <div className="whirly-loader"> </div>
    </div>
    <div className="side-overlay"></div>
    <SidebarPage />
    <div className="dashboard-main-wrapper">
      <HeaderPage />
      <Outlet />
      {/* <FooterPage /> */}
    </div>

  </>;
};

export default DefaultStructure;