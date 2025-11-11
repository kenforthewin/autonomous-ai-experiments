import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LandingPage } from '@/components/LandingPage';

describe('LandingPage', () => {
  beforeEach(() => {
    // Clear any mocks before each test
    vi.clearAllMocks();
  });

  it('renders default title and subtitle', () => {
    render(<LandingPage />);
    
    expect(screen.getByText('Welcome to React Modern App')).toBeInTheDocument();
    expect(
      screen.getByText('A modern React application with TypeScript and Vite')
    ).toBeInTheDocument();
  });

  it('renders custom title and subtitle', () => {
    render(
      <LandingPage
        title="Custom Title"
        subtitle="Custom subtitle text"
      />
    );
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom subtitle text')).toBeInTheDocument();
  });

  it('displays feature cards', () => {
    render(<LandingPage />);
    
    expect(screen.getByText('⚡ Fast Development')).toBeInTheDocument();
    expect(screen.getByText('🔒 Type Safe')).toBeInTheDocument();
    expect(screen.getByText('🧪 Well Tested')).toBeInTheDocument();
    expect(screen.getByText('🎨 Modern Code')).toBeInTheDocument();
  });

  it('shows current time and API configuration', () => {
    render(<LandingPage />);
    
    expect(screen.getByText('Current Time')).toBeInTheDocument();
    expect(screen.getByText('API Configuration')).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    const { container } = render(<LandingPage />);
    
    expect(container.querySelector('header')).toBeInTheDocument();
    expect(container.querySelector('main')).toBeInTheDocument();
    expect(container.querySelector('footer')).toBeInTheDocument();
    expect(container.querySelector('nav')).toBeInTheDocument();
  });
});
