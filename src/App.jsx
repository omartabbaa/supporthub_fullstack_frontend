import { useState } from 'react'
import viteLogo from '/vite.svg'
import './App.css'
import { Routes, Route } from 'react-router-dom';
import LandingPage from './page/LandingPage';
import BusinessOverviewPage from './page/BusinessOverviewPage';
import DepartmentProjectManagementPage from './page/Department&ProjectManagementPage';
import QuestionOverviewPage from './page/QuestionOverviewPage';
import QuestionDetailPage from './page/QuestionDetailPage';
import AdmnDashboardPage from './page/AdmnDashboardPage';
import NotFoundPage from './page/NotFoundPage';
import Navbar from './Components/Sections/navbar/navbar';
import Login from './page/Login';
import SignUp from './page/SignUp';

function App() {
  const [count, setCount] = useState(0)

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
        <Route path="/admin-dashboard" element={<AdmnDashboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </body>


  )
}

export default App