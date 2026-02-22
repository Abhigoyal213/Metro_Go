import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PassengerBooking from '../pages/PassengerBooking';

describe('PassengerBooking', () => {
  it('renders the booking page', () => {
    render(
      <BrowserRouter>
        <PassengerBooking />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Plan your journey')).toBeDefined();
  });
});
