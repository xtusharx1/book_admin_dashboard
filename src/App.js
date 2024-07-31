import logo from './logo.svg';
import './App.css';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import "./sb-admin-2.min.css";
import Dashboard from './Dashboard';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Userlist from './Userlist';
import Portal from './Portal';
import UserCreate from './UserCreate';
import UserView from './UserView';
import UserEdit from './UserEdit';
import Librarylist from './Librarylist';
import Bookview from './Bookview';
import Bookedit from './Bookedit';
import ChapterEdit from './Chapters-edit';
import Bookcreate from './Bookcreate';
import Chaptercreate from './Chaptercreate';
import Salescreen from './Salescreen';
import Apphome from './apphome';
import ProtectedRoute from './ProtectedRoute';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/portal' element={<Portal />}>
          <Route path="dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="user-list" element={<ProtectedRoute element={<Userlist />} />} />
          <Route path="create-user" element={<ProtectedRoute element={<UserCreate />} />} />
          <Route path="user-view/:id" element={<ProtectedRoute element={<UserView />} />} />
          <Route path="user-edit/:id" element={<ProtectedRoute element={<UserEdit />} />} />
          <Route path="Library-list" element={<ProtectedRoute element={<Librarylist />} />} />
          <Route path="Book-view/:id" element={<ProtectedRoute element={<Bookview />} />} />
          <Route path="Book-edit/:id" element={<ProtectedRoute element={<Bookedit />} />} />
          <Route path="chapter-edit/:id" element={<ProtectedRoute element={<ChapterEdit />} />} />
          <Route path="Book-create" element={<ProtectedRoute element={<Bookcreate />} />} />
          <Route path="Chapter-create/:b_id" element={<ProtectedRoute element={<Chaptercreate />} />} />
          <Route path="Salesscreen" element={<ProtectedRoute element={<Salescreen />} />} />
          <Route path="Apphome" element={<ProtectedRoute element={<Apphome />} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
