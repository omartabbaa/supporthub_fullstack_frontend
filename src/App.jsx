import { Routes, Route } from 'react-router-dom';
import './App.css';
import LandingPage from './page/LandingPage';
import BusinessOverviewPage from './page/BusinessOverviewPage';
import DepartmentProjectManagementPage from './page/DepartmentProjectManagementPage';
import QuestionOverviewPage from './page/QuestionOverviewPage';
import QuestionDetailPage from './page/QuestionDetailPage';
import AdminDashboardPage from './page/AdminDashboardPage';
import NotFoundPage from './page/NotFoundPage';
import Navbar from './Components/navbar';
import Login from './page/Login';
import SignUp from './page/SignUp';

function App() {
  return (
    <body>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/business-overview" element={<BusinessOverviewPage />} />
        <Route path="/department-project-management/:businessId/:businessName" element={<DepartmentProjectManagementPage />} />
        <Route path="/question-overview/:department/:project/:projectId" element={<QuestionOverviewPage />} />
        <Route path="/question-detail/:questionId/:title/:question/:projectId" element={<QuestionDetailPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </body>
  )
}

export default App