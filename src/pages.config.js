import BookEditor from './pages/BookEditor';
import BookWebsite from './pages/BookWebsite';
import Books from './pages/Books';
import CreateBook from './pages/CreateBook';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Landing from './pages/Landing';
import Pricing from './pages/Pricing';
import Settings from './pages/Settings';
import Team from './pages/Team';
import __Layout from './Layout.jsx';


export const PAGES = {
    "BookEditor": BookEditor,
    "BookWebsite": BookWebsite,
    "Books": Books,
    "CreateBook": CreateBook,
    "Dashboard": Dashboard,
    "Documents": Documents,
    "Landing": Landing,
    "Pricing": Pricing,
    "Settings": Settings,
    "Team": Team,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};