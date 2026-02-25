/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import About from './pages/About';
import BookEditor from './pages/BookEditor';
import BookWebsite from './pages/BookWebsite';
import Books from './pages/Books';
import Contact from './pages/Contact';
import CreateBook from './pages/CreateBook';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Landing from './pages/Landing';
import Pricing from './pages/Pricing';
import Privacy from './pages/Privacy';
import ProjectReports from './pages/ProjectReports';
import Settings from './pages/Settings';
import Team from './pages/Team';
import Terms from './pages/Terms';
import UserManagement from './pages/UserManagement';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "BookEditor": BookEditor,
    "BookWebsite": BookWebsite,
    "Books": Books,
    "Contact": Contact,
    "CreateBook": CreateBook,
    "Dashboard": Dashboard,
    "Documents": Documents,
    "Landing": Landing,
    "Pricing": Pricing,
    "Privacy": Privacy,
    "ProjectReports": ProjectReports,
    "Settings": Settings,
    "Team": Team,
    "Terms": Terms,
    "UserManagement": UserManagement,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};