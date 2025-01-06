import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import supabase from '../utils/supabase';

const TwoFactorAuth = () => {
  const [step, setStep] = useState('setup'); // setup, verify, enabled
  const [code, setCode] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);

  const setup2FA = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('setup-2fa');
      if (error) throw error;
      setQrCode(data.qrCode);
      setBackupCodes(data.backupCodes);
      setStep('verify');
    }
  });

  const verify2FA = useMutation({
    mutationFn: async (code) => {
      const { error } = await supabase.functions.invoke('verify-2fa', {
        body: { code }
      });
      if (error) throw error;
      setStep('enabled');
    },
    onSuccess: () => {
      toast.success('Two-factor authentication enabled');
    }
  });

  const disable2FA = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.functions.invoke('disable-2fa');
      if (error) throw error;
      setStep('setup');
    },
    onSuccess: () => {
      toast.success('Two-factor authentication disabled');
    }
  });

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Two-Factor Authentication</h2>

      {step === 'setup' && (
        <div className="text-center">
          <p className="mb-4">
            Enhance your account security with two-factor authentication
          </p>
          <button
            onClick={() => setup2FA.mutate()}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Set up 2FA
          </button>
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <img src={qrCode} alt="QR Code" className="w-48 h-48" />
          </div>
          <p className="text-sm text-center">
            Scan this QR code with your authenticator app
          </p>
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-medium mb-2">Backup Codes</h3>
            <p className="text-sm text-gray-600 mb-2">
              Save these backup codes in a secure place. You can use them to access your account if you lose your authenticator device.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <div
                  key={index}
                  className="font-mono text-sm bg-white p-2 rounded border"
                >
                  {code}
                </div>
              ))}
            </div>
          </div>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter verification code"
            className="w-full p-2 border rounded"
          />
          <button
            onClick={() => verify2FA.mutate(code)}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded"
          >
            Verify
          </button>
        </div>
      )}

      {step === 'enabled' && (
        <div className="text-center">
          <p className="text-green-600 mb-4">
            Two-factor authentication is enabled
          </p>
          <button
            onClick={() => disable2FA.mutate()}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Disable 2FA
          </button>
        </div>
      )}
    </div>
  );
};

export default TwoFactorAuth; 