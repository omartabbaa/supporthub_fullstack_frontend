import './navbar.css';
import logo from '../assets/Logo/navbarLogo.png';
import { Link } from 'react-router-dom';
import BusinessIcon from '../assets/Button/navbar/BusinessIcon.png';
import AdminIcon from '../assets/Button/navbar/AdminIcon.png';
import NotificationIcon from '../assets/Button/navbar/NotificationIcon.png';
import { useState, useEffect, useRef } from 'react';
import { useUserContext } from "../context/LoginContext";
import axios from 'axios';

const Navbar = () => {
    const { logout, isLogin, role, stateBusinessId } = useUserContext(); // Changed businessId to stateBusinessId
    
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [businessName, setBusinessName] = useState('');
    const notificationRef = useRef(null);
    const profileRef = useRef(null);

    const toggleNotification = () => setIsNotificationOpen(prev => !prev);
    const toggleProfile = () => setIsProfileOpen(prev => !prev);

    const closeDropdowns = (event) => {
        if (notificationRef.current && !notificationRef.current.contains(event.target)) {
            setIsNotificationOpen(false);
        }
        if (profileRef.current && !profileRef.current.contains(event.target)) {
            setIsProfileOpen(false);
        }
    };

    const handleLogout = () => logout();

    const fetchBusinesses = async () => {
        if (!stateBusinessId) return; // Ensure stateBusinessId is available before fetching
        
        try {
            const response = await axios.get(`http://localhost:8080/api/businesses/${stateBusinessId}`);
            setBusinessName(response.data.name); // Assuming the response has a `name` property
            console.log("Fetched business name:", response.data.name);
            console.log("dfjjdsnfkjs",businessName)
        } catch (error) {
            console.error("Error fetching business:", error);
        }
    };

    useEffect(() => {
        fetchBusinesses(); // Fetch the business name when the component mounts or stateBusinessId changes
        document.addEventListener('mousedown', closeDropdowns);
        return () => {
            document.removeEventListener('mousedown', closeDropdowns);
        };
    }, [stateBusinessId]); // Add stateBusinessId as a dependency so it refetches if stateBusinessId changes

    useEffect(() => {
        console.log("Business id:", stateBusinessId);
    }, []);

    return (
        <div className='navbar'>
            <div className='navbar-container'>
                <div className='navbar-left'>
                    <Link to="/">
                        <img className='logo-img' src={logo} alt="logo" />
                    </Link>

                    <Link className='navbar-link' to="/business-overview">
                        Business
                        <img className='business-icon' src={BusinessIcon} alt="BusinessIcon" />
                    </Link>

                    {stateBusinessId && (
                    <Link className='navbar-link' to={`/department-project-management/${stateBusinessId}/${businessName}`}>
                        {businessName || "My Business"} {/* Display businessName or fallback text */}
                    </Link>

                    )}
                </div>
                <div className='navbar-right'>
                    {role === "ROLE_ADMIN" && (
                        <Link className='navbar-link' to="/admin-dashboard">
                            Dashboard 
                            <img className='admin-icon' src={AdminIcon} alt="AdminIcon" />
                        </Link>
                    )}
                    
                    {/* Notification Dropdown */}
                    <div className='dropdown-container' ref={notificationRef}>
                        <img
                            onClick={toggleNotification}
                            className='notification-icon'
                            src={NotificationIcon}
                            alt="NotificationIcon"
                        />
                        {isNotificationOpen && (
                            <div className='notification-dropdown'>
                                <h3>Notifications</h3>
                                <ul>
                                    <li>Notification 1</li>
                                    <li>Notification 2</li>
                                    <li>Notification 3</li>
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Profile Dropdown */}
                    <div className='dropdown-container' ref={profileRef}>
                        <div onClick={toggleProfile} className='profile'></div>
                        {isProfileOpen && (
                            <div className='profile-dropdown'>
                                <h3>Profile</h3>
                                <ul>
                                    <Link to="/signup"><li>Signup</li></Link>
                                    {isLogin ? (
                                        <button onClick={handleLogout}>Logout</button>
                                    ) : (
                                        <Link to="/login"><li>Login</li></Link>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
