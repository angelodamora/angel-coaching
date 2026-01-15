import Layout from "./Layout.jsx";

import AdminCalendar from "./AdminCalendar";

import AdminCoachSchedules from "./AdminCoachSchedules";

import AdminDashboard from "./AdminDashboard";

import BookAppointment from "./BookAppointment";

import CoachAnalytics from "./CoachAnalytics";

import CoachAppointments from "./CoachAppointments";

import CoachCalendar from "./CoachCalendar";

import CoachDashboard from "./CoachDashboard";

import CoachDetail from "./CoachDetail";

import CoachList from "./CoachList";

import CoachMessages from "./CoachMessages";

import CoachProfile from "./CoachProfile";

import CoachRegistration from "./CoachRegistration";

import CoachSessionHistory from "./CoachSessionHistory";

import CoacheeManagement from "./CoacheeManagement";

import CoacheeMatching from "./CoacheeMatching";

import CoacheeMessages from "./CoacheeMessages";

import CoacheeProfile from "./CoacheeProfile";

import CoacheeRegistration from "./CoacheeRegistration";

import DataManagement from "./DataManagement";

import Documents from "./Documents";

import Home from "./Home";

import LandingPage from "./LandingPage";

import MyAppointments from "./MyAppointments";

import PrivacyPolicy from "./PrivacyPolicy";

import RegistrationRequests from "./RegistrationRequests";

import Statistics from "./Statistics";

import UserManagement from "./UserManagement";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    AdminCalendar: AdminCalendar,
    
    AdminCoachSchedules: AdminCoachSchedules,
    
    AdminDashboard: AdminDashboard,
    
    BookAppointment: BookAppointment,
    
    CoachAnalytics: CoachAnalytics,
    
    CoachAppointments: CoachAppointments,
    
    CoachCalendar: CoachCalendar,
    
    CoachDashboard: CoachDashboard,
    
    CoachDetail: CoachDetail,
    
    CoachList: CoachList,
    
    CoachMessages: CoachMessages,
    
    CoachProfile: CoachProfile,
    
    CoachRegistration: CoachRegistration,
    
    CoachSessionHistory: CoachSessionHistory,
    
    CoacheeManagement: CoacheeManagement,
    
    CoacheeMatching: CoacheeMatching,
    
    CoacheeMessages: CoacheeMessages,
    
    CoacheeProfile: CoacheeProfile,
    
    CoacheeRegistration: CoacheeRegistration,
    
    DataManagement: DataManagement,
    
    Documents: Documents,
    
    Home: Home,
    
    LandingPage: LandingPage,
    
    MyAppointments: MyAppointments,
    
    PrivacyPolicy: PrivacyPolicy,
    
    RegistrationRequests: RegistrationRequests,
    
    Statistics: Statistics,
    
    UserManagement: UserManagement,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<AdminCalendar />} />
                
                
                <Route path="/AdminCalendar" element={<AdminCalendar />} />
                
                <Route path="/AdminCoachSchedules" element={<AdminCoachSchedules />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                <Route path="/BookAppointment" element={<BookAppointment />} />
                
                <Route path="/CoachAnalytics" element={<CoachAnalytics />} />
                
                <Route path="/CoachAppointments" element={<CoachAppointments />} />
                
                <Route path="/CoachCalendar" element={<CoachCalendar />} />
                
                <Route path="/CoachDashboard" element={<CoachDashboard />} />
                
                <Route path="/CoachDetail" element={<CoachDetail />} />
                
                <Route path="/CoachList" element={<CoachList />} />
                
                <Route path="/CoachMessages" element={<CoachMessages />} />
                
                <Route path="/CoachProfile" element={<CoachProfile />} />
                
                <Route path="/CoachRegistration" element={<CoachRegistration />} />
                
                <Route path="/CoachSessionHistory" element={<CoachSessionHistory />} />
                
                <Route path="/CoacheeManagement" element={<CoacheeManagement />} />
                
                <Route path="/CoacheeMatching" element={<CoacheeMatching />} />
                
                <Route path="/CoacheeMessages" element={<CoacheeMessages />} />
                
                <Route path="/CoacheeProfile" element={<CoacheeProfile />} />
                
                <Route path="/CoacheeRegistration" element={<CoacheeRegistration />} />
                
                <Route path="/DataManagement" element={<DataManagement />} />
                
                <Route path="/Documents" element={<Documents />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/LandingPage" element={<LandingPage />} />
                
                <Route path="/MyAppointments" element={<MyAppointments />} />
                
                <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                
                <Route path="/RegistrationRequests" element={<RegistrationRequests />} />
                
                <Route path="/Statistics" element={<Statistics />} />
                
                <Route path="/UserManagement" element={<UserManagement />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}