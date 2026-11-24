import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResourceDetailPage from './pages/ResourceDetailPage';
import UploadPage from './pages/UploadPage';
import BookmarksPage from './pages/BookmarksPage';
import FlagsPage from './pages/FlagsPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import UserProfilePage from './pages/UserProfilePage';
import StudentsPage from './pages/StudentsPage';
import FacultyPage from './pages/FacultyPage';
import ProtectedRoute from './components/ProtectedRoute';
import AuthGate from './components/AuthGate';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route element={<AuthGate />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="resources/:id" element={<ResourceDetailPage />} />

              <Route element={<ProtectedRoute />}>
                <Route path="upload"           element={<UploadPage />} />
                <Route path="bookmarks"        element={<BookmarksPage />} />
                <Route path="profile"          element={<ProfilePage />} />
                <Route path="profile/edit"     element={<EditProfilePage />} />
                <Route path="users/:id"        element={<UserProfilePage />} />
                <Route path="faculty"          element={<FacultyPage />} />
              </Route>

              <Route element={<ProtectedRoute roles={['faculty','admin']} />}>
                <Route path="flags"    element={<FlagsPage />} />
                <Route path="students" element={<StudentsPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/register" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
