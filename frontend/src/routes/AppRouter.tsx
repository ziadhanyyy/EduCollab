import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Layout from '@/components/layout/Layout';

const Home = lazy(() => import('@/pages/public/Home'));
const BrowseGroups = lazy(() => import('@/pages/public/BrowseGroups'));
const GroupDetailPublic = lazy(() => import('@/pages/public/GroupDetailPublic'));

const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));

const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminGroups = lazy(() => import('@/pages/admin/AdminGroups'));

const CreatorGroups = lazy(() => import('@/pages/creator/CreatorGroups'));
const CreateGroup = lazy(() => import('@/pages/creator/CreateGroup'));
const EditGroup = lazy(() => import('@/pages/creator/EditGroup'));
const JoinRequests = lazy(() => import('@/pages/creator/JoinRequests'));

const StudentDashboard = lazy(() => import('@/pages/student/StudentDashboard'));
const StudentGroups = lazy(() => import('@/pages/student/StudentGroups'));

const GroupSpace = lazy(() => import('@/pages/GroupSpace'));

const Unauthorized = lazy(() => import('@/pages/Unauthorized'));

function PageLoader() {
  return (
    <div className="flex flex-col gap-4 p-8 max-w-4xl mx-auto">
      <Skeleton className="h-10 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<BrowseGroups />} />
            <Route path="/groups/:id" element={<GroupDetailPublic />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute roles={['Admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute roles={['Admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/groups"
              element={
                <ProtectedRoute roles={['Admin']}>
                  <AdminGroups />
                </ProtectedRoute>
              }
            />

              <Route
              path="/creator/groups"
              element={
                <ProtectedRoute roles={['GroupCreator']}>
                  <CreatorGroups />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creator/groups/new"
              element={
                <ProtectedRoute roles={['GroupCreator']}>
                  <CreateGroup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creator/groups/:id/edit"
              element={
                <ProtectedRoute roles={['GroupCreator']}>
                  <EditGroup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creator/groups/:id/requests"
              element={
                <ProtectedRoute roles={['GroupCreator']}>
                  <JoinRequests />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute roles={['Student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/groups"
              element={
                <ProtectedRoute roles={['Student']}>
                  <StudentGroups />
                </ProtectedRoute>
              }
            />

            <Route
              path="/groups/:id/space"
              element={
                <ProtectedRoute>
                  <GroupSpace />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
