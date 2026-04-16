import React, { useState } from 'react';

function App() {
    // State for Step 1 (Validation)
    const [reference, setReference] = useState('');
    const [isValidated, setIsValidated] = useState(false);
    
    // State for Step 2 (User Details)
    const [details, setDetails] = useState({
        name: '',
        surname: '',
        cellNumber: '',
        studentNumber: ''
    });

    // Global State
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState(null); 
    const [isLoading, setIsLoading] = useState(false);

    // API URL (Update this when hosting on Azure)
    const API_BASE_URL = 'https://choir-api-live-a9djdxashjhhfzec.canadacentral-01.azurewebsites.net/api/tickets';

    // --- STEP 1: Validate Reference Number ---
    const handleValidate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        // Updated Regex: Allows "2026-01", "2026-01 XXD", "2026-120ABC"
        const isValidFormat = /^2026-\d{2,3}(?:\s*[a-zA-Z]+)?$/.test(reference.trim());
        
        if (!isValidFormat) {
            setStatus('error');
            setMessage("Invalid format. Must start with 2026- followed by your ticket number.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/validate/${reference.trim()}`);
            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(data.message);
                setIsValidated(true); // This unlocks the rest of the form!
            } else {
                setStatus('error');
                setMessage(data.message);
            }
        } catch (error) {
            setStatus('error');
            setMessage('Cannot connect to server. Ensure API is running.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- STEP 2: Submit Details ---
    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch(`${API_BASE_URL}/claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    referenceNumber: reference.trim(),
                    name: details.name,
                    surname: details.surname,
                    cellNumber: details.cellNumber,
                    studentNumber: details.studentNumber
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(data.message);
                // Reset everything for the next person
                setIsValidated(false);
                setReference('');
                setDetails({ name: '', surname: '', cellNumber: '', studentNumber: '' });
            } else {
                setStatus('error');
                setMessage(data.message);
            }
        } catch (error) {
            setStatus('error');
            setMessage('Error saving details.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setDetails({ ...details, [e.target.name]: e.target.value });
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f4f9', fontFamily: 'sans-serif' }}>
            <div style={{ padding: '30px', width: '100%', maxWidth: '400px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Choir Ticket Registration</h2>
                
                {/* --- UI FOR STEP 1: VALIDATION --- */}
                {!isValidated && (
                    <form onSubmit={handleValidate}>
                        <input
                            type="text"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            placeholder="Enter Ticket Number (e.g. 2026-01XP)"
                            style={inputStyle}
                            required
                        />
                        <button type="submit" disabled={isLoading} style={buttonStyle(isLoading)}>
                            {isLoading ? 'Checking...' : 'Check Ticket'}
                        </button>
                    </form>
                )}

                {/* --- UI FOR STEP 2: ENTER DETAILS --- */}
                {isValidated && (
                    <form onSubmit={handleFinalSubmit}>
                        <div style={{ marginBottom: '15px', color: '#28a745', fontWeight: 'bold', textAlign: 'center' }}>
                            Ticket {reference} is valid!
                        </div>
                        <input type="text" name="name" value={details.name} onChange={handleInputChange} placeholder="First Name" style={inputStyle} required />
                        <input type="text" name="surname" value={details.surname} onChange={handleInputChange} placeholder="Surname" style={inputStyle} required />
                        <input type="tel" name="cellNumber" value={details.cellNumber} onChange={handleInputChange} placeholder="Cell Number" style={inputStyle} required />
                        <input type="text" name="studentNumber" value={details.studentNumber} onChange={handleInputChange} placeholder="Student Number" style={inputStyle} required />
                        
                        <button type="submit" disabled={isLoading} style={buttonStyle(isLoading)}>
                            {isLoading ? 'Saving...' : 'Register Ticket'}
                        </button>
                    </form>
                )}

                {/* --- MESSAGES --- */}
                {message && (
                    <div style={{ 
                        marginTop: '20px', padding: '15px', fontWeight: 'bold', textAlign: 'center', color: 'white',
                        backgroundColor: status === 'success' ? '#28a745' : '#dc3545', borderRadius: '5px'
                    }}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}

// Styling objects to keep code clean
const inputStyle = { width: '94%', padding: '12px', marginBottom: '15px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px' };
const buttonStyle = (isLoading) => ({ width: '100%', padding: '12px', fontSize: '16px', fontWeight: 'bold', color: 'white', backgroundColor: isLoading ? '#999' : '#007bff', border: 'none', borderRadius: '5px', cursor: isLoading ? 'not-allowed' : 'pointer' });

export default App;