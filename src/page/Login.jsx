import React, { useState } from 'react';
import './Login.css';
import axios from "axios";
import { useUserContext } from "../context/LoginContext";

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading } = useUserContext();
    const [error, setError] = useState(null);

    const loginNow = async () => {
        setError(null); // Clear previous errors

        // Validate if fields are empty
        if (!username) {
            setError("Please enter your email.");
            return;
        }
        if (!password) {
            setError("Please enter your password.");
            return;
        }

        try {
            // Send the login request
            const response = await axios.post(
                "http://localhost:8080/authenticate",
                { username, password },
                { headers: { "Content-Type": "application/json" } }
            );

            // Adjust token retrieval based on backend response
            login(response.data.token || response.data.jwt); 

        } catch (error) {
            // Check the error response to identify the issue
            if (error.response) {
                // Check for wrong email/password (assuming backend returns 401 status for this)
                if (error.response.status === 401) {
                    setError("Incorrect email or password. Please try again.");
                } else {
                    // Other error responses from the server
                    setError("Login failed. Please check your credentials.");
                }
            } else {
                // If no response, it’s likely a network or system failure
                setError("System error. Please try again later.");
            }

            // Log full error for debugging
            console.error("Login failed:", error.response?.data || error.message);
        }
    };

    return (
        <div className="login-container">
            <div className="login-title-form-container">
                <h1 className="login-title">Login</h1>
                
                {/* Form submission handled by onSubmit for cleaner code */}
                <form 
                    className="login-form"
                    onSubmit={(e) => { e.preventDefault(); loginNow(); }}
                >
                    {/* Username input */}
                    <input 
                        type="email"
                        placeholder="Email"
                        className="login-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    
                    {/* Password input */}
                    <input 
                        type="password"
                        placeholder="Password"
                        className="login-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    
                    {/* Submit button */}
                    <button 
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                    
                    {/* Error message */}
                    {error && <p className="error-message">{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default Login;
