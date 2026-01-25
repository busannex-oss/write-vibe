import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CreateBook from './pages/CreateBook';
import Books from './pages/Books';
import BookEditor from './pages/BookEditor';
import Documents from './pages/Documents';
import Team from './pages/Team';
import Settings from './pages/Settings';
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
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};