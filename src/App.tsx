import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { routerBasename } from './utils/routerBase';
import { isOrganizerAuthed, RequireAuth } from './pages/RequireAuth';
import { CmsLayout } from './pages/CmsLayout';
import { SurveyListPage } from './pages/SurveyListPage';
import { NewSurveyPage } from './pages/NewSurveyPage';
import { SurveyWorkspace } from './pages/SurveyWorkspace';
import { SurveyEditPage } from './pages/SurveyEditPage';
import { SurveyLinksPage } from './pages/SurveyLinksPage';
import { SurveyResultsPage } from './pages/SurveyResultsPage';
import { FillPage } from './pages/FillPage';
import { TrashPage } from './pages/TrashPage';
import { LoginPage } from './pages/LoginPage';

function GateToLogin() {
  return <Navigate to={isOrganizerAuthed() ? '/cms' : '/cms/login'} replace />;
}

export function App() {
  return (
    <BrowserRouter basename={routerBasename()}>
      <Routes>
        <Route path="/" element={<GateToLogin />} />
        <Route path="/cms/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/cms" element={<CmsLayout />}>
            <Route index element={<SurveyListPage />} />
            <Route path="new" element={<NewSurveyPage />} />
            <Route path="trash" element={<TrashPage />} />
            <Route path="surveys/:surveyId" element={<SurveyWorkspace />}>
              <Route index element={<Navigate to="links" replace />} />
              <Route path="edit" element={<SurveyEditPage />} />
              <Route path="links" element={<SurveyLinksPage />} />
              <Route path="results" element={<SurveyResultsPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="/s/:slug" element={<FillPage />} />
        <Route path="*" element={<GateToLogin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
