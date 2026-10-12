import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './landing/Landing';
import Console from './Console';
import EmbedWidget from './pages/EmbedWidget';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Console />} />
        <Route path="/embed/:agentId" element={<EmbedWidget />} />
      </Routes>
    </BrowserRouter>
  );
}
