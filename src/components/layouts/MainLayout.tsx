import { ReactNode } from 'react';
import Header from '../molecules/Header';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark">
      <Header />
      {children}
    </div>
  );
}
