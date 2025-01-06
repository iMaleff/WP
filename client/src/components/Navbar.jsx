import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ThemeToggle } from './ThemeToggle';

export const Navbar = () => {
  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold text-primary">
              NoteBook
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium hover:text-primary">
                Homepages
              </Link>
              <Link to="/about" className="text-sm font-medium hover:text-primary">
                About
              </Link>
              <Link to="/categories" className="text-sm font-medium hover:text-primary">
                Categories
              </Link>
              <Link to="/pages" className="text-sm font-medium hover:text-primary">
                Pages
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/contact" className="text-sm font-medium hover:text-primary">
              Contact
            </Link>
            <button className="text-sm font-medium hover:text-primary">
              En
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};
