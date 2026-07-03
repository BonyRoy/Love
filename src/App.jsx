import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import ReasonsPage from "./pages/ReasonsPage";
import ComplimentsPage from "./pages/ComplimentsPage";
import LettersPage from "./pages/LettersPage";
import JarPage from "./pages/JarPage";
import TimelinePage from "./pages/TimelinePage";
import BucketListPage from "./pages/BucketListPage";
import DailyPage from "./pages/DailyPage";
import DateIdeasPage from "./pages/DateIdeasPage";
import MoodPage from "./pages/MoodPage";
import FavoritesPage from "./pages/FavoritesPage";
import GamesPage from "./pages/GamesPage";
import CatchHearts from "./games/CatchHearts";
import LoveQuiz from "./games/LoveQuiz";
import SpinWheel from "./games/SpinWheel";
import MemoryMatch from "./games/MemoryMatch";
import WouldYouRather from "./games/WouldYouRather";
import TruthOrDare from "./games/TruthOrDare";
import ScratchSurprise from "./games/ScratchSurprise";
import HeartRush from "./games/HeartRush";
import DiceOfLove from "./games/DiceOfLove";
import AdminLoginPage from "./admin/AdminLoginPage";
import AdminLayout, { ProtectedAdminRoute } from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminSectionPage from "./admin/AdminSectionPage";
import AdminChatPage from "./admin/AdminChatPage";
import AdminSecurityPage from "./admin/AdminSecurityPage";
import ChatPage from "./pages/ChatPage";
import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route element={<Layout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/reasons" element={<ReasonsPage />} />
        <Route path="/compliments" element={<ComplimentsPage />} />
        <Route path="/letters" element={<LettersPage />} />
        <Route path="/jar" element={<JarPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/bucket-list" element={<BucketListPage />} />
        <Route path="/daily" element={<DailyPage />} />
        <Route path="/dates" element={<DateIdeasPage />} />
        <Route path="/mood" element={<MoodPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/games/catch-hearts" element={<CatchHearts />} />
        <Route path="/games/quiz" element={<LoveQuiz />} />
        <Route path="/games/wheel" element={<SpinWheel />} />
        <Route path="/games/memory" element={<MemoryMatch />} />
        <Route path="/games/would-you-rather" element={<WouldYouRather />} />
        <Route path="/games/truth-or-dare" element={<TruthOrDare />} />
        <Route path="/games/scratch" element={<ScratchSurprise />} />
        <Route path="/games/heart-rush" element={<HeartRush />} />
        <Route path="/games/dice" element={<DiceOfLove />} />
      </Route>

      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route element={<ProtectedAdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="sections/:sectionId" element={<AdminSectionPage />} />
          <Route path="security" element={<AdminSecurityPage />} />
          <Route path="chat" element={<AdminChatPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
