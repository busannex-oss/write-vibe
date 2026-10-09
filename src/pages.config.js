/**
 * pages.config.js - Page routing configuration
 * Pages are lazy-loaded so each page's code downloads only when it is visited.
 * The landing page stays eagerly loaded for the fastest first paint.
 */
import { lazy } from 'react';
import Landing from './pages/Landing';
import __Layout from './Layout.jsx';

export const PAGES = {
    "About": lazy(() => import('./pages/About')),
    "BookEditor": lazy(() => import('./pages/BookEditor')),
    "BookWebsite": lazy(() => import('./pages/BookWebsite')),
    "Books": lazy(() => import('./pages/Books')),
    "Contact": lazy(() => import('./pages/Contact')),
    "CookiePolicy": lazy(() => import('./pages/CookiePolicy')),
    "CreateBook": lazy(() => import('./pages/CreateBook')),
    "Dashboard": lazy(() => import('./pages/Dashboard')),
    "Documents": lazy(() => import('./pages/Documents')),
    "ErrorDashboard": lazy(() => import('./pages/ErrorDashboard')),
    "FAQ": lazy(() => import('./pages/FAQ')),
    "HowItWorks": lazy(() => import('./pages/HowItWorks')),
    "Investor": lazy(() => import('./pages/Investor')),
    "Landing": Landing,
    "Pricing": lazy(() => import('./pages/Pricing')),
    "Privacy": lazy(() => import('./pages/Privacy')),
    "ProjectReports": lazy(() => import('./pages/ProjectReports')),
    "Settings": lazy(() => import('./pages/Settings')),
    "Team": lazy(() => import('./pages/Team')),
    "Terms": lazy(() => import('./pages/Terms')),
    "UserManagement": lazy(() => import('./pages/UserManagement')),
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};