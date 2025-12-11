import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import EventsList from "./pages/EventsList";
import EventDetails from "./pages/EventDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/events" />} />
        <Route path="/events" element={<EventsList />} />
        <Route path="/events/:id" element={<EventDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
