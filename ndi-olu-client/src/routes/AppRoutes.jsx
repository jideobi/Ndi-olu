import { Route, Routes } from "react-router-dom";

import FindWorkers from "../pages/FindWorkers";
import Home from "../pages/Home";
import PostJob from "../pages/PostJob";
import SignUp from "../pages/SignUp";
import WorkerProfile from "../pages/WorkerProfile";
import CustomerDashboard from "../pages/CustomerDashboard";
import Login from "../pages/Login";
import CustomerJobs from "../pages/CustomerJobs";
import CustomerJobDetails from "../pages/CustomerJobDetails";
import AdminDashboard from "../pages/AdminDashboard";
import AvailableJobs from "../pages/AvailableJobs";
import WorkerDashboard from "../pages/WorkerDashboard";
import WorkerJobDetails from "../pages/WorkerJobDetails";
import WorkerProposals from "../pages/WorkerProposals";
import WorkerProfileSetup from "../pages/WorkerProfileSetup";
import Messages from "../pages/Messages";


import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />

      <Route path="/find-workers" element={<FindWorkers />} />

      <Route
        path="/workers/:workerId"
        element={<WorkerProfile />}
      />

      <Route path="/signup" element={<SignUp />} />

      <Route path="/login" element={<Login />} />




      {/* Protected routes */}
      <Route
        path="/post-job"
        element={
          <ProtectedRoute>
            <PostJob />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer-dashboard"
        element={
          <ProtectedRoute>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer-jobs"
        element={
          <ProtectedRoute>
            <CustomerJobs />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer-jobs/:jobId"
        element={
          <ProtectedRoute>
            <CustomerJobDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/available-jobs"
        element={
          <ProtectedRoute>
            <AvailableJobs />
          </ProtectedRoute>
        }
      />

      <Route
        path="/worker-dashboard"
        element={
          <ProtectedRoute>
            <WorkerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/worker-profile"
        element={
          <ProtectedRoute>
            <WorkerProfileSetup />
          </ProtectedRoute>
        }
      />


      <Route
        path="/worker-jobs/:id"
        element={
          <ProtectedRoute>
            <WorkerJobDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker-proposals"
        element={
          <ProtectedRoute>
            <WorkerProposals />
          </ProtectedRoute>
        }
      />

      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />


      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

    </Routes>
  );
}

export default AppRoutes;
