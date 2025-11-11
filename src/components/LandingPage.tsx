import { useState, useEffect } from 'react';
import type { LandingPageProps } from '@/types';
import { getConfig, formatDate } from '@/utils';
import './LandingPage.css';

export const LandingPage = ({
  title = 'Welcome to React Modern App',
  subtitle = 'A modern React application with TypeScript and Vite',
}: LandingPageProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const config = getConfig();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="landing-page">
      <header className="landing-page__header">
        <nav className="landing-page__nav">
          <div className="landing-page__logo">
            <h1>{config.title}</h1>
          </div>
          <div className="landing-page__nav-items">
            <span>v{config.version}</span>
          </div>
        </nav>
      </header>

      <main className="landing-page__main">
        <section className="landing-page__hero">
          <h2 className="landing-page__title">{title}</h2>
          <p className="landing-page__subtitle">{subtitle}</p>
          <div className="landing-page__features">
            <div className="landing-page__feature">
              <h3>⚡ Fast Development</h3>
              <p>Built with Vite for lightning-fast development experience</p>
            </div>
            <div className="landing-page__feature">
              <h3>🔒 Type Safe</h3>
              <p>Full TypeScript support with strict configuration</p>
            </div>
            <div className="landing-page__feature">
              <h3>🧪 Well Tested</h3>
              <p>Unit testing setup with Vitest and comprehensive coverage</p>
            </div>
            <div className="landing-page__feature">
              <h3>🎨 Modern Code</h3>
              <p>ESLint and Prettier for consistent, clean code</p>
            </div>
          </div>
        </section>

        <section className="landing-page__info">
          <div className="landing-page__info-card">
            <h3>Current Time</h3>
            <p>{formatDate(currentTime)}</p>
            <p>{currentTime.toLocaleTimeString()}</p>
          </div>
          <div className="landing-page__info-card">
            <h3>API Configuration</h3>
            <p>Base URL: {config.apiBaseUrl}</p>
          </div>
        </section>
      </main>

      <footer className="landing-page__footer">
        <p>&copy; 2025 {config.title}. Built with modern web technologies.</p>
      </footer>
    </div>
  );
};
