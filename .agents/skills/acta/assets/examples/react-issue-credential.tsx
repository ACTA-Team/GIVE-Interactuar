import { useCredential } from '@acta-team/acta-sdk';
import freighter from '@stellar/freighter-api';
import { useState } from 'react';

/**
 * Example component for issuing verifiable credentials
 *
 * This component demonstrates:
 * - Creating a W3C VC 2.0 compliant credential
 * - Generating unique credential IDs
 * - Using the useCredential hook
 * - Handling Freighter wallet signing
 * - Error handling and user feedback
 */
export function IssueCredential() {
  const { issue } = useCredential();
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [issuedVcId, setIssuedVcId] = useState<string | null>(null);

  const handleIssue = async () => {
    try {
      setIsLoading(true);
      setStatus('Connecting to Freighter wallet...');

      // Get wallet address from Freighter
      const walletAddress = await freighter.getPublicKey();

      setStatus('Preparing credential...');

      // Generate unique credential ID
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const uniqueId = `${timestamp}-${randomId}`;
      const vcId = `vc:education:degree:${uniqueId}`;

      // Create W3C VC 2.0 compliant credential
      const credential = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'EducationCredential'],
        credentialSubject: {
          id: `did:pkh:stellar:testnet:${walletAddress}`,
          degree: 'Bachelor of Science',
          major: 'Computer Science',
          university: 'Example University',
          graduationDate: '2024-05-15',
          gpa: '3.8'
        }
      };

      setStatus('Requesting signature from Freighter...');

      // Issue credential (will prompt Freighter for signature)
      await issue({
        owner: walletAddress,
        vcId: vcId,
        vcData: JSON.stringify(credential),
        issuer: walletAddress,  // Self-issued credential
        issuerDid: `did:pkh:stellar:testnet:${walletAddress}`,
        signTransaction: freighter.signTransaction
      });

      setIssuedVcId(vcId);
      setStatus(`✅ Credential issued successfully!`);
    } catch (error: any) {
      if (error.message?.includes('User declined')) {
        setStatus('❌ Transaction cancelled by user');
      } else if (error.message?.includes('Vault')) {
        setStatus('❌ Vault not found. Create a vault first.');
      } else if (error.message?.includes('authorized')) {
        setStatus('❌ Issuer not authorized for this vault');
      } else {
        setStatus(`❌ Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Issue Education Credential</h2>

      <div className="mb-4">
        <p className="text-gray-600 mb-2">
          This will issue a Bachelor's degree credential to your vault.
        </p>
        <p className="text-sm text-gray-500">
          ⚠️ Credentials are permanent and cannot be deleted.
        </p>
      </div>

      <button
        onClick={handleIssue}
        disabled={isLoading}
        className={`w-full py-2 px-4 rounded font-semibold text-white ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isLoading ? 'Issuing...' : 'Issue Credential'}
      </button>

      {status && (
        <div className={`mt-4 p-3 rounded ${
          status.startsWith('✅') ? 'bg-green-100 text-green-800' :
          status.startsWith('❌') ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {status}
        </div>
      )}

      {issuedVcId && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm font-semibold mb-1">Credential ID:</p>
          <p className="text-xs font-mono break-all">{issuedVcId}</p>
          <p className="text-xs text-gray-600 mt-2">
            Save this ID to verify the credential later.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Advanced example with custom credential data
 */
export function IssueCustomCredential() {
  const { issue } = useCredential();
  const [formData, setFormData] = useState({
    degree: 'Bachelor of Science',
    major: 'Computer Science',
    university: '',
    graduationDate: '',
    gpa: ''
  });
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setStatus('Preparing credential...');

      const walletAddress = await freighter.getPublicKey();
      const vcId = `vc:education:degree:${Date.now()}-${Math.random().toString(36).substring(7)}`;

      const credential = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'EducationCredential'],
        credentialSubject: {
          id: `did:pkh:stellar:testnet:${walletAddress}`,
          degree: formData.degree,
          major: formData.major,
          university: formData.university,
          graduationDate: formData.graduationDate,
          ...(formData.gpa && { gpa: formData.gpa })
        }
      };

      setStatus('Requesting signature...');

      await issue({
        owner: walletAddress,
        vcId: vcId,
        vcData: JSON.stringify(credential),
        issuer: walletAddress,
        issuerDid: `did:pkh:stellar:testnet:${walletAddress}`,
        signTransaction: freighter.signTransaction
      });

      setStatus(`✅ Credential issued! ID: ${vcId}`);

      // Reset form
      setFormData({
        degree: 'Bachelor of Science',
        major: 'Computer Science',
        university: '',
        graduationDate: '',
        gpa: ''
      });
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Issue Custom Credential</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Degree</label>
          <input
            type="text"
            value={formData.degree}
            onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Major</label>
          <input
            type="text"
            value={formData.major}
            onChange={(e) => setFormData({ ...formData, major: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">University</label>
          <input
            type="text"
            value={formData.university}
            onChange={(e) => setFormData({ ...formData, university: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Graduation Date</label>
          <input
            type="date"
            value={formData.graduationDate}
            onChange={(e) => setFormData({ ...formData, graduationDate: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">GPA (optional)</label>
          <input
            type="text"
            value={formData.gpa}
            onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            placeholder="e.g., 3.8"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded font-semibold text-white ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Issuing...' : 'Issue Credential'}
        </button>
      </form>

      {status && (
        <div className={`mt-4 p-3 rounded ${
          status.startsWith('✅') ? 'bg-green-100 text-green-800' :
          status.startsWith('❌') ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {status}
        </div>
      )}
    </div>
  );
}
