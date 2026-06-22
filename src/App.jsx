import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import AgentMemoryLog from './pages/AgentMemoryLog';
import BookEditor from './pages/BookEditor';
import MissionStatement from './pages/MissionStatement';
import SOPs from './pages/SOPs';
import MasterRegistry from './pages/MasterRegistry';
import MapLegend from './pages/MapLegend';
import PillarAlignment from './pages/PillarAlignment';
import BrandStyleGuide from './pages/BrandStyleGuide';
import Sitemap from './pages/Sitemap';
import SystemArchitecture from './pages/SystemArchitecture';
import LegalDocuments from './pages/LegalDocuments';
import BookHealthCheck from './pages/BookHealthCheck';
import LicensingTerms from './pages/LicensingTerms';
import AgentPortal from './pages/AgentPortal';
import KPIFramework from './pages/KPIFramework';
import OnboardingExperience from './pages/OnboardingExperience';
import VersionRoadmap from './pages/VersionRoadmap';
import PillarsArchitecture from './pages/PillarsArchitecture';
import AgentAudit from './pages/AgentAudit';
import DistributionDashboard from './pages/DistributionDashboard';
import ChainOfCommand from './pages/ChainOfCommand';
import PublicationChecklist from './pages/PublicationChecklist';
import WhiteLabelAdmin from './pages/WhiteLabelAdmin';
import AgentConnectionMap from './pages/AgentConnectionMap';
import AdvisoryReviewDashboard from './pages/AdvisoryReviewDashboard';
import CCOSStudio from './pages/CCOSStudio';
import CCOSAgent from './pages/CCOSAgent';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import SWUpdateBanner from '@/components/SWUpdateBanner';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="/AgentMemoryLog" element={<LayoutWrapper currentPageName="AgentMemoryLog"><AgentMemoryLog /></LayoutWrapper>} />
      <Route path="/BookEditor" element={<LayoutWrapper currentPageName="BookEditor"><BookEditor /></LayoutWrapper>} />
      <Route path="/MissionStatement" element={<LayoutWrapper currentPageName="MissionStatement"><MissionStatement /></LayoutWrapper>} />
      <Route path="/SOPs" element={<LayoutWrapper currentPageName="SOPs"><SOPs /></LayoutWrapper>} />
      <Route path="/MasterRegistry" element={<LayoutWrapper currentPageName="MasterRegistry"><MasterRegistry /></LayoutWrapper>} />
      <Route path="/MapLegend" element={<LayoutWrapper currentPageName="MapLegend"><MapLegend /></LayoutWrapper>} />
      <Route path="/PillarAlignment" element={<LayoutWrapper currentPageName="PillarAlignment"><PillarAlignment /></LayoutWrapper>} />
      <Route path="/BrandStyleGuide" element={<LayoutWrapper currentPageName="BrandStyleGuide"><BrandStyleGuide /></LayoutWrapper>} />
      <Route path="/Sitemap" element={<LayoutWrapper currentPageName="Sitemap"><Sitemap /></LayoutWrapper>} />
      <Route path="/SystemArchitecture" element={<LayoutWrapper currentPageName="SystemArchitecture"><SystemArchitecture /></LayoutWrapper>} />
      <Route path="/LegalDocuments" element={<LayoutWrapper currentPageName="LegalDocuments"><LegalDocuments /></LayoutWrapper>} />
      <Route path="/BookHealthCheck" element={<LayoutWrapper currentPageName="BookHealthCheck"><BookHealthCheck /></LayoutWrapper>} />
      <Route path="/LicensingTerms" element={<LayoutWrapper currentPageName="LicensingTerms"><LicensingTerms /></LayoutWrapper>} />
      <Route path="/AgentPortal" element={<AgentPortal />} />
      <Route path="/KPIFramework" element={<LayoutWrapper currentPageName="KPIFramework"><KPIFramework /></LayoutWrapper>} />
      <Route path="/OnboardingExperience" element={<LayoutWrapper currentPageName="OnboardingExperience"><OnboardingExperience /></LayoutWrapper>} />
      <Route path="/VersionRoadmap" element={<LayoutWrapper currentPageName="VersionRoadmap"><VersionRoadmap /></LayoutWrapper>} />
      <Route path="/PillarsArchitecture" element={<LayoutWrapper currentPageName="PillarsArchitecture"><PillarsArchitecture /></LayoutWrapper>} />
      <Route path="/AgentAudit" element={<LayoutWrapper currentPageName="AgentAudit"><AgentAudit /></LayoutWrapper>} />
      <Route path="/DistributionDashboard" element={<LayoutWrapper currentPageName="DistributionDashboard"><DistributionDashboard /></LayoutWrapper>} />
      <Route path="/ChainOfCommand" element={<LayoutWrapper currentPageName="ChainOfCommand"><ChainOfCommand /></LayoutWrapper>} />
      <Route path="/PublicationChecklist" element={<LayoutWrapper currentPageName="PublicationChecklist"><PublicationChecklist /></LayoutWrapper>} />
      <Route path="/WhiteLabelAdmin" element={<LayoutWrapper currentPageName="WhiteLabelAdmin"><WhiteLabelAdmin /></LayoutWrapper>} />
      <Route path="/AgentConnectionMap" element={<LayoutWrapper currentPageName="AgentConnectionMap"><AgentConnectionMap /></LayoutWrapper>} />
      <Route path="/AdvisoryReviewDashboard" element={<LayoutWrapper currentPageName="AdvisoryReviewDashboard"><AdvisoryReviewDashboard /></LayoutWrapper>} />
      <Route path="/CCOSStudio" element={<LayoutWrapper currentPageName="CCOSStudio"><CCOSStudio /></LayoutWrapper>} />
      <Route path="/CCOSAgent" element={<LayoutWrapper currentPageName="CCOSAgent"><CCOSAgent /></LayoutWrapper>} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <SWUpdateBanner />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App