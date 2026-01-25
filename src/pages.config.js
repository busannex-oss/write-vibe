import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CreateBook from './pages/CreateBook';
import Books from './pages/Books';
import BookEditor from './pages/BookEditor';
import Documents from './pages/Documents';
import Team from './pages/Team';
import Settings from './pages/Settings';
import Pricing from './pages/Pricing';
import BookWebsite from './pages/BookWebsite';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Landing": Landing,
    "Dashboard": Dashboard,
    "CreateBook": CreateBook,
    "Books": Books,
    "BookEditor": BookEditor,
    "Documents": Documents,
    "Team": Team,
    "Settings": Settings,
    "Pricing": Pricing,
    "BookWebsite": BookWebsite,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};