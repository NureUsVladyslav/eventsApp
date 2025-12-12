import { Routes, Route, Navigate } from "react-router-dom";
import EventsList from "./pages/EventsList";
import EventDetails from "./pages/EventDetails";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/events" replace />} />
      <Route path="/events" element={<EventsList />} />
      <Route path="/events/:id" element={<EventDetails />} />
      <Route path="*" element={<p style={{ padding: 20 }}>Сторінку не знайдено</p>} />
    </Routes>
  );
}

export default App;