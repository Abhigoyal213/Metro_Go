import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/molecules/Header';
import Button from '../components/atoms/Button';
import Badge from '../components/atoms/Badge';
import Icon from '../components/atoms/Icon';
import { useBookingStore } from '../store/bookingStore';
import { generateQRCode } from '../utils/qrUtils';

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const { source, destination, bookingRef } = useBookingStore();
  const [qrCode, setQrCode] = useState<string>('');

  useEffect(() => {
    if (!bookingRef) {
      navigate('/');
      return;
    }

    const generateQR = async () => {
      const qrData = await generateQRCode(JSON.stringify({
        ref: bookingRef,
        from: source,
        to: destination,
        timestamp: Date.now(),
      }));
      setQrCode(qrData);
    };

    generateQR();
  }, [bookingRef, source, destination, navigate]);

  if (!bookingRef) return null;

  return (
    <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-4">
              <Icon name="check_circle" className="text-4xl" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Booking Confirmed!</h1>
            <p className="text-slate-600 dark:text-slate-400">Your metro ticket is ready</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 mb-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Booking Reference</span>
              <Badge variant="primary">{bookingRef}</Badge>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <Icon name="trip_origin" className="text-slate-400 dark:text-slate-500 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">From</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{source}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Icon name="location_on" className="text-slate-400 dark:text-slate-500 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">To</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{destination}</p>
                </div>
              </div>
            </div>

            {qrCode && (
              <div className="flex justify-center">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-lg">
                  <img src={qrCode} alt="Booking QR Code" className="w-48 h-48" />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button variant="primary" size="lg" className="w-full">
              <Icon name="download" />
              Download Ticket
            </Button>
            <Button variant="secondary" size="lg" className="w-full" onClick={() => navigate('/')}>
              Book Another Trip
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
