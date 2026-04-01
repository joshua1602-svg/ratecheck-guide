import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import Results from "./pages/Results";
import ResultsPreview from "./pages/ResultsPreview";
import Intake from "./pages/Intake";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const App = () => (
  <BrowserRouter>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/results" element={<Results />} />
      <Route path="/intake" element={<Intake />} />
      <Route path="/success" element={<Success />} />
      <Route path="/cancel" element={<Cancel />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
