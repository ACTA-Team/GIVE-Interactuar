import { useVaultRead } from '@acta-team/acta-sdk';
import freighter from '@stellar/freighter-api';
import { useState } from 'react';

/**
 * Example component for verifying verifiable credentials
 *
 * This component demonstrates:
 * - Using the useVaultRead hook
 * - Verifying credential validity
 * - Parsing and displaying credential data
 * - Error handling for invalid credentials
 * - No wallet signature required (read-only operation)
 */
export function VerifyCredential() {
  const { verifyVc } = useVaultRead();
  const [vcId, setVcId] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    try {
      setIsLoading(true);
      setResult(null);

      // If no owner address provided, use current wallet
      let owner = ownerAddress;
      if (!owner) {
        owner = await freighter.getPublicKey();
      }

      // Verify credential (no signature required - read-only)
      const verification = await verifyVc({
        owner: owner,
        vcId: vcId
      });

      if (verification.isValid) {
        // Parse credential data
        const credential = JSON.parse(verification.vcData);

        setResult({
          valid: true,
          credential: credential,
          owner: owner
        });
      } else {
        setResult({
          valid: false,
          error: 'Credential is not valid or does not exist',
          possibleReasons: [
            'Credential ID is incorrect',
            'Credential does not exist in this vault',
            'Issuer has been revoked',
            'Owner address is incorrect'
          ]
        });
      }
    } catch (error: any) {
      setResult({
        valid: false,
        error: error.message || 'Verification failed',
        possibleReasons: [
          'Network connection issue',
          'Invalid wallet address format',
          'API key not configured'
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseCurrentWallet = async () => {
    try {
      const address = await freighter.getPublicKey();
      setOwnerAddress(address);
    } catch (error) {
      alert('Please install and connect Freighter wallet');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Verify Credential</h2>

      <div className="space-y-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Credential ID
          </label>
          <input
            type="text"
            value={vcId}
            onChange={(e) => setVcId(e.target.value)}
            placeholder="vc:education:degree:12345"
            className="w-full px-3 py-2 border rounded font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Vault Owner Address
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={ownerAddress}
              onChange={(e) => setOwnerAddress(e.target.value)}
              placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              className="flex-1 px-3 py-2 border rounded font-mono text-sm"
            />
            <button
              onClick={handleUseCurrentWallet}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            >
              Use My Wallet
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to use your connected wallet address
          </p>
        </div>
      </div>

      <button
        onClick={handleVerify}
        disabled={isLoading || !vcId}
        className={`w-full py-2 px-4 rounded font-semibold text-white ${
          isLoading || !vcId
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {isLoading ? 'Verifying...' : 'Verify Credential'}
      </button>

      {result && (
        <div className="mt-6">
          {result.valid ? (
            <div className="border border-green-500 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">✅</span>
                <h3 className="text-xl font-bold text-green-700">
                  Valid Credential
                </h3>
              </div>

              <div className="bg-gray-50 rounded p-4">
                <h4 className="font-semibold mb-2">Credential Details:</h4>
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(result.credential, null, 2)}
                </pre>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                <p><strong>Owner:</strong> <span className="font-mono">{result.owner}</span></p>
                <p><strong>Type:</strong> {result.credential.type?.join(', ')}</p>
                <p><strong>Subject ID:</strong> <span className="font-mono text-xs">{result.credential.credentialSubject?.id}</span></p>
              </div>

              {/* Display credential-specific fields */}
              {result.credential.type?.includes('EducationCredential') && (
                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <h4 className="font-semibold text-blue-900 mb-2">Education Details:</h4>
                  <ul className="text-sm space-y-1">
                    {result.credential.credentialSubject.degree && (
                      <li><strong>Degree:</strong> {result.credential.credentialSubject.degree}</li>
                    )}
                    {result.credential.credentialSubject.major && (
                      <li><strong>Major:</strong> {result.credential.credentialSubject.major}</li>
                    )}
                    {result.credential.credentialSubject.university && (
                      <li><strong>University:</strong> {result.credential.credentialSubject.university}</li>
                    )}
                    {result.credential.credentialSubject.graduationDate && (
                      <li><strong>Graduation:</strong> {result.credential.credentialSubject.graduationDate}</li>
                    )}
                    {result.credential.credentialSubject.gpa && (
                      <li><strong>GPA:</strong> {result.credential.credentialSubject.gpa}</li>
                    )}
                  </ul>
                </div>
              )}

              {result.credential.type?.includes('EmploymentCredential') && (
                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <h4 className="font-semibold text-blue-900 mb-2">Employment Details:</h4>
                  <ul className="text-sm space-y-1">
                    {result.credential.credentialSubject.jobTitle && (
                      <li><strong>Job Title:</strong> {result.credential.credentialSubject.jobTitle}</li>
                    )}
                    {result.credential.credentialSubject.employer && (
                      <li><strong>Employer:</strong> {result.credential.credentialSubject.employer}</li>
                    )}
                    {result.credential.credentialSubject.startDate && (
                      <li><strong>Start Date:</strong> {result.credential.credentialSubject.startDate}</li>
                    )}
                    {result.credential.credentialSubject.endDate && (
                      <li><strong>End Date:</strong> {result.credential.credentialSubject.endDate}</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-red-500 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">❌</span>
                <h3 className="text-xl font-bold text-red-700">
                  Invalid Credential
                </h3>
              </div>

              <div className="bg-red-50 rounded p-4 mb-3">
                <p className="text-red-800 font-semibold">{result.error}</p>
              </div>

              {result.possibleReasons && (
                <div>
                  <h4 className="font-semibold mb-2">Possible Reasons:</h4>
                  <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                    {result.possibleReasons.map((reason: string, index: number) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Simplified verification component
 */
export function QuickVerify() {
  const { verifyVc } = useVaultRead();
  const [vcId, setVcId] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickVerify = async () => {
    try {
      setIsLoading(true);
      setIsValid(null);

      const owner = await freighter.getPublicKey();
      const verification = await verifyVc({ owner, vcId });

      setIsValid(verification.isValid);
    } catch (error) {
      setIsValid(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="font-bold mb-2">Quick Verify</h3>

      <div className="flex gap-2">
        <input
          type="text"
          value={vcId}
          onChange={(e) => setVcId(e.target.value)}
          placeholder="Enter credential ID"
          className="flex-1 px-3 py-2 border rounded text-sm"
        />
        <button
          onClick={handleQuickVerify}
          disabled={isLoading || !vcId}
          className={`px-4 py-2 rounded font-semibold text-white ${
            isLoading || !vcId
              ? 'bg-gray-400'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isLoading ? '...' : 'Verify'}
        </button>
      </div>

      {isValid !== null && (
        <div className={`mt-2 p-2 rounded text-center font-semibold ${
          isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isValid ? '✅ Valid' : '❌ Invalid'}
        </div>
      )}
    </div>
  );
}

/**
 * Batch verification component
 */
export function BatchVerify() {
  const { verifyVc } = useVaultRead();
  const [vcIds, setVcIds] = useState<string[]>(['']);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addCredentialField = () => {
    setVcIds([...vcIds, '']);
  };

  const updateVcId = (index: number, value: string) => {
    const updated = [...vcIds];
    updated[index] = value;
    setVcIds(updated);
  };

  const handleBatchVerify = async () => {
    try {
      setIsLoading(true);
      setResults([]);

      const owner = await freighter.getPublicKey();

      // Verify all credentials
      const verifications = await Promise.all(
        vcIds
          .filter(id => id.trim())
          .map(async (vcId) => {
            try {
              const verification = await verifyVc({ owner, vcId });
              return {
                vcId,
                isValid: verification.isValid,
                credential: verification.isValid ? JSON.parse(verification.vcData) : null
              };
            } catch (error) {
              return {
                vcId,
                isValid: false,
                error: 'Verification failed'
              };
            }
          })
      );

      setResults(verifications);
    } catch (error) {
      alert('Batch verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Batch Verify Credentials</h2>

      <div className="space-y-2 mb-4">
        {vcIds.map((vcId, index) => (
          <input
            key={index}
            type="text"
            value={vcId}
            onChange={(e) => updateVcId(index, e.target.value)}
            placeholder={`Credential ID ${index + 1}`}
            className="w-full px-3 py-2 border rounded font-mono text-sm"
          />
        ))}
        <button
          onClick={addCredentialField}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          + Add another credential
        </button>
      </div>

      <button
        onClick={handleBatchVerify}
        disabled={isLoading || vcIds.every(id => !id.trim())}
        className={`w-full py-2 px-4 rounded font-semibold text-white ${
          isLoading || vcIds.every(id => !id.trim())
            ? 'bg-gray-400'
            : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {isLoading ? 'Verifying...' : `Verify ${vcIds.filter(id => id.trim()).length} Credentials`}
      </button>

      {results.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="font-bold">Results:</h3>
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-3 rounded border ${
                result.isValid
                  ? 'border-green-500 bg-green-50'
                  : 'border-red-500 bg-red-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">{result.vcId}</span>
                <span className="font-semibold">
                  {result.isValid ? '✅ Valid' : '❌ Invalid'}
                </span>
              </div>
              {result.credential && (
                <p className="text-sm text-gray-600 mt-1">
                  {result.credential.type?.filter((t: string) => t !== 'VerifiableCredential').join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
