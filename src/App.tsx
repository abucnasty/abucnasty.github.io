import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { Home } from './pages/Home';
import { BenchmarksIndex } from './pages/BenchmarksIndex';
import { BenchmarkDetail } from './pages/BenchmarkDetail';
import { Blueprints } from './pages/Blueprints';
import { About } from './pages/About';
import { NotFound } from './pages/NotFound';

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/benchmarks" element={<BenchmarksIndex />} />
        <Route path="/benchmarks/:slug" element={<BenchmarkDetail />} />
        <Route path="/blueprints" element={<Blueprints />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}
