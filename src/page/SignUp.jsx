import './SignUp.css';
import { useState } from 'react';
import axios from 'axios';

const SignUp = () => {
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [description, setDescription] = useState('');
    const [logo, setLogo] = useState('');
    const [signUpSuccess, setSignUpSuccess] = useState(false);

    const handleSignUp = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        // Prepare data for UserInputDTO
        const userData = {
            name: username,
            email: email,
            role: role,
            password: password
        };

        // Prepare data for BusinessInputDTO if role requires it
        const businessData = (role === 'ROLE_ADMIN' || role === 'ROLE_SUPPORT_AGENT') ? {
            name: businessName,
            description: description,
            logo: logo
        } : null;

        try {
            const response = await axios.post('http://localhost:8080/api/users/signup', {
                user: userData,
                business: businessData
            });

            console.log('User Created Response:', response.data);
            setSignUpSuccess(true);
            alert('Sign up successful!');
            resetForm();
        } catch (error) {
            setSignUpSuccess(false);
            console.error('Error during sign up:', error);
            const errorMessage = error.response?.data?.message || 'An unexpected error occurred during sign up. Please try again.';
            alert(`Error: ${errorMessage}`);
        }
    };

    const resetForm = () => {
        setUsername('');
        setRole('');
        setBusinessName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setDescription('');
        setLogo('');
        setSignUpSuccess(false);
    };

    return (
        <div className="signup-container">
            <div className="signup-title-form-container">
                <h1 className="signup-title">Sign Up</h1>
                <form className="signup-form" onSubmit={handleSignUp}>
                    <input
                        type="text"
                        placeholder="Username"
                        className="signup-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <select
                        value={role}
                        className="signup-select"
                        onChange={(e) => setRole(e.target.value)}
                        required
                    >
                        <option value="">Select Role</option>
                        <option value="ROLE_USER">User</option>
                        <option value="ROLE_ADMIN">Admin</option>
                        <option value="ROLE_SUPPORT_AGENT">Support Agent</option>
                    </select>
                    {(role === 'ROLE_ADMIN' || role === 'ROLE_SUPPORT_AGENT') && (
                        <>
                            <input
                                type="text"
                                placeholder="Business Name"
                                className="signup-input"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                required
                            />
                            <textarea
                                placeholder="Description"
                                className="signup-input"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                            <input
                                type="url"
                                placeholder="Logo URL"
                                className="signup-input"
                                value={logo}
                                onChange={(e) => setLogo(e.target.value)}
                                required
                            />
                        </>
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        className="signup-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="signup-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        className="signup-input"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="signup-button">Sign Up</button>
                </form>
                {signUpSuccess && (
                    <p className="signup-success-message">
                        Sign up successful! You can now log in with your credentials.
                    </p>
                )}
            </div>
        </div>
    );
};

export default SignUp;

