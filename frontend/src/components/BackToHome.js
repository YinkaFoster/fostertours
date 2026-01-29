import { Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

const BackToHome = ({ currentPage, showButton = true }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link 
          to="/" 
          className="flex items-center gap-1 hover:text-primary transition-colors"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Home</span>
        </Link>
        {currentPage && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="font-medium text-foreground">{currentPage}</span>
          </>
        )}
      </nav>

      {/* Back Button */}
      {showButton && (
        <Link to="/" className="hidden sm:block">
          <Button variant="outline" size="sm" className="gap-2">
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
      )}
    </div>
  );
};

export default BackToHome;
