import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { Toaster } from "./components/ui/sonner";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatBot from "./components/ChatBot";

// Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import FlightsPage from "./pages/FlightsPage";
import HotelsPage from "./pages/HotelsPage";
import EventsPage from "./pages/EventsPage";
import VehiclesPage from "./pages/VehiclesPage";
import VisaPage from "./pages/VisaPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import StorePage from "./pages/StorePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import WalletPage from "./pages/WalletPage";
import GalleryPage from "./pages/GalleryPage";
import EditProfilePage from "./pages/EditProfilePage";
import UserProfilePage from "./pages/UserProfilePage";
import AIItineraryPage from "./pages/AIItineraryPage";
import AdminPage from "./pages/AdminPage";
import ItineraryBuilderPage from "./pages/ItineraryBuilderPage";
import { PaymentSuccess, PaymentCancel } from "./pages/PaymentPages";

// Router wrapper to handle auth callback
const AppRouter = () => {
  const location = useLocation();
  
  // Check URL fragment for session_id (OAuth callback) BEFORE rendering routes
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Feature Pages - Public */}
      <Route path="/flights" element={<FlightsPage />} />
      <Route path="/hotels" element={<HotelsPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/vehicles" element={<VehiclesPage />} />
      <Route path="/visa" element={<VisaPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="/store" element={<StorePage />} />
      <Route path="/store/product/:productId" element={<ProductDetailPage />} />
      <Route path="/store/cart" element={<CartPage />} />
      <Route path="/store/checkout" element={<CheckoutPage />} />
      <Route path="/store/order-success" element={<OrderSuccessPage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      
      {/* Payment Callbacks */}
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/cancel" element={<PaymentCancel />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wallet"
        element={
          <ProtectedRoute>
            <WalletPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <EditProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="/profile/:userId" element={<UserProfilePage />} />
      
      {/* AI Itinerary Planner */}
      <Route
        path="/itinerary/ai"
        element={
          <ProtectedRoute>
            <AIItineraryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/itinerary/ai/:sessionId"
        element={
          <ProtectedRoute>
            <AIItineraryPage />
          </ProtectedRoute>
        }
      />
      
      {/* Admin Panel */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      
      {/* Itinerary Builder */}
      <Route
        path="/itinerary/builder"
        element={
          <ProtectedRoute>
            <ItineraryBuilderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/itinerary/builder/:itineraryId"
        element={
          <ProtectedRoute>
            <ItineraryBuilderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/itinerary/:itineraryId"
        element={
          <ProtectedRoute>
            <ItineraryBuilderPage />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <AppRouter />
            <Toaster position="top-right" richColors />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
