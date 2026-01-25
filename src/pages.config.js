import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CreateBook from './pages/CreateBook';
import Books from './pages/Books';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Landing": Landing,
    "Dashboard": Dashboard,
    "CreateBook": CreateBook,
    "Books": Books,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};